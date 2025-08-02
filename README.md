# SaaS Boilerplate - Plataforma Completa

Una plataforma SaaS completa y moderna construida con Next.js 14, TypeScript, Supabase y MercadoPago. Incluye autenticación, facturación, gestión de usuarios y una interfaz de usuario coherente y profesional.

## 🚀 Características Principales

### 🔐 Autenticación Completa
- Registro de usuarios con validación
- Inicio de sesión seguro
- Recuperación de contraseña
- Gestión de sesiones con Supabase
- Middleware de protección de rutas

### 💳 Sistema de Facturación
- Integración completa con MercadoPago
- Planes de suscripción configurables
- Procesamiento de pagos en tiempo real
- Webhooks para actualizaciones automáticas
- Gestión de suscripciones

### 👤 Panel de Usuario
- Dashboard personalizado con estadísticas
- Configuración de perfil
- Gestión de seguridad
- Navegación intuitiva con sidebar
- Breadcrumbs para mejor UX

### 🎨 Interfaz Moderna
- Diseño responsive y accesible
- Tema claro/oscuro
- Componentes UI reutilizables
- Navegación coherente
- Experiencia de usuario fluida

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Pagos**: MercadoPago
- **UI**: Shadcn/ui, Lucide Icons
- **Deployment**: Vercel

## 📁 Estructura del Proyecto

```
saas-boilerplate/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── payments/      # Endpoints de MercadoPago
│   │   └── subscriptions/ # Gestión de suscripciones
│   ├── auth/              # Páginas de autenticación
│   ├── protected/         # Rutas protegidas
│   │   ├── billing/       # Gestión de facturación
│   │   └── settings/      # Configuración de usuario
│   └── layout.tsx         # Layout principal
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── auth/             # Componentes de autenticación
│   ├── billing/          # Componentes de facturación
│   └── settings/         # Componentes de configuración
├── lib/                  # Utilidades y configuraciones
│   ├── supabase/         # Cliente y middleware de Supabase
│   ├── mercadopago/      # Configuración de MercadoPago
│   └── utils.ts          # Utilidades generales
└── middleware.ts         # Middleware de autenticación
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Cuenta de MercadoPago

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/saas-boilerplate.git
   cd saas-boilerplate
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```

4. **Configurar Supabase**
   - Crear proyecto en [Supabase](https://supabase.com)
   - Configurar autenticación
   - Obtener URL y anon key

5. **Configurar MercadoPago**
   - Crear cuenta en [MercadoPago](https://mercadopago.com)
   - Obtener Access Token
   - Configurar webhooks

6. **Ejecutar el proyecto**
   ```bash
   npm run dev
   ```

## 🔧 Configuración

### Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu-access-token
MERCADOPAGO_WEBHOOK_SECRET=tu-webhook-secret

# Next.js
NEXTAUTH_SECRET=tu-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### Configuración de Supabase

1. Crear las tablas necesarias en Supabase
2. Configurar políticas de seguridad
3. Habilitar autenticación por email
4. Configurar templates de email

### Configuración de MercadoPago

1. Crear preferencias de pago
2. Configurar webhooks
3. Establecer planes de suscripción
4. Configurar notificaciones

## 📱 Características de UX/UI

### Navegación Coherente
- Sidebar responsive para navegación principal
- Breadcrumbs para orientación del usuario
- Navegación móvil optimizada
- Estados de carga y error consistentes

### Componentes Reutilizables
- `PageHeader`: Header consistente con breadcrumbs
- `StatsCard`: Tarjetas de estadísticas
- `Sidebar`: Navegación lateral
- `Breadcrumb`: Navegación de migas de pan

### Diseño Responsive
- Mobile-first approach
- Breakpoints optimizados
- Touch-friendly interfaces
- Accesibilidad mejorada

## 🔒 Seguridad

- Autenticación con Supabase Auth
- Middleware de protección de rutas
- Validación de datos en cliente y servidor
- Sanitización de inputs
- HTTPS obligatorio en producción

## 📊 Monitoreo y Analytics

- Logs de autenticación
- Tracking de pagos
- Métricas de uso
- Alertas de errores

## 🚀 Deployment

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en push

### Otros Proveedores

- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- 📧 Email: soporte@saas-boilerplate.com
- 💬 Discord: [SaaS Boilerplate Community](https://discord.gg/saas-boilerplate)
- 📖 Documentación: [docs.saas-boilerplate.com](https://docs.saas-boilerplate.com)

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) por la infraestructura backend
- [MercadoPago](https://mercadopago.com) por la pasarela de pagos
- [Vercel](https://vercel.com) por el hosting y deployment
- [Shadcn/ui](https://ui.shadcn.com) por los componentes UI
- [Next.js](https://nextjs.org) por el framework

---

**Desarrollado con ❤️ para la comunidad de desarrolladores SaaS**
