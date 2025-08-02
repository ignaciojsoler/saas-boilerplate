import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelSubscription, getUserSubscription } from '@/lib/supabase/subscriptions';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptionId = params.id;

    // Verificar que la suscripción pertenece al usuario
    const userSubscription = await getUserSubscription(user.id);
    
    if (!userSubscription || userSubscription.id !== subscriptionId) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Cancelar la suscripción
    await cancelSubscription(subscriptionId);

    return NextResponse.json({ 
      success: true,
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 