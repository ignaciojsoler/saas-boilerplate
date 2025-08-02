-- Script para crear las tablas de suscripciones en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Tabla de planes de suscripción
CREATE TABLE IF NOT EXISTS subscription_plans (
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

-- Tabla de suscripciones de usuarios
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  mercadopago_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'suspended', 'expired')),
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

-- Tabla de pagos de suscripciones
CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  mercadopago_payment_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
  payment_method TEXT,
  payment_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de eventos de webhook
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mercadopago_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_mercadopago_id ON user_subscriptions(mercadopago_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_mercadopago_payment_id ON subscription_payments(mercadopago_payment_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_mercadopago_id ON webhook_events(mercadopago_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_payments_updated_at BEFORE UPDATE ON subscription_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar planes de suscripción por defecto
INSERT INTO subscription_plans (id, name, description, price, currency, interval, features) VALUES
('basic', 'Plan Básico', 'Plan básico para usuarios individuales', 1000.00, 'ARS', 'monthly', '["Acceso básico a la plataforma", "Soporte por email", "1 proyecto activo"]'),
('pro', 'Plan Profesional', 'Plan profesional para equipos pequeños', 3000.00, 'ARS', 'monthly', '["Todo del plan básico", "Soporte prioritario", "5 proyectos activos", "Análisis avanzado"]'),
('enterprise', 'Plan Empresarial', 'Plan empresarial para organizaciones grandes', 10000.00, 'ARS', 'monthly', '["Todo del plan profesional", "Soporte 24/7", "Proyectos ilimitados", "API personalizada", "Integración dedicada"]')
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS (Row Level Security)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Políticas para subscription_plans (lectura pública)
CREATE POLICY "subscription_plans_read_policy" ON subscription_plans
  FOR SELECT USING (true);

-- Políticas para user_subscriptions
CREATE POLICY "user_subscriptions_read_policy" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_insert_policy" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_update_policy" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para subscription_payments
CREATE POLICY "subscription_payments_read_policy" ON subscription_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_subscriptions 
      WHERE user_subscriptions.id = subscription_payments.subscription_id 
      AND user_subscriptions.user_id = auth.uid()
    )
  );

-- Políticas para webhook_events (solo para servicios internos)
CREATE POLICY "webhook_events_service_policy" ON webhook_events
  FOR ALL USING (auth.role() = 'service_role'); 