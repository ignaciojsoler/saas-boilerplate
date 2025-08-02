import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UseAuthOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useAuth(options: UseAuthOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (
    authFunction: () => Promise<{ error: any }>,
    successRedirect?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await authFunction();
      if (error) throw error;
      
      options.onSuccess?.();
      if (successRedirect) {
        router.push(successRedirect);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const supabase = createClient();
    await handleAuth(
      () => supabase.auth.signInWithPassword({ email, password }),
      "/protected"
    );
  };

  const signUp = async (email: string, password: string) => {
    const supabase = createClient();
    await handleAuth(
      () => supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      }),
      "/auth/sign-up-success"
    );
  };

  const resetPassword = async (email: string) => {
    const supabase = createClient();
    await handleAuth(
      () => supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      }),
      "/auth/forgot-password"
    );
  };

  const updatePassword = async (password: string) => {
    const supabase = createClient();
    await handleAuth(
      () => supabase.auth.updateUser({ password }),
      "/protected"
    );
  };

  return {
    isLoading,
    error,
    login,
    signUp,
    resetPassword,
    updatePassword,
  };
} 