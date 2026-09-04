import { FormEvent, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Field, Input, Select, Textarea } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { formatDate, formatMoney, todayISO } from "../lib/utils";
import { COST_CATS, REVENUE_CATS } from "../lib/labels";
import type { Transaction, TxType } from "../types";

export function FinancePage() {
  const { transactions, saveTx, deleteTx } = useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<"todos" | TxType>("todos");

  const costs = transactions.filter((t) => t.type === "custo").reduce((s, t) => s + t.amount, 0);
  const revenue = transactions.filter((t) => t.type === "receita").reduce((s, t) => s + t.amount, 0);
  const rows = [...transactions]
    .filter((t) => (filter === "todos" ? true : t.type === filter))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Receitas</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{formatMoney(revenue)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Custos</p>
          <p className="mt-1 text-2xl font-bold text-rose-600">{formatMoney(costs)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Resultado</p>
          <p className={`mt-1 text-2xl font-bold ${revenue - costs >= 0 ? "text-slate-900" : "text-rose-600"}`}>
            {formatMoney(revenue - costs)}
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["todos", "custo", "receita"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "primary" : "secondary"} onClick={() => setFilter(f)}>
              {f === "todos" ? "Tudo" : f === "custo" ? "Custos" : "Receitas"}
            </Button>
          ))}
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus size={16} /> Lançamento
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{formatDate(t.date)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{t.description}</p>
                    <Badge tone={t.type === "custo" ? "rose" : "emerald"}>{t.type}</Badge>
                  </td>
                  <td className="px-4 py-3">{t.category}</td>
                  <td className={`px-4 py-3 font-semibold ${t.type === "custo" ? "text-rose-600" : "text-emerald-700"}`}>
                    {t.type === "custo" ? "−" : "+"}
                    {formatMoney(t.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditing(t);
                        setOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button variant="ghost" className="text-rose-600" onClick={() => deleteTx(t.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    Nenhum lançamento. Registre ração, equipamentos e vendas de ovos ou aves.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TxModal
        open={open}
        initial={editing}
        onClose={() => setOpen(false)}
        onSave={(data) => {
          saveTx(data);
          setOpen(false);
        }}
      />
    </div>
  );
}

function TxModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Transaction | null;
  onClose: () => void;
  onSave: (t: Omit<Transaction, "id" | "propertyId"> & { id?: string }) => void;
}) {
  const [type, setType] = useState<TxType>("custo");
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState(COST_CATS[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const key = `${open}-${initial?.id ?? "new"}`;
  const [seen, setSeen] = useState("");
  if (open && seen !== key) {
    setSeen(key);
    setType(initial?.type ?? "custo");
    setDate(initial?.date ?? todayISO());
    setCategory(initial?.category ?? COST_CATS[0]);
    setDescription(initial?.description ?? "");
    setAmount(initial?.amount ?? 0);
  }
  const cats = type === "custo" ? COST_CATS : REVENUE_CATS;

  return (
    <Modal open={open} title={initial ? "Editar lançamento" : "Novo lançamento"} onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSave({
            id: initial?.id,
            type,
            date,
            category,
            description,
            amount: Number(amount),
          });
        }}
      >
        <Field label="Tipo">
          <Select
            value={type}
            onChange={(e) => {
              const v = e.target.value as TxType;
              setType(v);
              setCategory(v === "custo" ? COST_CATS[0] : REVENUE_CATS[0]);
            }}
          >
            <option value="custo">Custo</option>
            <option value="receita">Receita</option>
          </Select>
        </Field>
        <Field label="Data">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        <Field label="Categoria">
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {cats.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Descrição">
          <Textarea required value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Valor (R$)">
          <Input
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}
