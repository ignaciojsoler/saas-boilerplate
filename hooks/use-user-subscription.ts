import { useState, useEffect } from 'react';
import { useUser } from './use-user';
import { SubscriptionWithPlan, SubscriptionPlan } from '@/lib/supabase/types';

export function useUserSubscription() {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      } else {
        setError('Failed to fetch subscription');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError('Error fetching subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      } else {
        setError('Failed to fetch plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Error fetching plans');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!subscription) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/subscription/${subscription.id}/cancel`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchSubscription(); // Refresh subscription data
      } else {
        setError('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setError('Error cancelling subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPlan = () => {
    return subscription?.plan || null;
  };

  const hasActiveSubscription = () => {
    return subscription?.status === 'active';
  };

  const isSubscriptionPending = () => {
    return subscription?.status === 'pending';
  };

  const getSubscriptionStatus = () => {
    return subscription?.status || 'none';
  };

  const getDaysUntilRenewal = () => {
    if (!subscription || subscription.status !== 'active') return null;
    
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  useEffect(() => {
    fetchSubscription();
    fetchPlans();
  }, [user]);

  return {
    subscription,
    plans,
    isLoading,
    error,
    refetch: fetchSubscription,
    cancelSubscription,
    getCurrentPlan,
    hasActiveSubscription,
    isSubscriptionPending,
    getSubscriptionStatus,
    getDaysUntilRenewal,
  };
} 