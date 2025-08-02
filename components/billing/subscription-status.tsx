import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/mercadopago/utils';
import { SubscriptionWithPlan } from '@/lib/supabase/types';
import { Calendar, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

interface SubscriptionStatusProps {
  subscription: SubscriptionWithPlan | null;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function SubscriptionStatus({ subscription, onCancel, isLoading }: SubscriptionStatusProps) {
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Sin Suscripción Activa
          </CardTitle>
          <CardDescription>
            No tienes una suscripción activa. Selecciona un plan para comenzar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Para acceder a todas las funcionalidades, necesitas una suscripción activa.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getDaysUntilRenewal = () => {
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysUntilRenewal = getDaysUntilRenewal();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Suscripción Actual
          </span>
          <Badge className={getStatusColor(subscription.status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(subscription.status)}
              {subscription.status === 'active' ? 'Activa' : subscription.status}
            </span>
          </Badge>
        </CardTitle>
        <CardDescription>
          Detalles de tu suscripción actual
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-lg">{subscription.plan.name}</h3>
            <p className="text-sm text-muted-foreground">
              {subscription.plan.description}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {formatCurrency(subscription.amount, subscription.currency)}
            </p>
            <p className="text-sm text-muted-foreground">por mes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Próxima renovación</p>
              <p className="text-xs text-muted-foreground">
                {new Date(subscription.current_period_end).toLocaleDateString()}
                {daysUntilRenewal > 0 && (
                  <span className="ml-1 text-blue-600">
                    ({daysUntilRenewal} días restantes)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">ID de Suscripción</p>
              <p className="text-xs text-muted-foreground font-mono">
                {subscription.mercadopago_id}
              </p>
            </div>
          </div>
        </div>

        {subscription.plan.features && subscription.plan.features.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Características incluidas:</h4>
            <ul className="space-y-1">
              {subscription.plan.features.map((feature, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {subscription.status === 'active' && onCancel && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Cancelando...' : 'Cancelar Suscripción'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 