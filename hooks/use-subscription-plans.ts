import { useState, useEffect } from 'react';
import { SubscriptionPlan } from '@/lib/supabase/types';

interface UseSubscriptionPlansReturn {
  plans: SubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSubscriptionPlans(): UseSubscriptionPlansReturn {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/subscription/plans', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data = await response.json();
      
      if (data.success && data.plans) {
        setPlans(data.plans);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los planes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    isLoading,
    error,
    refetch: fetchPlans,
  };
} 