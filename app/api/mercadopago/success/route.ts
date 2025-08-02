import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSubscriptionByMercadoPagoId, updateSubscription } from '@/lib/supabase/subscriptions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const preapproval_id = searchParams.get('preapproval_id');
    const status = searchParams.get('status');
    const external_reference = searchParams.get('external_reference');

    console.log('Success callback received:', { preapproval_id, status, external_reference });

    if (!preapproval_id) {
      return NextResponse.redirect(new URL('/protected/billing?error=no_preapproval_id', request.url));
    }

    // Verificar el estado de la suscripción en MercadoPago
    const mercadopagoApi = await import('@/lib/mercadopago/api');
    const subscription = await mercadopagoApi.mercadopagoApi.getSubscription(preapproval_id);

    if (!subscription) {
      console.error('Subscription not found in MercadoPago:', preapproval_id);
      return NextResponse.redirect(new URL('/protected/billing?error=subscription_not_found', request.url));
    }

    // Buscar la suscripción en nuestra base de datos
    const existingSubscription = await getSubscriptionByMercadoPagoId(preapproval_id);

    if (existingSubscription) {
      // Actualizar el estado de la suscripción
      const updateData = {
        status: subscription.status === 'authorized' ? 'active' : subscription.status,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          ...existingSubscription.metadata,
          last_success_callback: new Date().toISOString(),
          mercadopago_status: subscription.status
        }
      };

      await updateSubscription(existingSubscription.id, updateData);
      console.log('Subscription updated via success callback:', preapproval_id);
    } else {
      console.log('Subscription not found in database, will be created via webhook:', preapproval_id);
    }

    // Redirigir al usuario a la página de facturación con mensaje de éxito
    const successUrl = new URL('/protected/billing', request.url);
    successUrl.searchParams.set('success', 'subscription_activated');
    successUrl.searchParams.set('plan', external_reference?.split('_')[0] || 'basic');

    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Error in success callback:', error);
    return NextResponse.redirect(new URL('/protected/billing?error=callback_error', request.url));
  }
} 