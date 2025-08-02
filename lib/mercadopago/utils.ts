import { preference } from './client';
import { SubscriptionPlan } from './types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Plan Básico',
    price: 9.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Acceso básico a la plataforma',
      'Soporte por email',
      '1 proyecto activo'
    ]
  },
  {
    id: 'pro',
    name: 'Plan Profesional',
    price: 29.99,
    currency: 'USD',
    interval: 'monthly',
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
    price: 99.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Todo del plan profesional',
      'Soporte 24/7',
      'Proyectos ilimitados',
      'API personalizada',
      'Integración dedicada'
    ]
  }
];

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

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency
  }).format(amount);
} 