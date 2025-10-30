// src/lib/mp.ts
export function loadMpSdk(publicKey: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).MercadoPago) {
      return resolve((window as any).MercadoPago);
    }
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => {
      const MP = (window as any).MercadoPago;
      if (!MP) return reject(new Error("MP SDK não carregado"));
      resolve(MP);
    };
    script.onerror = () => reject(new Error("Falha ao carregar MP SDK"));
    document.head.appendChild(script);
  });
}

export async function createBricksBuilder(publicKey: string) {
  const MP = await loadMpSdk(publicKey);
  // locale “pt-BR” melhora placeholders
  return new MP(publicKey, { locale: "pt-BR" }).bricks();
}

/** Chama seu backend para gerar PIX */
export async function apiCreatePix(payload: {
  amount: number;
  description: string;
  payer: { email?: string; first_name?: string; last_name?: string; };
}) {
  const res = await fetch("/api/mp/create-pix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Falha ao gerar PIX");
  return res.json() as Promise<{
    qr_code_base64: string;
    qr_code: string;
    id: string; // payment id
  }>;
}

/** Chama seu backend para processar cartão */
export async function apiProcessCard(payload: {
  token: string;
  amount: number;
  installments: number;
  payer: { email?: string; identification?: { type: string; number: string } };
}) {
  const res = await fetch("/api/mp/process-card", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Falha ao processar cartão");
  return res.json();
}
