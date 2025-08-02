import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Shield, CreditCard } from "lucide-react";
import Link from "next/link";

export function Hero() {
  const features = [
    {
      icon: Shield,
      title: "Autenticación Segura",
      description: "Sistema de autenticación robusto con Supabase"
    },
    {
      icon: CreditCard,
      title: "Pagos Integrados",
      description: "Procesamiento de pagos con MercadoPago"
    },
    {
      icon: Zap,
      title: "Rápido y Moderno",
      description: "Construido con Next.js 14 y TypeScript"
    }
  ];

  return (
    <div className="flex flex-col gap-16 items-center">
      {/* Header principal */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
          Plataforma SaaS
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Completa
          </span>
        </h1>
        <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Todo lo que necesitas para construir tu aplicación SaaS. 
          Autenticación, facturación, gestión de usuarios y más.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/auth/sign-up">
              Comenzar Gratis
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
            <Link href="/protected">
              Ver Demo
            </Link>
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {features.map((feature, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <feature.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">100%</div>
          <div className="text-sm text-muted-foreground">Seguro</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">24/7</div>
          <div className="text-sm text-muted-foreground">Soporte</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">99.9%</div>
          <div className="text-sm text-muted-foreground">Uptime</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">∞</div>
          <div className="text-sm text-muted-foreground">Escalable</div>
        </div>
      </div>
    </div>
  );
}
