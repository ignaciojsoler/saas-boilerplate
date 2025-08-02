"use client"

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { useSettingsForm } from "@/hooks/use-settings-form";

interface ProfileSettingsProps {
  user: User;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    full_name: user.user_metadata?.full_name || "",
    email: user.email || "",
  });

  const { isLoading, success, handleSubmit, supabase } = useSettingsForm();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(
      () => supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
        }
      }),
      "¡Perfil actualizado exitosamente!"
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del perfil</CardTitle>
        <CardDescription>
          Actualiza tu información personal y de contacto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-4">
            <FormField
              id="full_name"
              label="Nombre completo"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Tu nombre completo"
              name="full_name"
            />
            
            <FormField
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={() => {}} // Disabled field
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              El email no se puede cambiar desde aquí
            </p>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
            {success && (
              <span className="text-sm text-green-600">
                ¡Perfil actualizado exitosamente!
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 