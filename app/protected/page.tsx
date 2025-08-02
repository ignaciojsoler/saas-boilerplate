import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Settings, 
  TrendingUp,
  Shield,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const user = data.user;

  // Simular datos de suscripción (en un caso real vendrían de la API)
  const subscriptionStatus = "active";
  const currentPlan = "Pro";
  const nextBilling = "2024-02-15";

  const quickActions = [
    {
      title: "Gestionar Facturación",
      description: "Ver planes y métodos de pago",
      icon: CreditCard,
      href: "/protected/billing",
      color: "text-blue-600"
    },
    {
      title: "Configuración",
      description: "Perfil y preferencias",
      icon: Settings,
      href: "/protected/settings",
      color: "text-purple-600"
    }
  ];

  const stats = [
    {
      title: "Estado de Suscripción",
      value: subscriptionStatus === "active" ? "Activa" : "Inactiva",
      icon: CheckCircle,
      iconClassName: subscriptionStatus === "active" ? "text-green-600" : "text-red-600",
      description: `Plan ${currentPlan}`
    },
    {
      title: "Próxima Facturación",
      value: new Date(nextBilling).toLocaleDateString(),
      icon: Calendar,
      iconClassName: "text-blue-600",
      description: "Renovación automática"
    },
    {
      title: "Sesión Activa",
      value: "Segura",
      icon: Shield,
      iconClassName: "text-green-600",
      description: "Último acceso: Hoy"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description={`Bienvenido de vuelta, ${user.email}`}
        actions={
          <Badge variant="outline" className="text-sm">
            {currentPlan} Plan
          </Badge>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            iconClassName={stat.iconClassName}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href={action.href}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <action.icon className={`w-8 h-8 ${action.color}`} />
                    <div className="flex-1">
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <TrendingUp className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Últimas Actividades</CardTitle>
            <CardDescription>
              Resumen de tus acciones recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Sesión iniciada exitosamente</span>
                <span className="text-xs text-muted-foreground ml-auto">Hace 5 min</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Plan Pro activado</span>
                <span className="text-xs text-muted-foreground ml-auto">Hace 2 días</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Configuración de perfil actualizada</span>
                <span className="text-xs text-muted-foreground ml-auto">Hace 1 semana</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Estado del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Autenticación</h3>
                  <p className="text-sm text-green-700">Sistema funcionando correctamente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Pagos</h3>
                  <p className="text-sm text-green-700">MercadoPago operativo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Calendar icon component
function Calendar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
