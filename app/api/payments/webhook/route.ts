import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { client } from '@/lib/mercadopago/client';
import { Payment } from 'mercadopago';
import { WebhookData } from '@/lib/mercadopago/types';

export async function POST(request: NextRequest) {
  try {
    const body: WebhookData = await request.json();
    
    // Verificar que es una notificación de pago
    if (body.type !== 'payment') {
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data.id;
    
    // Obtener información del pago usando la nueva API
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });
    
    const supabase = await createClient();
    
    // Actualizar el estado del pago en la base de datos
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: paymentData.status,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', paymentId);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
    }

    // Si el pago fue aprobado, actualizar la suscripción del usuario
    if (paymentData.status === 'approved') {
      const { data: paymentData } = await supabase
        .from('payments')
        .select('user_id, plan_id')
        .eq('payment_id', paymentId)
        .single();

      if (paymentData) {
        // Actualizar la suscripción del usuario
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: paymentData.user_id,
            plan_id: paymentData.plan_id,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
            updated_at: new Date().toISOString()
          });

        if (subscriptionError) {
          console.error('Error updating user subscription:', subscriptionError);
        }
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
} 