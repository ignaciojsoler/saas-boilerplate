"use client";

import { useState } from "react";
import { AuthForm } from "@/components/ui/auth-form";
import { FormField } from "@/components/ui/form-field";
import { SuccessCard } from "@/components/ui/success-card";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/lib/constants";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  
  const { resetPassword, isLoading, error } = useAuth({
    onSuccess: () => setSuccess(true),
  });

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(email);
  };

  if (success) {
    return (
      <div className="flex flex-col gap-6" {...props}>
        <SuccessCard
          title="Check Your Email"
          description="Password reset instructions sent"
          message="If you registered using your email and password, you will receive a password reset email."
        />
      </div>
    );
  }

  return (
    <AuthForm
      title="Reset Your Password"
      description="Type in your email and we'll send you a link to reset your password"
      submitText="Send reset email"
      isLoading={isLoading}
      onSubmit={handleForgotPassword}
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
        error={error}
      />
    </AuthForm>
  );
}
