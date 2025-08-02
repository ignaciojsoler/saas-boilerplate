"use client"

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, Loader2, AlertCircle, Trash2 } from "lucide-react";

interface SecuritySettingsProps {
  user: User;
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const supabase = createClient();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);
    setError("");

    if (!passwords.current) {
      setError("Debes ingresar tu contraseña actual");
      setIsLoading(false);
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setError("Las contraseñas nuevas no coinciden");
      setIsLoading(false);
      return;
    }

    if (passwords.new.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    if (passwords.current === passwords.new) {
      setError("La nueva contraseña debe ser diferente a la actual");
      setIsLoading(false);
      return;
    }

    try {
      // Primero verificamos la contraseña actual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: passwords.current,
      });

      if (signInError) {
        setError("La contraseña actual es incorrecta");
        setIsLoading(false);
        return;
      }

      // Si la contraseña actual es correcta, actualizamos
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      setPasswords({ current: "", new: "", confirm: "" });
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al cambiar la contraseña";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    // Aquí iría la lógica para eliminar la cuenta
    alert("Funcionalidad de eliminación de cuenta en desarrollo");
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>
            Actualiza tu contraseña para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Contraseña actual</Label>
              <Input
                id="current"
                name="current"
                type="password"
                value={passwords.current}
                onChange={handlePasswordChange}
                placeholder="Ingresa tu contraseña actual"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new">Nueva contraseña</Label>
              <Input
                id="new"
                name="new"
                type="password"
                value={passwords.new}
                onChange={handlePasswordChange}
                placeholder="Nueva contraseña"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                value={passwords.confirm}
                onChange={handlePasswordChange}
                placeholder="Confirma la nueva contraseña"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cambiando contraseña...
                  </>
                ) : (
                  "Cambiar contraseña"
                )}
              </Button>
              
              {isSuccess && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Contraseña actualizada</span>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de la cuenta</CardTitle>
          <CardDescription>
            Detalles de tu cuenta y última actividad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">ID de usuario</Label>
              <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Fecha de registro</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Última actividad</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(user.last_sign_in_at || user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-700">Eliminar cuenta</CardTitle>
          <CardDescription>
            Esta acción no se puede deshacer. Se eliminarán todos tus datos permanentemente.
          </CardDescription>
        </CardHeader>
                 <CardContent>
           <div className="flex items-center justify-between flex-col md:flex-row gap-4">
             <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
               <DialogTrigger asChild>
                 <Button variant="destructive" size="sm">
                   <Trash2 className="h-4 w-4 mr-2" />
                   Eliminar cuenta
                 </Button>
               </DialogTrigger>
               <DialogContent>
                 <DialogHeader>
                   <DialogTitle>¿Eliminar cuenta?</DialogTitle>
                   <DialogDescription>
                     ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.
                   </DialogDescription>
                 </DialogHeader>
                 <DialogFooter>
                   <Button
                     variant="outline"
                     onClick={() => setIsDeleteDialogOpen(false)}
                   >
                     Cancelar
                   </Button>
                   <Button
                     variant="destructive"
                     onClick={handleDeleteAccount}
                   >
                     Eliminar cuenta
                   </Button>
                 </DialogFooter>
               </DialogContent>
             </Dialog>
           </div>
         </CardContent>
      </Card>
    </div>
  );
} 