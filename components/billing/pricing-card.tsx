'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/mercadopago/utils';
import { SubscriptionPlan } from '@/lib/mercadopago/types';

interface PricingCardProps {
  plan: SubscriptionPlan;
  isPopular?: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
  isLoading?: boolean;
}

export function PricingCard({ plan, isPopular = false, onSelect, isLoading = false }: PricingCardProps) {
  return (
    <Card className={`relative ${isPopular ? 'border-primary shadow-lg' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
          <Star className="w-3 h-3 mr-1" />
          Más Popular
        </Badge>
      )}
      
      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold">
            {formatCurrency(plan.price)}
          </span>
          <span className="text-muted-foreground">/{plan.interval === 'monthly' ? 'mes' : 'año'}</span>
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
        
        <Button 
          className="w-full" 
          variant={isPopular ? 'default' : 'outline'}
          onClick={() => onSelect(plan)}
          disabled={isLoading}
        >
          {isLoading ? 'Procesando...' : 'Seleccionar Plan'}
        </Button>
      </CardContent>
    </Card>
  );
} 