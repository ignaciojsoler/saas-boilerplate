import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSuccessState } from './use-success-state';

interface UseSettingsFormOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useSettingsForm(options: UseSettingsFormOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { success, setSuccess, resetSuccess } = useSuccessState();
  const supabase = createClient();

  const handleSubmit = async (
    updateFunction: () => Promise<{ error: any }>,
    successMessage?: string
  ) => {
    setIsLoading(true);
    resetSuccess();

    try {
      const { error } = await updateFunction();
      if (error) throw error;
      
      setSuccess();
      options.onSuccess?.();
      
      if (successMessage) {
        setTimeout(() => resetSuccess(), 3000);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      options.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    success,
    handleSubmit,
    supabase,
  };
} 