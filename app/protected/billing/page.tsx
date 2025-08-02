'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { PricingCard } from '@/components/billing/pricing-card';
import { SimpleCheckout } from '@/components/billing/simple-checkout';
import { SUBSCRIPTION_PLANS, formatCurrency } from '@/lib/mercadopago/utils';
import { SubscriptionPlan } from '@/lib/mercadopago/types';
import { PageHeader } from '@/components/ui/page-header';

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  const status = searchParams.get('status');

  useEffect(() => {
    // Cargar suscripción actual del usuario
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/current');
      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    fetchCurrentSubscription();
    router.push('/protected/billing?status=success');
  };

  const handlePaymentError = (error: string) => {
    setShowCheckout(false);
    setSelectedPlan(null);
    router.push(`/protected/billing?status=error&message=${encodeURIComponent(error)}`);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Planes y Facturación"
        description="Elige el plan que mejor se adapte a tus necesidades"
        breadcrumbItems={[
          { label: "Dashboard", href: "/protected" },
          { label: "Facturación" }
        ]}
      />

      {/* Alertas de estado */}
      {status === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ¡Pago procesado exitosamente! Tu suscripción está activa.
          </AlertDescription>
        </Alert>
      )}

      {status === 'error' && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Error al procesar el pago. Por favor, intenta nuevamente.
          </AlertDescription>
        </Alert>
      )}

      {status === 'pending' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Tu pago está siendo procesado. Te notificaremos cuando esté listo.
          </AlertDescription>
        </Alert>
      )}

      {/* Suscripción actual */}
      {currentSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Suscripción Actual</CardTitle>
            <CardDescription>
              Detalles de tu suscripción activa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{currentSubscription.plan_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(currentSubscription.amount)} / mes
                </p>
                <p className="text-xs text-muted-foreground">
                  Vence: {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}>
                {currentSubscription.status === 'active' ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planes de precios */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Planes Disponibles</h2>
          <p className="text-muted-foreground">
            Selecciona el plan que mejor se adapte a tus necesidades
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isPopular={plan.id === 'pro'}
              onSelect={handlePlanSelect}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información Importante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Métodos de Pago</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tarjetas de crédito y débito</li>
                <li>• Transferencias bancarias</li>
                <li>• Billeteras digitales</li>
                <li>• Pago en efectivo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Política de Reembolso</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Cancelación en cualquier momento</li>
                <li>• Reembolso prorrateado</li>
                <li>• Sin cargos ocultos</li>
                <li>• Soporte 24/7</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de checkout */}
      {showCheckout && selectedPlan && (
        <SimpleCheckout
          selectedPlan={selectedPlan}
          onClose={handleCloseCheckout}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BillingContent />
    </Suspense>
  );
} 