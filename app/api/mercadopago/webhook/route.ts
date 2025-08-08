import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  createSubscription, 
  updateSubscription, 
  getSubscriptionByMercadoPagoId,
  createSubscriptionPayment
} from '@/lib/supabase/subscriptions';
import { PaymentData, PreapprovalData, WebhookData } from '@/lib/mercadopago/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SubscriptionStatus } from '@/lib/mercadopago/constants';
import { dateUtils, statusMappers, planIdFromExternalRef } from '@/lib/mercadopago/utils';

interface SubscriptionRow {
  id: string;
  status: SubscriptionStatus;
  metadata?: Record<string, unknown> | null;
  mercadopago_id?: string | null;
}

class WebhookService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async logWebhookEvent(body: WebhookData): Promise<void> {
    await this.supabase
      .from('webhook_events')
      .insert({
        mercadopago_id: body.data?.id?.toString() || 'unknown',
        event_type: body.type,
        event_data: body
      });
  }

  async findUserByEmail(email?: string): Promise<string | null> {
    if (!email) return null;

    const { data, error } = await this.supabase.auth.admin.listUsers();
    if (error) {
      console.error('Error fetching users:', error);
      return null;
    }

    const users = (data?.users as Array<{ id: string; email: string | null }> | undefined) || [];
    const targetUser = users.find(u => u.email === email);
    return targetUser?.id || null;
  }

  async handleSubscriptionCreation(subscriptionData: PreapprovalData, userId: string, planId: string): Promise<void> {
    const { status, id: mercadopago_id, auto_recurring, reason, back_url, collector_id, application_id, init_point, sandbox_init_point } = subscriptionData;

    if (!['authorized', 'pending'].includes(status)) {
      console.log('Skipping subscription creation - invalid status:', status);
      return;
    }

    const newSubscription = {
      user_id: userId,
      plan_id: planId,
      mercadopago_id: mercadopago_id.toString(),
      amount: auto_recurring?.transaction_amount || 0,
      currency: auto_recurring?.currency_id || 'ARS',
      ...dateUtils.periodRange(),
      metadata: {
        reason,
        back_url,
        collector_id,
        application_id,
        init_point,
        sandbox_init_point,
        created_via_webhook: true,
      }
    };

    await createSubscription(newSubscription);
    console.log('Subscription created:', mercadopago_id);
  }

  async handleSubscriptionUpdate(existingSubscription: SubscriptionRow, subscriptionData: PreapprovalData): Promise<void> {
    const { status, reason, back_url, collector_id, application_id, init_point, sandbox_init_point, id } = subscriptionData;

    const updateData = {
      status: statusMappers.mercadoPago(status),
      ...dateUtils.periodRange(),
      metadata: {
        ...(existingSubscription.metadata || {}),
        reason,
        back_url,
        collector_id,
        application_id,
        init_point,
        sandbox_init_point,
        last_webhook: dateUtils.nowIso(),
      }
    };

    await updateSubscription(existingSubscription.id, updateData);
    console.log('Subscription updated:', id);
  }

  async handlePaymentUpdate(subscription: SubscriptionRow, paymentData: PaymentData): Promise<void> {
    await createSubscriptionPayment({
      subscription_id: subscription.id,
      mercadopago_payment_id: paymentData.id.toString(),
      amount: paymentData.transaction_amount || 0,
      currency: paymentData.currency_id || 'ARS',
      status: statusMappers.payment(paymentData.status),
      payment_method: paymentData.payment_method?.type,
      payment_type: paymentData.payment_type_id,
    });

    await this.updateSubscriptionByPaymentStatus(subscription, paymentData);
  }

  private async updateSubscriptionByPaymentStatus(subscription: SubscriptionRow, paymentData: PaymentData): Promise<void> {
    const { status } = paymentData;
    const currentStatus = subscription.status;

    switch (status) {
      case 'approved':
        await updateSubscription(subscription.id, {
          status: 'active',
          ...dateUtils.periodRange(),
        });
        break;

      case 'rejected':
      case 'cancelled': {
        const baseMetadata = {
          ...(subscription.metadata || {}),
          last_payment_status: status,
          last_payment_date: dateUtils.nowIso(),
        };

        if (currentStatus === 'pending') {
          await updateSubscription(subscription.id, {
            status: 'cancelled',
            metadata: {
              ...baseMetadata,
              cancelled_reason: 'payment_failed',
            }
          });
        } else if (currentStatus === 'active') {
          await updateSubscription(subscription.id, {
            status: 'expired',
            metadata: {
              ...baseMetadata,
              expired_reason: 'payment_failed',
            }
          });
        }
        break;
      }
    }
  }
}

class WebhookHandlers {
  constructor(private service: WebhookService) {}

  async handleSubscriptionPreapproval(body: WebhookData): Promise<NextResponse> {
    const subscriptionData = body.data as PreapprovalData | undefined;
    if (!subscriptionData) {
      return NextResponse.json({ error: 'No subscription data' }, { status: 400 });
    }

    const { id: mercadopago_id, payer_email, external_reference } = subscriptionData;

    const userId = await this.service.findUserByEmail(payer_email);
    if (!userId) {
      console.error('User not found:', payer_email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const planId = planIdFromExternalRef(external_reference);

    const existingSubscription = await getSubscriptionByMercadoPagoId(mercadopago_id.toString());

    if (existingSubscription) {
      await this.service.handleSubscriptionUpdate(existingSubscription as SubscriptionRow, subscriptionData);
    } else {
      await this.service.handleSubscriptionCreation(subscriptionData, userId, planId);
    }

    return NextResponse.json({ status: 'success' });
  }

  async handlePayment(body: WebhookData): Promise<NextResponse> {
    const paymentData = body.data as PaymentData | undefined;
    if (!paymentData) {
      return NextResponse.json({ error: 'No payment data' }, { status: 400 });
    }

    const subscription = await getSubscriptionByMercadoPagoId(
      paymentData.subscription_id?.toString() || ''
    );

    if (!subscription) {
      console.log('No subscription found for payment:', paymentData.id);
      return NextResponse.json({ status: 'ignored' });
    }

    await this.service.handlePaymentUpdate(subscription as SubscriptionRow, paymentData);

    console.log('Payment recorded:', paymentData.id);
    return NextResponse.json({ status: 'success' });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    console.log('Webhook received:', body);

    const supabase = await createClient();
    const service = new WebhookService(supabase as unknown as SupabaseClient);
    const handlers = new WebhookHandlers(service);

    await service.logWebhookEvent(body);

    const eventHandlers: Record<string, (body: WebhookData) => Promise<NextResponse>> = {
      subscription_preapproval: handlers.handleSubscriptionPreapproval.bind(handlers),
      payment: handlers.handlePayment.bind(handlers),
    };

    const handler = eventHandlers[body.type as keyof typeof eventHandlers];
    if (!handler) {
      console.log('Unhandled webhook event type:', body.type);
      return NextResponse.json({ status: 'ignored' });
    }

    return await handler(body);
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}