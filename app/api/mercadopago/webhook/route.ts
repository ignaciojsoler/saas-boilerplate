import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  createSubscription, 
  updateSubscription, 
  getSubscriptionByMercadoPagoId,
  createSubscriptionPayment
} from '@/lib/supabase/subscriptions';
import { WebhookData } from '@/lib/mercadopago/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Webhook received:', body);

    // Registrar el evento del webhook
    const supabase = await createClient();
    await supabase
      .from('webhook_events')
      .insert({
        mercadopago_id: body.data?.id?.toString() || 'unknown',
        event_type: body.type,
        event_data: body
      });

    // Manejar diferentes tipos de eventos
    switch (body.type) {
      case 'subscription_preapproval':
        return await handleSubscriptionPreapproval(body);
      case 'payment':
        return await handlePayment(body);
      case 'subscription_authorized_payment':
        return await handleSubscriptionPayment(body);
      default:
        console.log('Unhandled webhook event type:', body.type);
        return NextResponse.json({ status: 'ignored' });
    }

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleSubscriptionPreapproval(body: WebhookData) {
  const subscriptionData = body.data;
  
  if (!subscriptionData) {
    return NextResponse.json({ error: 'No subscription data' }, { status: 400 });
  }

  const supabase = await createClient();

  // Extraer información de la suscripción
  const {
    id: mercadopago_id,
    status,
    payer_email,
    external_reference,
    auto_recurring,
    reason,
    back_url,
    collector_id,
    application_id,
    init_point,
    sandbox_init_point
  } = subscriptionData;

  // Extraer el plan de la referencia externa
  const planId = external_reference?.split('_')[0] || 'basic';

  // Buscar el usuario por email en auth.users
  const { data: user } = await supabase.auth.admin.listUsers();
  
  const targetUser = user.users.find(u => u.email === payer_email);
  
  if (!targetUser) {
    console.error('User not found:', payer_email);
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const userId = targetUser.id;

  // Verificar si ya existe una suscripción con este ID de MercadoPago
  const existingSubscription = await getSubscriptionByMercadoPagoId(mercadopago_id.toString());
  
  if (existingSubscription) {
    // Actualizar suscripción existente
    const updateData = {
      status: mapMercadoPagoStatus(status),
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        reason,
        back_url,
        collector_id,
        application_id,
        init_point,
        sandbox_init_point,
        last_webhook: new Date().toISOString()
      }
    };

    await updateSubscription(existingSubscription.id, updateData);
    console.log('Subscription updated:', mercadopago_id);
  } else {
    // Crear nueva suscripción
    const subscriptionData = {
      user_id: userId,
      plan_id: planId,
      mercadopago_id: mercadopago_id.toString(),
      amount: auto_recurring?.transaction_amount || 0,
      currency: auto_recurring?.currency_id || 'ARS',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        reason,
        back_url,
        collector_id,
        application_id,
        init_point,
        sandbox_init_point,
        created_via_webhook: true
      }
    };

    await createSubscription(subscriptionData);
    console.log('Subscription created:', mercadopago_id);
  }

  return NextResponse.json({ status: 'success' });
}

async function handlePayment(body: WebhookData) {
  const paymentData = body.data;
  
  if (!paymentData) {
    return NextResponse.json({ error: 'No payment data' }, { status: 400 });
  }

  // Buscar la suscripción relacionada con este pago
  const subscription = await getSubscriptionByMercadoPagoId(paymentData.subscription_id?.toString() || '');
  
  if (!subscription) {
    console.log('No subscription found for payment:', paymentData.id);
    return NextResponse.json({ status: 'ignored' });
  }

  // Crear registro de pago
  await createSubscriptionPayment({
    subscription_id: subscription.id,
    mercadopago_payment_id: paymentData.id.toString(),
    amount: paymentData.transaction_amount || 0,
    currency: paymentData.currency_id || 'ARS',
    status: mapPaymentStatus(paymentData.status),
    payment_method: paymentData.payment_method?.type,
    payment_type: paymentData.payment_type_id
  });

  console.log('Payment recorded:', paymentData.id);
  return NextResponse.json({ status: 'success' });
}

async function handleSubscriptionPayment(body: WebhookData) {
  const paymentData = body.data;
  
  if (!paymentData) {
    return NextResponse.json({ error: 'No payment data' }, { status: 400 });
  }

  // Buscar la suscripción relacionada
  const subscription = await getSubscriptionByMercadoPagoId(paymentData.subscription_id?.toString() || '');
  
  if (!subscription) {
    console.log('No subscription found for payment:', paymentData.id);
    return NextResponse.json({ status: 'ignored' });
  }

  // Crear registro de pago
  await createSubscriptionPayment({
    subscription_id: subscription.id,
    mercadopago_payment_id: paymentData.id.toString(),
    amount: paymentData.transaction_amount || 0,
    currency: paymentData.currency_id || 'ARS',
    status: mapPaymentStatus(paymentData.status),
    payment_method: paymentData.payment_method?.type,
    payment_type: paymentData.payment_type_id
  });

  // Actualizar estado de la suscripción si el pago fue aprobado
  if (paymentData.status === 'approved') {
    await updateSubscription(subscription.id, {
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  console.log('Subscription payment processed:', paymentData.id);
  return NextResponse.json({ status: 'success' });
}

function mapMercadoPagoStatus(status: string): 'pending' | 'active' | 'cancelled' | 'suspended' | 'expired' {
  switch (status) {
    case 'authorized':
      return 'active';
    case 'pending':
      return 'pending';
    case 'cancelled':
      return 'cancelled';
    case 'suspended':
      return 'suspended';
    default:
      return 'pending';
  }
}

function mapPaymentStatus(status: string): 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded' {
  switch (status) {
    case 'approved':
      return 'approved';
    case 'pending':
      return 'pending';
    case 'rejected':
      return 'rejected';
    case 'cancelled':
      return 'cancelled';
    case 'refunded':
      return 'refunded';
    default:
      return 'pending';
  }
}

// Manejar OPTIONS para CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 