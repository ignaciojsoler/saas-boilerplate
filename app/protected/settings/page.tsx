import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { SecuritySettings } from "@/components/settings/security-settings";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="w-full">
        <h1 className="text-3xl font-bold">Configuración de cuenta</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tu perfil, seguridad y preferencias
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <ProfileSettings user={data.user} />
        </TabsContent>
        
        <TabsContent value="security" className="mt-6">
          <SecuritySettings user={data.user} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 