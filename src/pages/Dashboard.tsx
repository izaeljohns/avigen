import { Bird, Egg, TrendingUp, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "../context/AppContext";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { daysUntil, formatDate, formatMoney, hatchDate, hatchRate } from "../lib/utils";
import { BIRD_STATUS } from "../lib/labels";

export function DashboardPage() {
  const { birds, batches, incubators, transactions, health, property } = useApp();
  const liveBirds = birds.filter((b) => b.status !== "vendido" && b.status !== "abatido");
  const activeEggs = batches
    .filter((b) => b.status === "incubando")
    .reduce((s, b) => s + Math.max(0, b.quantity - b.discarded), 0);
  const costs = transactions.filter((t) => t.type === "custo").reduce((s, t) => s + t.amount, 0);
  const revenue = transactions.filter((t) => t.type === "receita").reduce((s, t) => s + t.amount, 0);
  const profit = revenue - costs;

  const byMonth = lastMonths(6).map((m) => {
    const txs = transactions.filter((t) => t.date.startsWith(m.key));
    return {
      name: m.label,
      Custos: round2(txs.filter((t) => t.type === "custo").reduce((s, t) => s + t.amount, 0)),
      Receitas: round2(txs.filter((t) => t.type === "receita").reduce((s, t) => s + t.amount, 0)),
    };
  });

  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = health.filter((h) => h.date === today);
  const incubating = batches.filter((b) => b.status === "incubando");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm text-slate-500">{property?.location}</p>
        <h2 className="text-xl font-semibold text-slate-900">{property?.name}</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Bird} label="Aves no plantel" value={String(liveBirds.length)} hint="Exceto vendidas/abatidas" />
        <Kpi icon={Egg} label="Ovos ativos na chocadeira" value={String(activeEggs)} hint={`${incubating.length} lote(s) incubando`} />
        <Kpi icon={Wallet} label="Custos" value={formatMoney(costs)} hint="Acumulado da unidade" />
        <Kpi
          icon={TrendingUp}
          label="Lucro"
          value={formatMoney(profit)}
          hint={`Receitas ${formatMoney(revenue)}`}
          positive={profit >= 0}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="px-5 py-4">
            <h3 className="font-semibold">Fluxo financeiro (6 meses)</h3>
          </div>
          <div className="h-64 px-2 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatMoney(Number(v))} />
                <Bar dataKey="Custos" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Receitas" fill="#0f766e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-semibold">Agenda de hoje</h3>
          <ul className="mt-3 space-y-3">
            {todayTasks.length === 0 && (
              <li className="text-sm text-slate-500">Nenhuma vacina, medicação ou tarefa para hoje.</li>
            )}
            {todayTasks.map((t) => (
              <li key={t.id} className="flex items-start justify-between gap-2 text-sm">
                <span className={t.status === "concluida" ? "text-slate-400 line-through" : ""}>{t.title}</span>
                <Badge tone={t.kind === "vacina" ? "sky" : t.kind === "medicacao" ? "violet" : "amber"}>
                  {t.kind}
                </Badge>
              </li>
            ))}
          </ul>
          <Link to="/manejo" className="mt-4 inline-block text-sm font-semibold text-brand-700">
            Abrir calendário →
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Lotes em incubação</h3>
            <Link to="/incubacao" className="text-sm font-semibold text-brand-700">
              Ver tudo
            </Link>
          </div>
          <div className="space-y-3">
            {incubating.length === 0 && <p className="text-sm text-slate-500">Nenhum lote ativo.</p>}
            {incubating.map((b) => {
              const hatch = hatchDate(b.entryDate);
              const left = daysUntil(hatch);
              const inc = incubators.find((i) => i.id === b.incubatorId);
              return (
                <div key={b.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{b.breed}</p>
                    <Badge tone="teal">{left >= 0 ? `${left} d` : "atrasado"}</Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {b.quantity} ovos · {inc?.name} · eclosão {formatDate(hatch)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold">Composição do plantel</h3>
          <ul className="mt-3 space-y-2">
            {Object.keys(BIRD_STATUS).map((st) => {
              const n = birds.filter((b) => b.status === st).length;
              return (
                <li key={st} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{BIRD_STATUS[st]}</span>
                  <span className="font-semibold">{n}</span>
                </li>
              );
            })}
          </ul>
          {batches.filter((b) => b.status === "eclodido").length > 0 && (
            <p className="mt-4 text-xs text-slate-400">
              Taxa média de eclosão nos lotes concluídos:{" "}
              {avgHatch(batches.filter((b) => b.status === "eclodido"))}%
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function avgHatch(batches: { quantity: number; hatched: number }[]) {
  const q = batches.reduce((s, b) => s + b.quantity, 0);
  const h = batches.reduce((s, b) => s + b.hatched, 0);
  return hatchRate(q, h);
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  positive,
}: {
  icon: typeof Bird;
  label: string;
  value: string;
  hint: string;
  positive?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="rounded-lg bg-brand-50 p-2 text-brand-800">
          <Icon size={16} />
        </span>
      </div>
      <p className={`mt-3 text-2xl font-bold ${positive === false ? "text-rose-600" : "text-slate-900"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </Card>
  );
}

function lastMonths(n: number) {
  const out: { key: string; label: string }[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const key = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`;
    out.push({
      key,
      label: x.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    });
  }
  return out;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
