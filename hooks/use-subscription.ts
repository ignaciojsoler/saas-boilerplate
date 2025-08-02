import { useState, useEffect } from 'react';

interface Subscription {
  id: string;
  plan_name: string;
  amount: number;
  status: string;
  current_period_end: string;
}

export function useSubscription() {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentSubscription = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscriptions/current');
      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription);
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

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  return {
    currentSubscription,
    isLoading,
    error,
    refetch: fetchCurrentSubscription,
  };
} 