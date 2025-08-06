# Configuración del Sistema de Suscripciones

Este documento te guía a través de la configuración completa del sistema de suscripciones con MercadoPago y Supabase.

## 📋 Prerrequisitos

- Proyecto Next.js configurado
- Supabase configurado con autenticación
- MercadoPago configurado (ver `MERCADOPAGO_SETUP.md`)

## 🗄️ Configuración de la Base de Datos

### 1. Ejecutar el Script SQL

1. Ve a tu dashboard de Supabase
2. Abre el **SQL Editor**
3. Copia y pega el contenido del archivo `scripts/supabase-schema.sql`
4. Ejecuta el script

Este script creará las siguientes tablas:

- `subscription_plans` - Planes de suscripción disponibles
- `user_subscriptions` - Suscripciones de los usuarios
- `subscription_payments` - Historial de pagos
- `webhook_events` - Registro de eventos de webhook

### 2. Verificar las Tablas

Después de ejecutar el script, verifica que las tablas se crearon correctamente:

```sql
-- Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscription_plans', 'user_subscriptions', 'subscription_payments', 'webhook_events');

-- Verificar planes insertados
SELECT * FROM subscription_plans;
```

## 🔧 Configuración del Webhook

### 1. Configurar URL del Webhook en MercadoPago

En tu dashboard de MercadoPago, configura la URL del webhook:

```
https://tu-dominio.com/api/mercadopago/webhook
```

### 2. Eventos a Escuchar

El webhook maneja los siguientes eventos:

- `subscription_preapproval` - Creación/actualización de suscripciones
- `payment` - Pagos individuales
- `subscription_authorized_payment` - Pagos de suscripciones

## 🚀 Funcionalidades Implementadas

### 1. Gestión de Suscripciones

- ✅ Crear suscripciones desde MercadoPago
- ✅ Actualizar estado de suscripciones via webhook
- ✅ Cancelar suscripciones
- ✅ Historial de pagos
- ✅ Verificación de suscripciones activas

### 2. API Endpoints

- `GET /api/user/subscription` - Obtener suscripción del usuario
- `GET /api/subscription/plans` - Obtener planes disponibles
- `POST /api/user/subscription/[id]/cancel` - Cancelar suscripción
- `GET /api/mercadopago/success` - Manejar redirección exitosa

### 3. Hooks y Utilidades

- `useUserSubscription()` - Hook para manejar suscripciones en el frontend
- Funciones de utilidad en `lib/supabase/subscriptions.ts`
- Tipos TypeScript en `lib/supabase/types.ts`

## 📊 Estructura de Datos

### Tabla: subscription_plans

```sql
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  interval TEXT NOT NULL DEFAULT 'monthly',
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla: user_subscriptions

```sql
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  mercadopago_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔄 Flujo de Suscripción

1. **Usuario selecciona un plan** en `/protected/billing`
2. **Se crea la suscripción** en MercadoPago
3. **Usuario es redirigido** al checkout de MercadoPago
4. **Después del pago exitoso**, usuario es redirigido a `/api/mercadopago/success`
5. **Webhook recibe notificación** y actualiza la base de datos
6. **Usuario ve su suscripción** actualizada en la interfaz

## 🛡️ Seguridad

### Row Level Security (RLS)

Las tablas tienen políticas RLS configuradas:

- `subscription_plans`: Lectura pública
- `user_subscriptions`: Usuarios solo pueden ver sus propias suscripciones
- `subscription_payments`: Usuarios solo pueden ver pagos de sus suscripciones
- `webhook_events`: Solo accesible por el service role

### Validación de Webhooks

- Verificación de autenticidad de MercadoPago
- Registro de todos los eventos recibidos
- Manejo de errores robusto

## 🧪 Testing

### 1. Probar Creación de Suscripción

```bash
# Crear una suscripción de prueba
curl -X POST http://localhost:3000/api/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "planId": "basic"
  }'
```

### 2. Verificar Webhook

```bash
# Simular webhook de MercadoPago
curl -X POST http://localhost:3000/api/mercadopago/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscription_preapproval",
    "data": {
      "id": "test_subscription_id",
      "status": "authorized",
      "payer_email": "test@example.com",
      "external_reference": "basic_user123"
    }
  }'
```

## 🔧 Variables de Entorno

Asegúrate de tener estas variables configuradas:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token
MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key
```

## 📈 Monitoreo

### Logs Importantes

- Webhook events en `webhook_events` table
- Errores de suscripción en console logs
- Pagos fallidos en `subscription_payments` con status 'rejected'

### Métricas a Seguir

- Número de suscripciones activas
- Tasa de conversión (usuarios que completan el pago)
- Ingresos mensuales por plan
- Cancelaciones por mes

## 🚨 Troubleshooting

### Problema: Suscripción no se crea en Supabase

1. Verificar que el webhook está configurado correctamente
2. Revisar logs del webhook en Supabase
3. Verificar que el usuario existe en `auth.users`

### Problema: Usuario no encuentra su suscripción

1. Verificar que el usuario está autenticado
2. Revisar políticas RLS en `user_subscriptions`
3. Verificar que `user_id` coincide con el usuario autenticado

### Problema: Webhook no recibe eventos

1. Verificar URL del webhook en MercadoPago
2. Revisar que el endpoint está accesible públicamente
3. Verificar logs del servidor

## 📚 Recursos Adicionales

- [Documentación de MercadoPago Subscriptions](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/subscriptions)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) 