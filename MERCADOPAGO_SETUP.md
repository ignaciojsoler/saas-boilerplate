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
- Success: `/api/mercadopago/success` (maneja el preapproval_id)
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

## 4. Flujo de Pago con PreApproval

### 1. Usuario selecciona un plan
- Se muestra el modal de checkout
- Se muestra información del plan seleccionado

### 2. Usuario hace clic en "Pagar"
- Se crea un PreApproval en MercadoPago
- Se obtiene la URL de redirección de MercadoPago

### 3. Redirección a MercadoPago
- Usuario es redirigido a la pasarela de MercadoPago
- Puede elegir cualquier método de pago disponible

### 4. Procesamiento del preapproval_id
- MercadoPago redirige a `/api/mercadopago/success?preapproval_id=XXX`
- El endpoint consulta el estado de la suscripción en MercadoPago
- Se verifica el campo `status` de la respuesta:
  - `authorized`: Suscripción activa ✅
  - `pending`: Pendiente de aprobación ⏳
  - `cancelled`: Cancelada ❌
  - `expired`: Expirada ❌

### 5. Guardado en base de datos
- Si el status es `authorized`, se crea la suscripción en Supabase
- Se guarda el `preapproval_id` para futuras consultas
- Se redirige al usuario a `/protected/billing?status=success`

### 6. Estados de suscripción
Los posibles valores del campo `status` son:

| Estado | Significado |
|--------|-------------|
| `pending` | A la espera de aprobación del usuario |
| `authorized` | Suscripción activa y funcionando correctamente ✅ |
| `paused` | El usuario pausó los pagos |
| `cancelled` | El usuario o vos la cancelaron |
| `expired` | Fecha de finalización superada o medio de pago vencido |

## 5. Planes de Suscripción Dinámicos

Los planes ahora se obtienen dinámicamente desde la base de datos de Supabase a través del endpoint `/api/subscription/plans`. Esto permite:

- ✅ Modificar planes sin cambiar código
- ✅ Activar/desactivar planes desde la base de datos
- ✅ Agregar nuevos planes fácilmente
- ✅ Mantener consistencia entre frontend y backend

### Estructura del plan en la base de datos:
```sql
CREATE TABLE subscription_plans (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  currency VARCHAR NOT NULL,
  interval VARCHAR NOT NULL,
  features TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Ejemplo de plan:
```json
{
  "id": "basic",
  "name": "Plan Básico",
  "description": "Plan básico para usuarios individuales",
  "price": 1000,
  "currency": "ARS",
  "interval": "monthly",
  "features": [
    "Acceso básico a la plataforma",
    "Soporte por email",
    "1 proyecto activo"
  ],
  "is_active": true
}
```

## 6. Manejo del PreApproval ID

### Flujo completo del preapproval_id:

1. **Creación de suscripción**: Se crea un PreApproval en MercadoPago con `external_reference`
2. **Redirección**: MercadoPago redirige a `/api/mercadopago/success?preapproval_id=XXX`
3. **Consulta de estado**: El endpoint consulta `GET https://api.mercadopago.com/preapproval/{preapproval_id}`
4. **Verificación**: Se verifica el campo `status` de la respuesta
5. **Guardado**: Si `status = 'authorized'`, se crea la suscripción en Supabase

### Endpoint de success (`/api/mercadopago/success`):
```typescript
// Consulta el estado de la suscripción
const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
  headers: {
    'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Verifica el estado
if (subscriptionStatus.status === 'authorized') {
  // Guarda en base de datos
  await createSubscription(userId, planId, preapprovalId);
}
```

### Campos importantes en la respuesta de MercadoPago:
- `status`: Estado de la suscripción
- `payer_email`: Email del pagador
- `external_reference`: Referencia que incluye el plan_id
- `auto_recurring`: Configuración de facturación recurrente

## 7. Testing

- **Aprobada**: 4509 9535 6623 3704
- **Pendiente**: 3711 8030 3257 522
- **Rechazada**: 4000 0000 0000 0002

### Datos de prueba
- CVV: 123
- Fecha: Cualquier fecha futura
- Nombre: Cualquier nombre

### Testing del preapproval_id
1. Crear una suscripción de prueba
2. Verificar que se redirige a `/api/mercadopago/success`
3. Comprobar que se consulta el estado en MercadoPago
4. Verificar que se guarda en la base de datos
5. Confirmar que se redirige a `/protected/billing?status=success`

## 8. Diferencias con la implementación anterior

### ✅ Simplificaciones implementadas:
- Eliminación del Wallet Brick complejo
- Uso directo de `init_point` para redirección
- Manejo automático del preapproval_id
- Planes dinámicos desde la base de datos
- Flujo más simple y directo
- Menos dependencias y complejidad
- Mejor compatibilidad con Next.js 15

### 🔄 Cambios en el flujo:
1. **Antes**: Preferencia → Wallet Brick → Pago
2. **Ahora**: PreApproval → Redirección → Consulta estado → Guardado automático

## 9. Ventajas de esta implementación

### Simplicidad:
- Menos código para mantener
- Flujo más directo y fácil de entender
- Manejo automático del preapproval_id
- Planes dinámicos sin cambios de código

### Compatibilidad:
- Funciona perfectamente con Next.js 15
- Mejor rendimiento
- Menos dependencias externas

### UX:
- Proceso más rápido para el usuario
- Menos pasos intermedios
- Mejor experiencia en móviles
- Guardado automático de suscripciones

### Gestión de datos:
- Planes centralizados en la base de datos
- Estados de suscripción sincronizados
- Historial completo de transacciones

## 10. Producción

### Checklist para producción:
- [ ] Cambiar a credenciales de producción
- [ ] Verificar URLs de retorno en producción
- [ ] Probar flujo completo de pago con preapproval_id
- [ ] Configurar monitoreo de errores
- [ ] Verificar que los planes estén activos en la base de datos
- [ ] Probar el endpoint `/api/mercadopago/success`
- [ ] Configurar webhooks para actualizaciones de estado

## 11. Soporte

Para problemas técnicos:
1. Revisa los logs del servidor
2. Verifica las credenciales de MercadoPago
3. Confirma que las URLs de retorno sean accesibles
4. Prueba con tarjetas de test
5. Verifica el estado de la suscripción en MercadoPago
6. Comprueba que los planes estén activos en la base de datos
7. Revisa los logs del endpoint `/api/mercadopago/success` 