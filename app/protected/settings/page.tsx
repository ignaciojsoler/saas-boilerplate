import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { PageHeader } from "@/components/ui/page-header";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Configuración de cuenta"
        description="Gestiona tu perfil, seguridad y preferencias"
        breadcrumbItems={[
          { label: "Dashboard", href: "/protected" },
          { label: "Configuración" }
        ]}
      />

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