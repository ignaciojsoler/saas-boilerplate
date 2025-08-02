import { MercadoPagoConfig, PreApproval } from "mercadopago";

export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const api = {
  async suscribe(email: string): Promise<string> {
    const suscription = await new PreApproval(mercadopago).create({
      body: {
        back_url: process.env.NEXT_PUBLIC_SITE_URL!,
        reason: "Suscripción a mensajes de muro",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 100,
          currency_id: "ARS",
        },
        payer_email: email,
        status: "pending",
      },
    });

    return suscription.init_point!;
  },
};

export default api;
