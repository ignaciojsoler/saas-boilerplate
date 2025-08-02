import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Webhook received:', body);

    // Verificar que es un evento de suscripción
    if (body.type !== 'subscription_preapproval') {
      return NextResponse.json({ status: 'ignored' });
    }

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
      auto_recurring
    } = subscriptionData;

    // Extraer el plan de la referencia externa
    const planId = external_reference?.split('_')[0] || 'basic';

    // Buscar o crear el usuario por email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', payer_email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error finding user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let userId = user?.id;

    // Si no existe el usuario, crear uno temporal (esto debería manejarse mejor en producción)
    if (!userId) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: payer_email,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      userId = newUser.id;
    }

    // Actualizar o crear la suscripción
    const subscriptionDataToUpsert = {
      user_id: userId,
      mercadopago_id: mercadopago_id,
      plan_id: planId,
      status: status === 'authorized' ? 'active' : status,
      amount: auto_recurring?.transaction_amount || 0,
      currency: auto_recurring?.currency_id || 'ARS',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
      updated_at: new Date().toISOString()
    };

    const { error: upsertError } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionDataToUpsert, {
        onConflict: 'mercadopago_id'
      });

    if (upsertError) {
      console.error('Error upserting subscription:', upsertError);
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    console.log('Subscription updated successfully:', mercadopago_id);
    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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