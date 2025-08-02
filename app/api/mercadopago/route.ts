import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

// Definir los planes disponibles
const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: 'Plan Básico',
    price: 1000, // 1000 ARS = $10 USD aprox
    currency: 'ARS',
    features: [
      'Acceso básico a la plataforma',
      'Soporte por email',
      '1 proyecto activo'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Plan Profesional',
    price: 3000, // 3000 ARS = $30 USD aprox
    currency: 'ARS',
    features: [
      'Todo del plan básico',
      'Soporte prioritario',
      '5 proyectos activos',
      'Análisis avanzado'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Plan Empresarial',
    price: 10000, // 10000 ARS = $100 USD aprox
    currency: 'ARS',
    features: [
      'Todo del plan profesional',
      'Soporte 24/7',
      'Proyectos ilimitados',
      'API personalizada',
      'Integración dedicada'
    ]
  }
};

const api = {
  async suscribe(email: string, planId: string = 'basic'): Promise<string> {
    console.log('🔍 Función suscribe - Iniciando');
    console.log('📧 Email recibido:', email);
    console.log('📋 Plan ID recibido:', planId);
    
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
    console.log('📋 Plan encontrado:', plan);
    
    if (!plan) {
      console.log('❌ Error: Plan no válido:', planId);
      throw new Error(`Plan no válido: ${planId}`);
    }

    console.log('🔄 Configurando MercadoPago...');
    console.log('🔑 Access Token:', process.env.MERCADOPAGO_ACCESS_TOKEN ? '✅ Presente' : '❌ Ausente');
    console.log('🌐 Site URL:', process.env.NEXT_PUBLIC_SITE_URL);

    try {
      console.log('🔄 Creando PreApproval con MercadoPago...');
      const suscription = await new PreApproval(mercadopago).create({
        body: {
          back_url: process.env.NEXT_PUBLIC_SITE_URL!,
          reason: `Suscripción ${plan.name}`,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: plan.price,
            currency_id: plan.currency,
          },
          payer_email: email,
          status: "pending",
          external_reference: `${planId}_${Date.now()}`, // Referencia única
        },
      });

      console.log('✅ PreApproval creado exitosamente');
      console.log('🔗 Init point:', suscription.init_point);
      
      if (!suscription.init_point) {
        console.log('❌ Error: No se recibió init_point de MercadoPago');
        throw new Error('No se recibió URL de checkout de MercadoPago');
      }

      return suscription.init_point;
    } catch (error) {
      console.error('💥 Error en PreApproval.create:', error);
      console.error('💥 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : 'No stack'
      });
      throw error;
    }
  },

  // Obtener información de un plan
  getPlan(planId: string) {
    return SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
  },

  // Obtener todos los planes
  getAllPlans() {
    return Object.values(SUBSCRIPTION_PLANS);
  }
};

export default api;

// Endpoint para crear suscripciones
export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/mercadopago - Iniciando creación de suscripción');
  
  try {
    const body = await request.json();
    console.log('📝 Body recibido:', body);
    
    const { email, planId = 'basic' } = body;
    console.log('📧 Email:', email);
    console.log('📋 Plan ID:', planId);

    if (!email) {
      console.log('❌ Error: Email requerido');
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    // Verificar que el plan existe
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
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
    const checkoutUrl = await api.suscribe(email, planId);
    console.log('✅ URL de checkout generada:', checkoutUrl);
    
    return NextResponse.json({ 
      success: true, 
      checkoutUrl 
    });
  } catch (error) {
    console.error('💥 Error completo:', error);
    console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    
    // Log más específico del error
    if (error instanceof Error) {
      console.error('💥 Error message:', error.message);
      console.error('💥 Error name:', error.name);
    }
    
    return NextResponse.json({ 
      error: 'Error al crear la suscripción',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
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
