import { preference, payment } from './client';
import { SubscriptionPlan, CreatePaymentRequest, MercadoPagoPlan } from './types';

// Importar la API de MercadoPago
import mercadopagoApi from '@/app/api/mercadopago/route';

export const SUBSCRIPTION_PLANS: MercadoPagoPlan[] = [
  {
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
  {
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
  {
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
];

// Función para crear suscripción usando MercadoPago
export async function createSubscription(email: string, planId: string): Promise<string> {
  try {
    return await mercadopagoApi.suscribe(email, planId);
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw new Error('Failed to create subscription');
  }
}

// Función para obtener un plan específico
export function getPlan(planId: string): MercadoPagoPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
}

// Función para obtener todos los planes
export function getAllPlans(): MercadoPagoPlan[] {
  return SUBSCRIPTION_PLANS;
}

// Función simplificada siguiendo la guía de Ignacio
export async function createPreference(plan: SubscriptionPlan): Promise<string> {
  try {
    const body = {
      items: [
        {
          id: plan.id,
          title: plan.name,
          quantity: 1,
          unit_price: plan.price,
          currency_id: plan.currency,
        },
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/protected/billing?status=success`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/protected/billing?status=error`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/protected/billing?status=pending`,
      },
      auto_return: "approved",
    };

    const preferenceResponse = await preference.create({ body });
    return preferenceResponse.init_point || '';
  } catch (error) {
    console.error('Error creating preference:', error);
    throw new Error('Failed to create payment preference');
  }
}

export async function createPayment(paymentData: CreatePaymentRequest) {
  try {
    const paymentResponse = await payment.create({ body: paymentData });
    return paymentResponse;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw new Error('Failed to create payment');
  }
}

export function formatCurrency(amount: number, currency: string = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency
  }).format(amount);
} 