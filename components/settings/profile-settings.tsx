"use client"

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";

interface ProfileSettingsProps {
  user: User;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.user_metadata?.full_name || "",
    email: user.email || "",
  });

  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);

    try {
             const { error } = await supabase.auth.updateUser({
         data: {
           full_name: formData.full_name,
         }
       });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
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
        <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="full_name">Nombre completo</Label>
               <Input
                 id="full_name"
                 name="full_name"
                 value={formData.full_name}
                 onChange={handleInputChange}
                 placeholder="Tu nombre completo"
               />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="email">Email</Label>
               <Input
                 id="email"
                 name="email"
                 type="email"
                 value={formData.email}
                 disabled
                 className="bg-muted"
               />
               <p className="text-xs text-muted-foreground">
                 El email no se puede cambiar desde aquí
               </p>
             </div>
           </div>

          <div className="flex items-center gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
            
            {isSuccess && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Cambios guardados</span>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 