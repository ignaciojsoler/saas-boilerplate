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
import { mercadopagoApi } from '@/lib/mercadopago/api';

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
    let subscriptionData = body.data as PreapprovalData | undefined;
    if (!subscriptionData) {
      return NextResponse.json({ error: 'No subscription data' }, { status: 400 });
    }

    const { id: mercadopago_id } = subscriptionData;

    // Enriquecer desde MP si faltan datos esenciales
    if (!('payer_email' in subscriptionData) || !('external_reference' in subscriptionData)) {
      const fetched = await mercadopagoApi.getPreapprovalById(mercadopago_id.toString());
      if (fetched) {
        subscriptionData = {
          ...subscriptionData,
          payer_email: fetched.payer_email,
          external_reference: fetched.external_reference,
          status: fetched.status,
          auto_recurring: fetched.auto_recurring,
          reason: fetched.reason,
          back_url: fetched.back_url,
          collector_id: fetched.collector_id,
          application_id: fetched.application_id,
          init_point: fetched.init_point,
          sandbox_init_point: fetched.sandbox_init_point,
        } as PreapprovalData;
      }
    }

    const { payer_email, external_reference } = subscriptionData as PreapprovalData;

    const userId = await this.service.findUserByEmail(payer_email);
    if (!userId) {
      console.error('User not found:', payer_email);
      // Evitamos reintentos innecesarios de MP; registramos e ignoramos
      return NextResponse.json({ status: 'ignored', reason: 'user_not_found' });
    }

    const planId = planIdFromExternalRef(external_reference);

    const existingSubscription = await getSubscriptionByMercadoPagoId(mercadopago_id.toString());

    if (existingSubscription) {
      await this.service.handleSubscriptionUpdate(existingSubscription as SubscriptionRow, subscriptionData as PreapprovalData);
    } else {
      await this.service.handleSubscriptionCreation(subscriptionData as PreapprovalData, userId, planId);
    }

    return NextResponse.json({ status: 'success' });
  }

  async handlePayment(body: WebhookData): Promise<NextResponse> {
    const paymentData = body.data as PaymentData | undefined;
    if (!paymentData) {
      return NextResponse.json({ error: 'No payment data' }, { status: 400 });
    }

    const preapprovalId = (paymentData as { preapproval_id?: string | number }).preapproval_id;
    const relatedId = (paymentData.subscription_id ?? preapprovalId)?.toString() || '';

    const subscription = await getSubscriptionByMercadoPagoId(relatedId);

    if (!subscription) {
      console.log('No subscription found for payment:', paymentData.id, 'lookup:', relatedId);
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
      subscription_authorized_payment: handlers.handlePayment.bind(handlers),
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