// Tipos básicos para nuestra aplicación
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
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
  };
} 