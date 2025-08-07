import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelSubscription, getUserSubscription } from '@/lib/supabase/subscriptions';
import { mercadopagoApi } from '@/lib/mercadopago/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: subscriptionId } = await params;

    // Verificar que la suscripción pertenece al usuario
    const userSubscription = await getUserSubscription(user.id);
    
    if (!userSubscription || userSubscription.id !== subscriptionId) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Verificar que la suscripción está activa
    if (userSubscription.status !== 'active' && userSubscription.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Subscription cannot be cancelled. Only active or pending subscriptions can be cancelled.' 
      }, { status: 400 });
    }

    console.log('🔄 Iniciando cancelación de suscripción:', subscriptionId);
    console.log('📋 MercadoPago ID:', userSubscription.mercadopago_id);

    // Cancelar la suscripción en MercadoPago primero
    try {
      console.log('🔄 Cancelando en MercadoPago...');
      await mercadopagoApi.cancelSubscription(userSubscription.mercadopago_id);
      console.log('✅ Suscripción cancelada en MercadoPago');
    } catch (mercadopagoError) {
      console.error('❌ Error cancelando en MercadoPago:', mercadopagoError);
      // Continuar con la cancelación en Supabase incluso si falla en MercadoPago
      // para mantener consistencia en nuestra base de datos
    }

    // Cancelar la suscripción en Supabase
    console.log('🔄 Cancelando en Supabase...');
    await cancelSubscription(subscriptionId);
    console.log('✅ Suscripción cancelada en Supabase');

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