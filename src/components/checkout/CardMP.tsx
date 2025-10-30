// src/components/checkout/CardMp.tsx
import React from "react";
import { createBricksBuilder } from "@/lib/mp";

type CardMpProps = {
  publicKey: string;      // VITE_MP_PUBLIC_KEY
  amount: number;         // valor total
  onSuccess?: (payment: any) => void;
  onError?: (err: any) => void;
};

export function CardMp({ publicKey, amount, onSuccess, onError }: CardMpProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const instanceRef = React.useRef<any>(null);

  React.useEffect(() => {
    let destroyed = false;
    (async () => {
      try {
        const bricks = await createBricksBuilder(publicKey);
        if (destroyed) return;

        const settings = {
          initialization: { amount },
          customization: {
            visual: { style: { theme: "default" } },
            paymentMethods: { maxInstallments: 1 }, // defina conforme sua loja
          },
          callbacks: {
            onReady: () => {},
            onError: (error: any) => { onError?.(error); },
            onSubmit: async ({ selectedInstallments, formData }: any) => {
              // formData → inclui token de cartão (formData.token) e dados do pagador
              try {
                const res = await fetch("/api/mp/process-card", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    token: formData.token,
                    amount,
                    installments: selectedInstallments || 1,
                    payer: {
                      email: formData.payer.email,
                      identification: formData.payer.identification,
                    },
                  }),
                });
                if (!res.ok) throw new Error("Falha ao processar pagamento");
                const data = await res.json();
                onSuccess?.(data);
              } catch (err) {
                onError?.(err);
              }
            },
          },
        };

        instanceRef.current = await bricks.create("cardPayment", "cardPaymentBrick_container", settings);
      } catch (e) {
        onError?.(e);
      }
    })();

    return () => {
      destroyed = true;
      if (instanceRef.current) instanceRef.current.destroy();
    };
  }, [publicKey, amount, onSuccess, onError]);

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div id="cardPaymentBrick_container" ref={ref} />
    </div>
  );
}
