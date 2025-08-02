import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';
import { getSubscriptionPlan } from '@/lib/supabase/subscriptions';

export async function GET(request: NextRequest) {
  console.log('🚀 GET /api/mercadopago/success - Procesando redirección de MercadoPago');
  
  try {
    const { searchParams } = new URL(request.url);
    const preapprovalId = searchParams.get('preapproval_id');
    const collectionId = searchParams.get('collection_id');
    const status = searchParams.get('status');
    
    console.log('📝 Parámetros recibidos:', {
      preapprovalId,
      collectionId,
      status
    });

    if (!preapprovalId) {
      console.log('❌ Error: preapproval_id no encontrado');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/protected/billing?status=error&message=${encodeURIComponent('ID de suscripción no encontrado')}`);
    }

    // Obtener información de la suscripción desde MercadoPago
    console.log('🔄 Consultando estado de suscripción en MercadoPago...');
    const subscriptionStatus = await getMercadoPagoSubscriptionStatus(preapprovalId);
    
    console.log('📊 Estado de suscripción:', subscriptionStatus);

    if (!subscriptionStatus) {
      console.log('❌ Error: No se pudo obtener el estado de la suscripción');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/protected/billing?status=error&message=${encodeURIComponent('Error al verificar el estado de la suscripción')}`);
    }

    // Verificar el estado de la suscripción
    if (subscriptionStatus.status === 'authorized') {
      console.log('✅ Suscripción autorizada - Guardando en base de datos...');
      
      // Obtener el usuario actual
      const supabase = await createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('❌ Error: Usuario no autenticado');
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/protected/billing?status=error&message=${encodeURIComponent('Usuario no autenticado')}`);
      }

      // Extraer información del plan desde external_reference
      const externalReference = subscriptionStatus.external_reference;
      const planId = externalReference?.split('_')[0] || 'basic';
      
      console.log('📋 Plan ID extraído:', planId);
      
      // Obtener información del plan
      const plan = await getSubscriptionPlan(planId);
      if (!plan) {
        console.log('❌ Error: Plan no encontrado:', planId);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/protected/billing?status=error&message=${encodeURIComponent('Plan no encontrado')}`);
      }

      // Crear la suscripción en nuestra base de datos
      const { data: subscription, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          mercadopago_id: preapprovalId,
          status: 'active',
          amount: plan.price,
          currency: plan.currency,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
          metadata: {
            mercadopago_status: subscriptionStatus.status,
            payer_email: subscriptionStatus.payer_email,
            external_reference: externalReference,
            collection_id: collectionId
          }
        })
        .select()
        .single();

      if (subscriptionError) {
        console.error('❌ Error al guardar suscripción:', subscriptionError);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/protected/billing?status=error&message=${encodeURIComponent('Error al guardar la suscripción')}`);
      }

      console.log('✅ Suscripción guardada exitosamente:', subscription);
      
      // Redirigir a la página de billing con éxito
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/protected/billing?status=success&subscription_id=${subscription.id}`);
      
    } else if (subscriptionStatus.status === 'pending') {
      console.log('⏳ Suscripción pendiente');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/protected/billing?status=pending&message=${encodeURIComponent('Suscripción pendiente de aprobación')}`);
      
    } else if (subscriptionStatus.status === 'cancelled') {
      console.log('❌ Suscripción cancelada');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/protected/billing?status=error&message=${encodeURIComponent('Suscripción cancelada')}`);
      
    } else {
      console.log('❌ Estado de suscripción no válido:', subscriptionStatus.status);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/protected/billing?status=error&message=${encodeURIComponent('Estado de suscripción no válido')}`);
    }

  } catch (error) {
    console.error('💥 Error completo:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/protected/billing?status=error&message=${encodeURIComponent('Error interno del servidor')}`);
  }
}

// Función para consultar el estado de una suscripción en MercadoPago
async function getMercadoPagoSubscriptionStatus(preapprovalId: string) {
  try {
    console.log('🔄 Consultando MercadoPago API para preapproval_id:', preapprovalId);
    
    const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ Error en respuesta de MercadoPago:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Error details:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Respuesta de MercadoPago:', data);
    
    return data;
  } catch (error) {
    console.error('💥 Error consultando MercadoPago:', error);
    return null;
  }
} 