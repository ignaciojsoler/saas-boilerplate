'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PricingCard } from '@/components/billing/pricing-card';
import { SimpleCheckout } from '@/components/billing/simple-checkout';
import { SUBSCRIPTION_PLANS, formatCurrency } from '@/lib/mercadopago/utils';
import { SubscriptionPlan } from '@/lib/mercadopago/types';
import { PageHeader } from '@/components/ui/page-header';
import { StatusAlert } from '@/components/ui/status-alert';
import { PAYMENT_METHODS, REFUND_POLICY } from '@/lib/constants';
import { useSubscription } from '@/hooks/use-subscription';
import { InfoCard, InfoSection } from '@/components/ui/info-section';

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isLoading] = useState(false);
  
  const { currentSubscription, refetch } = useSubscription();

  const status = searchParams.get('status') as 'success' | 'error' | 'pending' | null;

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    refetch();
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
      <PageHeader
        title="Planes y Facturación"
        description="Elige el plan que mejor se adapte a tus necesidades"
        breadcrumbItems={[
          { label: "Dashboard", href: "/protected" },
          { label: "Facturación" }
        ]}
      />

      <StatusAlert status={status} />

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <InfoCard title="Información Importante">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoSection title="Métodos de Pago" items={PAYMENT_METHODS} />
          <InfoSection title="Política de Reembolso" items={REFUND_POLICY} />
        </div>
      </InfoCard>

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