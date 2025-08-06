import { MercadoPagoConfig, PreApproval } from "mercadopago";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
}

export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});



export const mercadopagoApi = {
  async suscribe(email: string, planId: string = 'basic', cookie?: string): Promise<string> {
    console.log('🔍 Función suscribe - Iniciando');
    console.log('📧 Email recibido:', email);
    console.log('📋 Plan ID recibido:', planId);
    console.log('🍪 Cookie recibida:', cookie);
    // Obtener el plan desde la base de datos
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/subscription/plans`, {
      headers: {
        Cookie: cookie || '',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }
    const data = await response.json();
    const plan = data.plans?.find((p: SubscriptionPlan) => p.id === planId);
    
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
          back_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/success`,
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

  // Obtener información de un plan desde la API
  async getPlan(planId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/subscription/plans`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.plans?.find((p: SubscriptionPlan) => p.id === planId);
  },

  // Obtener todos los planes desde la API
  async getAllPlans() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/subscription/plans`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.plans || [];
  }
}; 