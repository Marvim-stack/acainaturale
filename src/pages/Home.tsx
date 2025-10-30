
import React from "react";
import AcaiBuilder from "@/components/AcaiBuilder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-4 pb-24">
      <section className="mt-6 grid lg:grid-cols-[1.2fr_1fr] gap-6 items-stretch">
        <div className="bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-3xl p-6 text-white shadow-md relative">
          <h2 className="text-2xl sm:text-3xl font-bold">Monte seu Açaí</h2>
          <p className="mt-2 text-white/90">Escolha o tamanho, adicione complementos e finalize em segundos.</p>
          <ul className="mt-4 text-sm text-white/90 space-y-1">
            <li>• Entrega média 40 min</li>
            <li>• PIX e Cartão</li>
            <li>• Checkout simples</li>
          </ul>
        </div>
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Como funciona</CardTitle>
            <CardDescription>3 passos e já foi.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            <Step n={1} title="Monte" desc="Tamanho + complementos." />
            <Step n={2} title="Endereço" desc="Entrega e contato." />
            <Step n={3} title="Pague" desc="PIX ou cartão." />
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <AcaiBuilder />
      </section>
    </main>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="p-3 rounded-2xl border bg-white">
      <div className="h-7 w-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-semibold">
        {n}
      </div>
      <div className="mt-2 font-medium">{title}</div>
      <div className="text-sm text-slate-500">{desc}</div>
    </div>
  );
}
