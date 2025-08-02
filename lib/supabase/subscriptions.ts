import { createClient } from './server';
import { 
  UserSubscription, 
  SubscriptionPlan, 
  SubscriptionPayment, 
  SubscriptionWithPlan,
  CreateSubscriptionData,
  UpdateSubscriptionData
} from './types';

/**
 * Obtiene todos los planes de suscripción activos
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching subscription plans:', error);
    throw new Error('Failed to fetch subscription plans');
  }

  return data || [];
}

/**
 * Obtiene un plan de suscripción por ID
 */
export async function getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching subscription plan:', error);
    return null;
  }

  return data;
}

/**
 * Obtiene la suscripción activa de un usuario
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionWithPlan | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('user_id', userId)
    .in('status', ['active', 'pending'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No subscription found
    }
    console.error('Error fetching user subscription:', error);
    throw new Error('Failed to fetch user subscription');
  }

  return data;
}

/**
 * Obtiene todas las suscripciones de un usuario
 */
export async function getUserSubscriptions(userId: string): Promise<SubscriptionWithPlan[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user subscriptions:', error);
    throw new Error('Failed to fetch user subscriptions');
  }

  return data || [];
}

/**
 * Crea una nueva suscripción
 */
export async function createSubscription(subscriptionData: CreateSubscriptionData): Promise<UserSubscription> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert(subscriptionData)
    .select()
    .single();

  if (error) {
    console.error('Error creating subscription:', error);
    throw new Error('Failed to create subscription');
  }

  return data;
}

/**
 * Actualiza una suscripción existente
 */
export async function updateSubscription(
  subscriptionId: string, 
  updateData: UpdateSubscriptionData
): Promise<UserSubscription> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .update(updateData)
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating subscription:', error);
    throw new Error('Failed to update subscription');
  }

  return data;
}

/**
 * Cancela una suscripción
 */
export async function cancelSubscription(subscriptionId: string): Promise<UserSubscription> {
  return updateSubscription(subscriptionId, {
    status: 'cancelled',
    cancelled_at: new Date().toISOString()
  });
}

/**
 * Obtiene una suscripción por ID de MercadoPago
 */
export async function getSubscriptionByMercadoPagoId(mercadopagoId: string): Promise<UserSubscription | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('mercadopago_id', mercadopagoId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching subscription by MercadoPago ID:', error);
    throw new Error('Failed to fetch subscription');
  }

  return data;
}

/**
 * Registra un pago de suscripción
 */
export async function createSubscriptionPayment(paymentData: {
  subscription_id: string;
  mercadopago_payment_id: string;
  amount: number;
  currency?: string;
  status: SubscriptionPayment['status'];
  payment_method?: string;
  payment_type?: string;
}): Promise<SubscriptionPayment> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('subscription_payments')
    .insert(paymentData)
    .select()
    .single();

  if (error) {
    console.error('Error creating subscription payment:', error);
    throw new Error('Failed to create subscription payment');
  }

  return data;
}

/**
 * Obtiene los pagos de una suscripción
 */
export async function getSubscriptionPayments(subscriptionId: string): Promise<SubscriptionPayment[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('subscription_payments')
    .select('*')
    .eq('subscription_id', subscriptionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscription payments:', error);
    throw new Error('Failed to fetch subscription payments');
  }

  return data || [];
}

/**
 * Verifica si un usuario tiene una suscripción activa
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return subscription?.status === 'active';
}

/**
 * Obtiene el plan actual de un usuario
 */
export async function getUserCurrentPlan(userId: string): Promise<SubscriptionPlan | null> {
  const subscription = await getUserSubscription(userId);
  return subscription?.plan || null;
} 