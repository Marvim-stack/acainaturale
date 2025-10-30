// src/components/checkout/PixBoxMP.tsx
import React from "react";
import { X, Copy } from "lucide-react";

export interface PixBoxMPProps {
  merchantName: string;
  amount: number;              // valor total
  qrBase64: string;            // imagem QR em base64 vinda da API do MP
  qrText: string;              // payload "copia e cola" vinda da API do MP
  className?: string;
  onCopy?: () => void;         // callback ao copiar o código
  onClose?: () => void;        // callback ao fechar o box
}

export const PixBoxMP: React.FC<PixBoxMPProps> = ({
  merchantName,
  amount,
  qrBase64,
  qrText,
  className = "",
  onCopy,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(qrText || "");
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // noop
    }
  }

  return (
    <section className={`rounded-2xl border bg-white p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold">Pague com PIX</h3>
          <p className="text-sm text-slate-600">
            {merchantName} • Total:{" "}
            {amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </div>
        {onClose && (
          <button
            aria-label="Fechar PIX"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[220px_1fr]">
        <div className="rounded-xl border p-3 bg-white">
          {/* Imagem do QR Code */}
          {/* qrBase64 deve vir como "data:image/png;base64,..." da API */}
          {/* Se vier só o base64 puro, prefixe com `data:image/png;base64,` no backend */}
          <img
            src={qrBase64}
            alt="QR Code PIX"
            className="mx-auto aspect-square w-[200px] object-contain"
          />
        </div>

        <div className="space-y-3">
          <div className="text-sm text-slate-700">
            Escaneie o QR no app do seu banco, ou use <b>copia e cola</b> abaixo:
          </div>

          <div className="rounded-xl border bg-slate-50 p-3">
            <textarea
              className="w-full bg-transparent text-[13px] leading-snug outline-none resize-none"
              readOnly
              rows={4}
              value={qrText}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copiado!" : "Copiar código"}
            </button>
            {/* Dica/ajuda opcional */}
            <span className="self-center text-xs text-slate-500">
              O QR expira conforme regras do Mercado Pago.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
