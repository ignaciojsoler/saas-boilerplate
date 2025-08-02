'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { SubscriptionPlan, formatCurrency } from '@/lib/mercadopago/utils';

interface SimpleCheckoutProps {
  selectedPlan: SubscriptionPlan;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function SimpleCheckout({ selectedPlan, onClose, onSuccess, onError }: SimpleCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);

  const createPreference = async () => {
    try {
      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan.id
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return result.redirectUrl;
      } else {
        throw new Error(result.error || 'Error al crear la preferencia');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const handleBuy = async () => {
    setIsLoading(true);
    try {
      const url = await createPreference();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      onError('Error al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Completar Pago</CardTitle>
              <CardDescription>
                {selectedPlan.name} - {formatCurrency(selectedPlan.price)}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Información del plan */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Resumen del Plan</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Plan:</strong> {selectedPlan.name}</p>
              <p><strong>Precio:</strong> {formatCurrency(selectedPlan.price)}</p>
              <p><strong>Intervalo:</strong> {selectedPlan.interval === 'monthly' ? 'Mensual' : 'Anual'}</p>
            </div>
          </div>

          {/* Características del plan */}
          <div>
            <h4 className="font-semibold mb-2">Características incluidas:</h4>
            <ul className="space-y-1 text-sm">
              {selectedPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Botón de pago */}
          <Button 
            onClick={handleBuy} 
            className="w-full" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                Pagar {formatCurrency(selectedPlan.price)}
              </>
            )}
          </Button>

          {/* Información adicional */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Pago seguro con MercadoPago</p>
            <p>• Múltiples métodos de pago disponibles</p>
            <p>• Cancelación en cualquier momento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 