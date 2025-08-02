import { preference, payment } from './client';
import { CreatePaymentRequest } from './types';
import { SubscriptionPlan } from '@/lib/supabase/types';

// Importar la API de MercadoPago
import { mercadopagoApi } from './api';



// Función para crear suscripción usando MercadoPago
export async function createSubscription(email: string, planId: string): Promise<string> {
  try {
    return await mercadopagoApi.suscribe(email, planId);
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw new Error('Failed to create subscription');
  }
}

// Función para obtener un plan específico desde la API
export async function getPlan(planId: string): Promise<SubscriptionPlan | undefined> {
  try {
    const response = await fetch('/api/subscription/plans');
    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }
    const data = await response.json();
    if (data.success && data.plans) {
      return data.plans.find((plan: SubscriptionPlan) => plan.id === planId);
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching plan:', error);
    return undefined;
  }
}

// Función para obtener todos los planes desde la API
export async function getAllPlans(): Promise<SubscriptionPlan[]> {
  try {
    const response = await fetch('/api/subscription/plans');
    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }
    const data = await response.json();
    if (data.success && data.plans) {
      return data.plans;
    }
    return [];
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
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