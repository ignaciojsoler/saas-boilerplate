import { MercadoPagoConfig, PreApproval } from "mercadopago";

export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

// Definir los planes disponibles
export const SUBSCRIPTION_PLANS = {
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

export const mercadopagoApi = {
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