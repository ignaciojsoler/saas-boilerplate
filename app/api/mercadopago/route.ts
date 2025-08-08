import { NextRequest, NextResponse } from "next/server";
import { mercadopagoApi } from "@/lib/mercadopago/api";
import { getSubscriptionPlan } from "@/lib/supabase/subscriptions";
import { cookies } from 'next/headers';
// Endpoint para crear suscripciones
export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/mercadopago - Iniciando creación de suscripción');
  
  try {
    const body = await request.json();
    console.log('📝 Body recibido:', body);
    
    const { email, planId = 'basic', userId } = body;
    console.log('📧 Email:', email);
    console.log('📋 Plan ID:', planId);

    if (!email) {
      console.log('❌ Error: Email requerido');
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }
    console.log('llega aca 1');
    // Verificar que el plan existe en la base de datos
    const plan = await getSubscriptionPlan(planId);
    console.log('llega aca 2');
    if (!plan) {
      console.log('❌ Error: Plan no válido:', planId);
      return NextResponse.json({ error: `Plan no válido: ${planId}` }, { status: 400 });
    }

    console.log('✅ Plan válido encontrado:', plan);

    // Verificar variables de entorno
    console.log('🔧 Verificando variables de entorno...');
    console.log('MERCADOPAGO_ACCESS_TOKEN:', process.env.MERCADOPAGO_ACCESS_TOKEN ? '✅ Configurado' : '❌ No configurado');
    console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL ? '✅ Configurado' : '❌ No configurado');

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.log('❌ Error: MERCADOPAGO_ACCESS_TOKEN no configurado');
      return NextResponse.json({ error: 'Configuración de MercadoPago no encontrada' }, { status: 500 });
    }

    console.log('🔄 Creando suscripción con MercadoPago...');
    console.log('llega aca 3');
    const cookie = (await cookies()).toString();
    const checkoutUrl = await mercadopagoApi.suscribe(email, planId, cookie, userId);
    console.log('✅ URL de checkout generada:', checkoutUrl);

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('💥 Error en /api/mercadopago:', error);
    return NextResponse.json({ error: 'Error al crear la suscripción' }, { status: 500 });
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
