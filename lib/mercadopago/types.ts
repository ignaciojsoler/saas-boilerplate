// Tipos básicos para nuestra aplicación
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
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