// Tipos para las tablas de Supabase

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  mercadopago_id: string;
  status: 'pending' | 'active' | 'cancelled' | 'suspended' | 'expired';
  amount: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  trial_start: string | null;
  trial_end: string | null;
  cancelled_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPayment {
  id: string;
  subscription_id: string;
  mercadopago_payment_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
  payment_method: string | null;
  payment_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookEvent {
  id: string;
  mercadopago_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  processed: boolean;
  processed_at: string | null;
  created_at: string;
}

// Tipos para las respuestas de la API
export interface SubscriptionWithPlan extends UserSubscription {
  plan: SubscriptionPlan;
}

export interface SubscriptionWithPayments extends UserSubscription {
  plan: SubscriptionPlan;
  payments: SubscriptionPayment[];
}

// Tipos para las consultas
export interface CreateSubscriptionData {
  user_id: string;
  plan_id: string;
  mercadopago_id: string;
  amount: number;
  currency?: string;
  current_period_start: string;
  current_period_end: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateSubscriptionData {
  status?: UserSubscription['status'];
  current_period_start?: string;
  current_period_end?: string;
  cancelled_at?: string | null;
  metadata?: Record<string, unknown>;
} 