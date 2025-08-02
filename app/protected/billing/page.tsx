'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PricingCard } from '@/components/billing/pricing-card';
import { SimpleCheckout } from '@/components/billing/simple-checkout';
import { SUBSCRIPTION_PLANS, formatCurrency } from '@/lib/mercadopago/utils';
import { MercadoPagoPlan } from '@/lib/mercadopago/types';
import { PageHeader } from '@/components/ui/page-header';
import { StatusAlert } from '@/components/ui/status-alert';
import { PAYMENT_METHODS, REFUND_POLICY } from '@/lib/constants';
import { useSubscription } from '@/hooks/use-subscription';
import { useUser } from '@/hooks/use-user';
import { InfoCard, InfoSection } from '@/components/ui/info-section';

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<MercadoPagoPlan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { currentSubscription, refetch } = useSubscription();
  const { 
    email, 
    isLoading: userLoading } = useUser();

    // Para pruebas
    // const email = 'test_user_339185047@testuser.com';

  const status = searchParams.get('status') as 'success' | 'error' | 'pending' | null;

  const handlePlanSelect = async (plan: MercadoPagoPlan) => {
    if (!email) {
      console.log('❌ Error: Usuario no autenticado');
      router.push(`/protected/billing?status=error&message=${encodeURIComponent('Usuario no autenticado')}`);
      return;
    }

    console.log('🚀 Iniciando selección de plan');
    console.log('📧 Email del usuario:', email);
    console.log('📋 Plan seleccionado:', plan);

    setSelectedPlan(plan);
    setIsLoading(true);
    
    try {
      const requestBody = {
        email: email,
        planId: plan.id
      };
      
      console.log('📤 Enviando request a /api/mercadopago');
      console.log('📝 Request body:', requestBody);
      
      // Usar el endpoint POST en lugar de llamar directamente a la función
      const response = await fetch('/api/mercadopago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      console.log('📥 Response body:', result);
      
      if (result.success && result.checkoutUrl) {
        console.log('✅ Éxito - Redirigiendo a:', result.checkoutUrl);
        // Redirigir al checkout de MercadoPago
        window.location.href = result.checkoutUrl;
      } else {
        console.log('❌ Error en la respuesta:', result.error);
        throw new Error(result.error || 'Error al crear la suscripción');
      }
    } catch (error) {
      console.error('💥 Error completo:', error);
      console.error('💥 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      router.push(`/protected/billing?status=error&message=${encodeURIComponent('Error al crear la suscripción')}`);
    } finally {
      setIsLoading(false);
    }
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

  // Mostrar loading mientras se carga la información del usuario
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

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
                  {formatCurrency(currentSubscription.amount, currentSubscription.currency)} / mes
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