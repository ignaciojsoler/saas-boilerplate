// Tipos básicos para nuestra aplicación
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
}

export interface MercadoPagoSubscription {
  id: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: 'active' | 'inactive' | 'pending' | 'cancelled';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  transaction_amount: number;
  token: string;
  description: string;
  payer: {
    email: string;
    name?: string;
  };
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  external_reference?: string;
  notification_url?: string;
}

export interface PaymentResult {
  id: number;
  status: string;
  status_detail: string;
  external_reference: string;
  transaction_amount: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookData {
  id: number;
  type: string;
  data: {
    id: number;
    status: string;
    external_reference: string;
    payer_email?: string;
    auto_recurring?: {
      transaction_amount: number;
      currency_id: string;
    };
  };
}

export interface MercadoPagoPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
} 