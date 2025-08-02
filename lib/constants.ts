// Application constants
export const APP_NAME = "SaaS Boilerplate";

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  SIGN_UP: "/auth/sign-up",
  FORGOT_PASSWORD: "/auth/forgot-password",
  UPDATE_PASSWORD: "/auth/update-password",
  SIGN_UP_SUCCESS: "/auth/sign-up-success",
  PROTECTED: "/protected",
  BILLING: "/protected/billing",
  SETTINGS: "/protected/settings",
} as const;

// Status messages
export const STATUS_MESSAGES = {
  SUCCESS: "¡Pago procesado exitosamente! Tu suscripción está activa.",
  ERROR: "Error al procesar el pago. Por favor, intenta nuevamente.",
  PENDING: "Tu pago está siendo procesado. Te notificaremos cuando esté listo.",
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  PASSWORDS_DONT_MATCH: "Passwords do not match",
  GENERIC_ERROR: "An error occurred",
} as const;

// Payment methods
export const PAYMENT_METHODS = [
  "Tarjetas de crédito y débito",
  "Transferencias bancarias", 
  "Billeteras digitales",
  "Pago en efectivo",
] as const;

// Refund policy
export const REFUND_POLICY = [
  "Cancelación en cualquier momento",
  "Reembolso prorrateado",
  "Sin cargos ocultos",
  "Soporte 24/7",
] as const; 