import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, QrCode } from "lucide-react";

type Props = {
  payload: string; // EMVCo completo vindo do backend no futuro
  merchantName?: string;
};

export function PixBox({ payload, merchantName = "Açaí Naturale" }: Props) {
  const [copied, setCopied] = React.useState(false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(payload)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  }

  return (
    <div className="rounded-2xl border bg-white p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <QrCode className="h-4 w-4" /> PIX — QR Code / Copia e cola
      </div>
      <div className="flex flex-col items-center justify-center gap-3">
        {/* QR gerado via serviço público; troque por geração local quando quiser */}
        <img src={qrUrl} alt="QR Code PIX" className="rounded-lg border" width={240} height={240} />
        <div className="text-xs text-slate-500">Pagador: {merchantName}</div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-600">Copia e cola (EMVCo)</label>
        <div className="flex gap-2">
          <input
            readOnly
            value={payload}
            className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-[13px] select-all"
          />
          <Button onClick={copy} className="rounded-xl" title="Copiar código">
            {copied ? <><Check className="h-4 w-4 mr-1" /> Copiado</> : <><Copy className="h-4 w-4 mr-1" /> Copiar</>}
          </Button>
        </div>
        <p className="text-[11px] text-slate-500">
          Dica: no app do banco, escolha <strong>PIX &gt; Copia e Cola</strong> e cole o código acima.
        </p>
      </div>
    </div>
  );
}
