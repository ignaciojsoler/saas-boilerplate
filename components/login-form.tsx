"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/ui/auth-form";
import { FormField } from "@/components/ui/form-field";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/lib/constants";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <AuthForm
      title="Login"
      description="Enter your email below to login to your account"
      submitText="Login"
      isLoading={isLoading}
      onSubmit={handleLogin}
      footerText="Don't have an account?"
      footerLink={{
        text: "Don't have an account?",
        href: ROUTES.SIGN_UP,
        linkText: "Sign up",
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
      
      <FormField
        id="password"
        label="Password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        rightElement={
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-sm underline-offset-4 hover:underline"
          >
            Forgot your password?
          </Link>
        }
      />
    </AuthForm>
  );
}
