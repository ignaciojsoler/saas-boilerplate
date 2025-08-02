import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  console.log('GET request received', request);
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener la suscripción actual del usuario
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plans:plan_id (
          id,
          name,
          price,
          currency
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }

    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    // Formatear la respuesta
    const formattedSubscription = {
      id: subscription.id,
      plan_id: subscription.plan_id,
      plan_name: subscription.plans?.name || 'Plan Desconocido',
      amount: subscription.plans?.price || 0,
      currency: subscription.plans?.currency || 'USD',
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      created_at: subscription.created_at,
      updated_at: subscription.updated_at
    };

    return NextResponse.json({ subscription: formattedSubscription });

  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 