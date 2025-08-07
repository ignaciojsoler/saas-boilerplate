'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/mercadopago/utils';
import { SubscriptionPlan, SubscriptionWithPlan } from '@/lib/supabase/types';

interface PricingCardProps {
  plan: SubscriptionPlan;
  isPopular?: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
  isLoading?: boolean;
  currentSubscription?: SubscriptionWithPlan | null;
}

export function PricingCard({ 
  plan, 
  isPopular = false, 
  onSelect, 
  isLoading = false,
  currentSubscription 
}: PricingCardProps) {
  // Verificar si este plan coincide con la suscripción actual
  const isCurrentPlan = currentSubscription?.plan_id === plan.id && 
    (currentSubscription?.status === 'active' || currentSubscription?.status === 'pending');
  
  return (
    <Card className={`relative ${isPopular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'border-green-500 bg-green-50/50' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
          <Star className="w-3 h-3 mr-1" />
          Más Popular
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge className="absolute -top-3 right-4 bg-green-500 text-white">
          <CheckCircle className="w-3 h-3 mr-1" />
          {currentSubscription?.status === 'active' ? 'Plan Actual' : 'Plan Pendiente'}
        </Badge>
      )}
      
      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold">
            {formatCurrency(plan.price, plan.currency)}
          </span>
          <span className="text-muted-foreground">/mes</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        {isCurrentPlan ? (
          <div className="text-center py-2">
            <Badge variant="secondary" className="w-full justify-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              {currentSubscription?.status === 'active' ? 'Plan Activo' : 'Plan Pendiente'}
            </Badge>
          </div>
        ) : (
          <Button 
            className="w-full" 
            variant={isPopular ? 'default' : 'outline'}
            onClick={() => onSelect(plan)}
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : 'Seleccionar Plan'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 