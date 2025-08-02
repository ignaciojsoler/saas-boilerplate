import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configurar MercadoPago siguiendo la guía de Ignacio
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

// Crear instancia de Preference
const preference = new Preference(client);

export { client, preference }; 