import { redirect } from "next/navigation";

import { mercadopagoApi } from "@/lib/mercadopago/api";

export default function SuscripcionesPage() {
  async function suscribe(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;

    if (!email) {
      throw new Error("Email requerido");
    }

    const url = await mercadopagoApi.suscribe(email);

    redirect(url);
  }

  return (
    <form action={suscribe} className="grid gap-4 max-w-sm mx-auto mt-10">
      <input
        name="email"
        placeholder="goncy@goncy.com"
        type="email"
        required
        className="border px-4 py-2 rounded"
      />
      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        Suscribirse
      </button>
    </form>
  );
}
