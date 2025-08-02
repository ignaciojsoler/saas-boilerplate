import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, Settings, CreditCard, Shield } from "lucide-react";

export default function Home() {
  const quickActions = [
    {
      title: "Registrarse",
      description: "Crea tu cuenta gratuita",
      icon: Users,
      href: "/auth/sign-up",
      variant: "default" as const
    },
    {
      title: "Iniciar Sesión",
      description: "Accede a tu cuenta",
      icon: Shield,
      href: "/auth/login",
      variant: "outline" as const
    },
    {
      title: "Ver Demo",
      description: "Explora la plataforma",
      icon: Settings,
      href: "/protected",
      variant: "outline" as const
    }
  ];

  const features = [
    {
      title: "Autenticación Completa",
      description: "Sistema de registro, login, recuperación de contraseña y gestión de sesiones",
      icon: Shield,
      color: "text-blue-600"
    },
    {
      title: "Facturación Integrada",
      description: "Procesamiento de pagos con MercadoPago, suscripciones y gestión de planes",
      icon: CreditCard,
      color: "text-green-600"
    },
    {
      title: "Panel de Usuario",
      description: "Gestión de perfil, configuración de seguridad y preferencias personalizadas",
      icon: Settings,
      color: "text-purple-600"
    }
  ];

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        {/* Navigation */}
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"} className="text-xl font-bold">
                SaaS Boilerplate
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
              <ThemeSwitcher />
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <Hero />
          
          {/* Quick Actions */}
          <section className="w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Comienza Ahora</h2>
              <p className="text-muted-foreground">
                Elige la opción que mejor se adapte a tus necesidades
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <action.icon className="w-8 h-8 text-blue-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                      <Button asChild variant={action.variant} size="sm">
                        <Link href={action.href}>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section className="w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Características Principales</h2>
              <p className="text-muted-foreground">
                Todo lo que necesitas para tu aplicación SaaS
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardHeader>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          {/* Tech Stack */}
          <section className="w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Stack Tecnológico</h2>
              <p className="text-muted-foreground">
                Construido con las mejores tecnologías
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Next.js 14", color: "bg-black text-white" },
                { name: "TypeScript", color: "bg-blue-600 text-white" },
                { name: "Supabase", color: "bg-green-600 text-white" },
                { name: "MercadoPago", color: "bg-blue-500 text-white" }
              ].map((tech, index) => (
                <div key={index} className={`p-3 rounded-lg text-center font-medium ${tech.color}`}>
                  {tech.name}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Desarrollado con ❤️ usando{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>{" "}
            y{" "}
            <a
              href="https://nextjs.org/"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Next.js
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
