"use client";

import { useState } from "react";
import { AuthForm } from "@/components/ui/auth-form";
import { FormField } from "@/components/ui/form-field";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES, VALIDATION_MESSAGES } from "@/lib/constants";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const { signUp, isLoading, error } = useAuth({
    onError: (errorMessage) => {
      setValidationError(errorMessage);
    },
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (password !== repeatPassword) {
      setValidationError(VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH);
      return;
    }

    await signUp(email, password);
  };

  const displayError = validationError || error;

  return (
    <AuthForm
      title="Sign up"
      description="Create a new account"
      submitText="Sign up"
      isLoading={isLoading}
      onSubmit={handleSignUp}
      footerText="Already have an account?"
      footerLink={{
        text: "Already have an account?",
        href: ROUTES.LOGIN,
        linkText: "Login",
      }}
      className={className}
      {...props}
    >
      <FormField
        id="email"
        label="Email"
        type="email"
        placeholder="m@example.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={displayError}
      />
      
      <FormField
        id="password"
        label="Password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      <FormField
        id="repeat-password"
        label="Repeat Password"
        type="password"
        required
        value={repeatPassword}
        onChange={(e) => setRepeatPassword(e.target.value)}
      />
    </AuthForm>
  );
}
