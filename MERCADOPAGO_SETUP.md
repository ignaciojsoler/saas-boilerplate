# Configuración de MercadoPago - Implementación Simplificada

Esta guía te ayudará a configurar MercadoPago con Checkout Pro siguiendo el patrón simplificado de Ignacio Soler, adaptado para nuestro SaaS.

## 1. Configuración de MercadoPago

### Crear cuenta en MercadoPago
1. Ve a [MercadoPago Developers](https://www.mercadopago.com/developers)
2. Crea una cuenta de desarrollador
3. Accede al panel de desarrolladores

### Obtener credenciales
1. En el panel de desarrolladores, ve a "Credenciales"
2. Copia tu `Access Token` (para producción usa el de producción, para desarrollo el de test)
3. Copia tu `Public Key`

### Configurar URLs de retorno
Las URLs de retorno se configuran automáticamente en el código:
- Success: `/protected/billing?status=success`
- Failure: `/protected/billing?status=error`
- Pending: `/protected/billing?status=pending`

## 2. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# MercadoPago Configuration
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token_here
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. Estructura del Proyecto

### Cliente de MercadoPago (`lib/mercadopago/client.ts`)
```typescript
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

const preference = new Preference(client);

export { client, preference };
```

### Función de Creación de Preferencias (`lib/mercadopago/utils.ts`)
```typescript
export async function createPreference(plan: SubscriptionPlan): Promise<string> {
  const body = {
    items: [
      {
        id: plan.id,
        title: plan.name,
        quantity: 1,
        unit_price: plan.price,
        currency_id: plan.currency,
      },
    ],
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_SITE_URL}/protected/billing?status=success`,
      failure: `${process.env.NEXT_PUBLIC_SITE_URL}/protected/billing?status=error`,
      pending: `${process.env.NEXT_PUBLIC_SITE_URL}/protected/billing?status=pending`,
    },
    auto_return: "approved",
  };

  const preferenceResponse = await preference.create({ body });
  return preferenceResponse.init_point || '';
}
```

### API Route (`app/api/payments/create-preference/route.ts`)
```typescript
export async function POST(request: NextRequest) {
  const { planId } = await request.json();
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  
  const redirectUrl = await createPreference(plan);
  
  return NextResponse.json({ 
    success: true, 
    redirectUrl
  });
}
```

### Componente de Checkout (`components/billing/simple-checkout.tsx`)
```typescript
const handleBuy = async () => {
  const url = await createPreference();
  if (url) {
    window.location.href = url;
  }
};
```

## 4. Flujo de Pago

### 1. Usuario selecciona un plan
- Se muestra el modal de checkout
- Se muestra información del plan seleccionado

### 2. Usuario hace clic en "Pagar"
- Se crea una preferencia de pago en el backend
- Se obtiene la URL de redirección de MercadoPago

### 3. Redirección a MercadoPago
- Usuario es redirigido a la pasarela de MercadoPago
- Puede elegir cualquier método de pago disponible

### 4. Retorno a la aplicación
- Después del pago, usuario es redirigido según el resultado:
  - Success: `/protected/billing?status=success`
  - Failure: `/protected/billing?status=error`
  - Pending: `/protected/billing?status=pending`

## 5. Planes de Suscripción

Los planes están definidos en `lib/mercadopago/utils.ts`:

```typescript
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Plan Básico',
    price: 9.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Acceso básico a la plataforma',
      'Soporte por email',
      '1 proyecto activo'
    ]
  },
  // ... más planes
];
```

## 6. Testing

### Tarjetas de prueba
Para desarrollo, usa estas tarjetas de prueba:

- **Aprobada**: 4509 9535 6623 3704
- **Pendiente**: 3711 8030 3257 522
- **Rechazada**: 4000 0000 0000 0002

### Datos de prueba
- CVV: 123
- Fecha: Cualquier fecha futura
- Nombre: Cualquier nombre

## 7. Diferencias con la implementación anterior

### ✅ Simplificaciones implementadas:
- Eliminación del Wallet Brick complejo
- Uso directo de `init_point` para redirección
- Flujo más simple y directo
- Menos dependencias y complejidad
- Mejor compatibilidad con Next.js 15

### 🔄 Cambios en el flujo:
1. **Antes**: Preferencia → Wallet Brick → Pago
2. **Ahora**: Preferencia → Redirección directa → Pago

## 8. Ventajas de esta implementación

### Simplicidad:
- Menos código para mantener
- Flujo más directo y fácil de entender
- Menos puntos de falla

### Compatibilidad:
- Funciona perfectamente con Next.js 15
- Mejor rendimiento
- Menos dependencias externas

### UX:
- Proceso más rápido para el usuario
- Menos pasos intermedios
- Mejor experiencia en móviles

## 9. Producción

### Checklist para producción:
- [ ] Cambiar a credenciales de producción
- [ ] Verificar URLs de retorno en producción
- [ ] Probar flujo completo de pago
- [ ] Configurar monitoreo de errores

## 10. Soporte

Para problemas técnicos:
1. Revisa los logs del servidor
2. Verifica las credenciales de MercadoPago
3. Confirma que las URLs de retorno sean accesibles
4. Prueba con tarjetas de test 