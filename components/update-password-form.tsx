"use client";

import { useState } from "react";
import { AuthForm } from "@/components/ui/auth-form";
import { FormField } from "@/components/ui/form-field";
import { useAuth } from "@/hooks/use-auth";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  
  const { updatePassword, isLoading, error } = useAuth();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePassword(password);
  };

  return (
    <AuthForm
      title="Reset Your Password"
      description="Please enter your new password below."
      submitText="Save new password"
      isLoading={isLoading}
      onSubmit={handleUpdatePassword}
      className={className}
      {...props}
    >
      <FormField
        id="password"
        label="New password"
        type="password"
        placeholder="New password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error}
      />
    </AuthForm>
  );
}
