// src/components/checkout/Checkout.tsx
import React from "react";
import { useCart } from "@/context/CartContext";
import { money } from "@/lib/money";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, CreditCard, QrCode, X, Copy, Check } from "lucide-react";
import { CONFIG } from "@/config/store";
import { geocode, haversineKm, onlyDigits, viaCep, type LatLng } from "@/lib/geo";
import { MP_ENABLED, postJSON } from "@/lib/api"; // flags/API

/* ---------- estilos auxiliares ---------- */
const inputBase =
  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-[15px] " +
  "outline-none transition placeholder:text-slate-400 " +
  "focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20";
const textareaBase =
  "min-h-[96px] w-full rounded-xl border border-slate-300 bg-white p-3 text-[15px] " +
  "outline-none transition placeholder:text-slate-400 " +
  "focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 resize-y";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border bg-white p-4 ${className}`}>{children}</section>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-base font-semibold">{children}</h3>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-slate-700">{children}</label>;
}
function Field({
  label, children, error,
}: { label: React.ReactNode; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

/* Box inline do QR PIX */
function PixInlineBox(props: {
  merchantName: string;
  amount: number;
  qrBase64: string;
  qrText: string;
  onClose?: () => void;
}) {
  const [copied, setCopied] = React.useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(props.qrText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <div className="font-medium">{props.merchantName}</div>
          <div className="text-slate-500">PIX • {money(props.amount)}</div>
        </div>
        {props.onClose ? (
          <button
            onClick={props.onClose}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg border hover:bg-slate-50"
            aria-label="Fechar QR"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[180px_1fr] items-start">
        <div className="rounded-xl border p-2 bg-white">
          <img
            src={`data:image/png;base64,${props.qrBase64}`}
            alt="QR PIX"
            className="block h-auto w-full"
          />
        </div>
        <div className="space-y-2">
          <div className="text-sm text-slate-600">
            Escaneie o QR ao lado ou use o código “copia e cola” abaixo.
          </div>
          <div className="rounded-xl border bg-slate-50 p-3 text-xs break-all max-h-28 overflow-auto">
            {props.qrText}
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={copy} className="rounded-xl">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copiado!" : "Copiar código"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- componente ---------- */
export function Checkout() {
  const { items, subtotal } = useCart();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("checkout:open", onOpen as EventListener);
    return () => window.removeEventListener("checkout:open", onOpen as EventListener);
  }, []);

  const [form, setForm] = React.useState({
    name: "", whatsapp: "", email: "",
    street: "", number: "", district: "", city: "",
    reference: "",
    payment: "pix" as "pix" | "card",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [zip, setZip] = React.useState("");
  const [distanceKm, setDistanceKm] = React.useState<number | null>(null);
  const [deliveryDyn, setDeliveryDyn] = React.useState<number | null>(null);
  const [outsideArea, setOutsideArea] = React.useState(false);
  const [storeLL, setStoreLL] = React.useState<LatLng | null>(null);

  const [isBusy, setIsBusy] = React.useState(false);
  const [mpPix, setMpPix] = React.useState<{ qr?: string; text?: string; id?: string } | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  React.useEffect(() => { setMpPix(null); }, [form.payment]);

  function fmtKm(km: number | null) {
    if (km == null) return "—";
    return `${km.toFixed(1)} km`;
  }

  function priceByDistance(km: number, currentSubtotal: number) {
    if ((currentSubtotal ?? 0) >= CONFIG.delivery.freeFrom) return 0;
    const { freeRadiusKm, baseFee, perKmAfterFree } = CONFIG.delivery.pricing;
    if (km <= freeRadiusKm) return 0;
    const extra = Math.max(0, km - freeRadiusKm);
    return Math.round((baseFee + extra * perKmAfterFree) * 100) / 100;
  }

  async function ensureStoreLatLng() {
    if (storeLL) return storeLL;
    const ll = await geocode(CONFIG.delivery.store.address);
    if (ll) setStoreLL(ll);
    return ll;
  }

  async function refreshDistance() {
    const cep = onlyDigits(zip);
    if (cep.length !== 8 || !form.street.trim() || !form.number.trim() || !form.city.trim()) {
      setDistanceKm(null); setDeliveryDyn(null); setOutsideArea(false); return;
    }
    const sLL = await ensureStoreLatLng();
    if (!sLL) { setDistanceKm(null); setDeliveryDyn(null); setOutsideArea(false); return; }
    const addr = `${form.street} ${form.number}, ${form.district}, ${form.city} ${cep}`;
    const to = await geocode(addr);
    if (!to) { setDistanceKm(null); setDeliveryDyn(null); setOutsideArea(false); return; }

    const km = haversineKm(sLL, to);
    setDistanceKm(km);
    const { maxKm } = CONFIG.delivery.pricing;
    const outside = km > maxKm;
    setOutsideArea(outside);
    setDeliveryDyn(outside ? null : priceByDistance(km, subtotal ?? 0));
  }

  async function onCepBlur() {
    const data = await viaCep(zip);
    if (data) {
      if (!form.street) set("street", data.street || "");
      if (!form.district) set("district", data.district || "");
      if (!form.city) set("city", `${data.city || ""}`);
    }
    refreshDistance();
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Informe seu nome.";
    if (!form.whatsapp.trim()) e.whatsapp = "Informe o WhatsApp.";
    if (onlyDigits(zip).length !== 8) e.zip = "Informe um CEP válido (8 dígitos).";
    if (!form.street.trim()) e.street = "Informe a rua.";
    if (!form.number.trim()) e.number = "Informe o número.";
    if (!form.district.trim()) e.district = "Informe o bairro.";
    if (!form.city.trim()) e.city = "Informe a cidade.";
    if (outsideArea) e.city = "Endereço fora da área de entrega.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const deliveryDisplay = outsideArea ? null : (deliveryDyn ?? 0);
  const totalDisplay =
    deliveryDisplay == null ? null : Math.round(((subtotal ?? 0) + deliveryDisplay) * 100) / 100;

  React.useEffect(() => {
    const t = setTimeout(() => {
      if (onlyDigits(zip).length === 8 && form.street && form.number && form.city) {
        refreshDistance();
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zip, form.street, form.number, form.district, form.city]);

  /* ---------- AÇÕES MP ---------- */
  async function createPixPreference(amount: number) {
    if (!MP_ENABLED) {
      alert("Pagamento online ainda não está habilitado neste ambiente.");
      return;
    }
    if (!totalDisplay || outsideArea || isBusy) return;

    setIsBusy(true);
    try {
      const payload = {
        title: "Pedido Açaí Naturale",
        amount: Number(amount.toFixed(2)),
        payer: { name: form.name, email: form.email || undefined, phone: form.whatsapp },
      };
      const data = await postJSON<{ qr_base64: string; qr_text: string; id: string }>(
        "/payments/mp/pix",
        payload
      );
      setMpPix({ qr: data.qr_base64, text: data.qr_text, id: data.id });
    } catch (err: any) {
      alert(err?.message || "Falha ao gerar PIX. Tente novamente.");
    } finally {
      setIsBusy(false);
    }
  }

  async function payWithCard(amount: number) {
    if (!MP_ENABLED) {
      alert("Pagamento online ainda não está habilitado neste ambiente.");
      return;
    }
    if (!totalDisplay || outsideArea || isBusy) return;

    setIsBusy(true);
    try {
      const data = await postJSON<{ init_point: string }>("/payments/mp/card", {
        title: "Pedido Açaí Naturale",
        amount: Number(amount.toFixed(2)),
      });
      window.location.href = data.init_point;
    } catch (err: any) {
      alert(err?.message || "Falha ao iniciar pagamento. Tente novamente.");
    } finally {
      setIsBusy(false);
    }
  }

  function submit() {
    if (!validate()) return;

    if (form.payment === "pix" && MP_ENABLED) {
      if (!totalDisplay) return;
      void createPixPreference(totalDisplay);
      return;
    }
    if (form.payment === "card" && MP_ENABLED) {
      if (!totalDisplay) return;
      void payWithCard(totalDisplay);
      return;
    }

    // Sem MP
    console.log("Pedido (sem MP online):", {
      items,
      subtotal: subtotal ?? 0,
      delivery: deliveryDisplay,
      total: totalDisplay,
      distanceKm,
      form: { ...form, zip },
    });
    alert("Pedido enviado! Te chamaremos no WhatsApp para confirmar. 😊");
    setOpen(false);
    setErrors({});
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) { setErrors({}); setMpPix(null); setIsBusy(false); }
      }}
    >
      <SheetContent size="xl" className="p-0">
        <div className="flex h-full min-h-0 flex-col">
          {/* Header */}
          <div className="sticky top-0 z-[1002] border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
            <div className="h-14 px-6 flex items-center justify-between">
              <SheetHeader>
                <SheetTitle className="text-lg sm:text-xl">Finalizar pedido</SheetTitle>
              </SheetHeader>
              <SheetClose asChild>
                <button
                  aria-label="Fechar checkout"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </SheetClose>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-24 pt-6">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
              {/* ESQUERDA — formulário */}
              <div className="space-y-6">
                <Card>
                  <H3>Contato</H3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nome" error={errors.name}>
                      <input className={inputBase} value={form.name}
                        onChange={(e) => set("name", e.target.value)} placeholder="Seu nome completo" />
                    </Field>
                    <Field label="WhatsApp" error={errors.whatsapp}>
                      <input className={inputBase} value={form.whatsapp}
                        onChange={(e) => set("whatsapp", e.target.value)} placeholder="(xx) xxxxx-xxxx" />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="E-mail (opcional)">
                        <input className={inputBase} value={form.email}
                          onChange={(e) => set("email", e.target.value)} placeholder="voce@email.com" />
                      </Field>
                    </div>
                  </div>
                </Card>

                <Card>
                  <H3>Endereço de entrega</H3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="CEP" error={errors.zip}>
                      <input className={inputBase} value={zip}
                        onChange={(e) => setZip(e.target.value)} onBlur={onCepBlur}
                        placeholder="00000-000" inputMode="numeric" maxLength={9} />
                    </Field>
                    <div />
                    <Field label="Rua" error={errors.street}>
                      <input className={inputBase} value={form.street}
                        onChange={(e) => set("street", e.target.value)} onBlur={refreshDistance}
                        placeholder="Ex.: Av. Brasil" />
                    </Field>
                    <Field label="Número" error={errors.number}>
                      <input className={inputBase} value={form.number}
                        onChange={(e) => set("number", e.target.value)} onBlur={refreshDistance}
                        placeholder="123" />
                    </Field>
                    <Field label="Bairro" error={errors.district}>
                      <input className={inputBase} value={form.district}
                        onChange={(e) => set("district", e.target.value)} onBlur={refreshDistance}
                        placeholder="Centro" />
                    </Field>
                    <Field label="Cidade" error={errors.city}>
                      <input className={inputBase} value={form.city}
                        onChange={(e) => set("city", e.target.value)} onBlur={refreshDistance}
                        placeholder="Porto Alegre" />
                    </Field>
                  </div>
                  <div className="mt-4">
                    <Field label="Referência (opcional)">
                      <textarea className={textareaBase} value={form.reference}
                        onChange={(e) => set("reference", e.target.value)}
                        placeholder="Ex.: portão branco, próximo ao mercado…" />
                    </Field>
                  </div>
                </Card>

                {/* Pagamento (mobile/tablet) */}
                <div className="lg:hidden">
                  <Card>
                    <H3>Pagamento</H3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button" onClick={() => set("payment", "pix")}
                        className={[
                          "flex items-center gap-3 rounded-2xl border p-3 text-left transition",
                          form.payment === "pix"
                            ? "border-purple-600 ring-2 ring-purple-500/30 bg-purple-50"
                            : "border-slate-200 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                          <QrCode className="h-5 w-5" />
                        </div>
                        <div className="grow">
                          <div className="font-medium">PIX</div>
                          <div className="text-sm text-slate-500">
                            {MP_ENABLED ? "QR / cópia e cola" : "Desabilitado neste ambiente"}
                          </div>
                        </div>
                        {form.payment === "pix" ? <CheckCircle2 className="h-5 w-5 text-purple-600" /> : null}
                      </button>

                      <button
                        type="button" onClick={() => set("payment", "card")}
                        className={[
                          "flex items-center gap-3 rounded-2xl border p-3 text-left transition",
                          form.payment === "card"
                            ? "border-purple-600 ring-2 ring-purple-500/30 bg-purple-50"
                            : "border-slate-200 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div className="grow">
                          <div className="font-medium">Cartão</div>
                          <div className="text-sm text-slate-500">
                            {MP_ENABLED ? "Mercado Pago (online)" : "Desabilitado neste ambiente"}
                          </div>
                        </div>
                        {form.payment === "card" ? <CheckCircle2 className="h-5 w-5 text-purple-600" /> : null}
                      </button>
                    </div>

                    {form.payment === "pix" && MP_ENABLED && mpPix?.qr && (
                      <div className="mt-3">
                        <PixInlineBox
                          merchantName="Açaí Naturale"
                          amount={totalDisplay ?? 0}
                          qrBase64={mpPix.qr}
                          qrText={mpPix.text || ""}
                          onClose={() => setMpPix(null)}
                        />
                      </div>
                    )}

                    {!MP_ENABLED && (
                      <p className="mt-2 text-xs text-slate-500">
                        Pagamentos online desabilitados neste ambiente. Confirme o pedido e pague na entrega.
                      </p>
                    )}
                  </Card>
                </div>
              </div>

              {/* DIREITA — resumo + pagamento (desktop) */}
              <aside className="hidden lg:block">
                <div className="sticky top-6 space-y-4">
                  <Card>
                    <H3>Resumo do pedido</H3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{money(subtotal ?? 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Entrega</span>
                        <span>
                          {outsideArea
                            ? "Fora da área"
                            : deliveryDisplay === 0
                            ? "Grátis"
                            : money(deliveryDisplay ?? 0)}
                        </span>
                      </div>
                      {distanceKm != null && (
                        <div className="mt-1 text-xs text-slate-500">
                          Distância estimada: {fmtKm(distanceKm)}
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-semibold text-base pt-1">
                        <span>Total</span>
                        <span>{outsideArea || totalDisplay == null ? "—" : money(totalDisplay ?? 0)}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Entrega média {CONFIG.delivery.estimateMins} min • Frete grátis a partir de {money(CONFIG.delivery.freeFrom)}
                      </p>
                    </div>
                  </Card>

                  <Card>
                    <H3>Pagamento</H3>
                    <div className="grid gap-3">
                      <button
                        type="button" onClick={() => set("payment", "pix")}
                        className={[
                          "flex items-center gap-3 rounded-2xl border p-3 text-left transition",
                          form.payment === "pix"
                            ? "border-purple-600 ring-2 ring-purple-500/30 bg-purple-50"
                            : "border-slate-200 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                          <QrCode className="h-5 w-5" />
                        </div>
                        <div className="grow">
                          <div className="font-medium">PIX</div>
                          <div className="text-sm text-slate-500">
                            {MP_ENABLED ? "QR / cópia e cola" : "Desabilitado neste ambiente"}
                          </div>
                        </div>
                        {form.payment === "pix" ? <CheckCircle2 className="h-5 w-5 text-purple-600" /> : null}
                      </button>

                      <button
                        type="button" onClick={() => set("payment", "card")}
                        className={[
                          "flex items-center gap-3 rounded-2xl border p-3 text-left transition",
                          form.payment === "card"
                            ? "border-purple-600 ring-2 ring-purple-500/30 bg-purple-50"
                            : "border-slate-200 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div className="grow">
                          <div className="font-medium">Cartão</div>
                          <div className="text-sm text-slate-500">
                            {MP_ENABLED ? "Mercado Pago (online)" : "Desabilitado neste ambiente"}
                          </div>
                        </div>
                        {form.payment === "card" ? <CheckCircle2 className="h-5 w-5 text-purple-600" /> : null}
                      </button>
                    </div>

                    {form.payment === "pix" && MP_ENABLED && mpPix?.qr && (
                      <div className="mt-3">
                        <PixInlineBox
                          merchantName="Açaí Naturale"
                          amount={totalDisplay ?? 0}
                          qrBase64={mpPix.qr}
                          qrText={mpPix.text || ""}
                          onClose={() => setMpPix(null)}
                        />
                      </div>
                    )}

                    {!MP_ENABLED && (
                      <p className="mt-2 text-xs text-slate-500">
                        Pagamentos online desabilitados neste ambiente. Confirme o pedido e pague na entrega.
                      </p>
                    )}
                  </Card>
                </div>
              </aside>
            </div>
          </div>

          {/* Rodapé sticky com CTA */}
          <div className="sticky bottom-0 left-0 right-0 border-t bg-white">
            <div className="mx-6 flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="sm:hidden">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold">
                    {outsideArea || totalDisplay == null ? "—" : money(totalDisplay ?? 0)}
                  </span>
                </div>
                {distanceKm != null && (
                  <div className="mt-1 text-xs text-slate-500">Distância estimada: {fmtKm(distanceKm)}</div>
                )}
              </div>
              <div className="flex-1" />
              <Button
                className="rounded-xl w-full sm:w-auto"
                onClick={submit}
                disabled={isBusy || items.length === 0 || outsideArea || totalDisplay == null}
              >
                {isBusy ? "Processando…" :
                 form.payment === "pix" && MP_ENABLED ? "Gerar QR PIX" :
                 form.payment === "card" && MP_ENABLED ? "Pagar com cartão" :
                 outsideArea ? "Fora da área de entrega" : "Confirmar pedido"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
