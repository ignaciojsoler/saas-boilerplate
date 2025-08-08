export type SubscriptionStatus = 'pending' | 'active' | 'cancelled' | 'suspended' | 'expired';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';

export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;