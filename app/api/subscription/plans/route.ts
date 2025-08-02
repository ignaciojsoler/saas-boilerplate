import { NextResponse } from 'next/server';
import { getSubscriptionPlans } from '@/lib/supabase/subscriptions';

export async function GET() {
  try {
    // Obtener todos los planes de suscripción
    const plans = await getSubscriptionPlans();

    return NextResponse.json({ 
      plans,
      success: true 
    });

  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 