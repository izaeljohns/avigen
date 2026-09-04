import { FormEvent, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Field, Input, Select, Textarea } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { formatDate, todayISO } from "../lib/utils";
import { cn } from "../lib/cn";
import type { HealthEvent, HealthKind } from "../types";

export function HealthPage() {
  const { health, birds, saveHealth, deleteHealth, toggleHealth } = useApp();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(todayISO());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HealthEvent | null>(null);

  const monthDays = useMemo(() => buildMonth(cursor), [cursor]);
  const byDate = useMemo(() => {
    const map: Record<string, HealthEvent[]> = {};
    for (const h of health) {
      (map[h.date] ??= []).push(h);
    }
    return map;
  }, [health]);

  const dayItems = health.filter((h) => h.date === selected).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Vacinas, medicação e tarefas diárias por unidade.</p>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus size={16} /> Novo evento
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-4 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            >
              <ChevronLeft size={18} />
            </Button>
            <h2 className="text-base font-semibold capitalize">
              {cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </h2>
            <Button
              variant="ghost"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-slate-400">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {monthDays.map((cell, idx) => {
              if (!cell) return <div key={`empty-${idx}`} />;
              const iso = toISO(cell);
              const items = byDate[iso] ?? [];
              const isSel = iso === selected;
              const isToday = iso === todayISO();
              return (
                <button
                  key={iso}
                  onClick={() => setSelected(iso)}
                  className={cn(
                    "min-h-16 rounded-xl border p-1.5 text-left text-sm transition",
                    isSel ? "border-brand-600 bg-brand-50" : "border-transparent hover:bg-slate-50",
                    isToday && !isSel && "ring-1 ring-brand-200",
                  )}
                >
                  <span className="text-xs font-semibold">{cell.getDate()}</span>
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {items.slice(0, 3).map((it) => (
                      <span
                        key={it.id}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          it.kind === "vacina" ? "bg-sky-500" : it.kind === "medicacao" ? "bg-violet-500" : "bg-amber-500",
                        )}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold">{formatDate(selected)}</h3>
          <ul className="mt-3 space-y-3">
            {dayItems.length === 0 && <li className="text-sm text-slate-500">Nada programado neste dia.</li>}
            {dayItems.map((h) => (
              <li key={h.id} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={cn("font-medium", h.status === "concluida" && "text-slate-400 line-through")}>
                      {h.title}
                    </p>
                    <p className="text-xs text-slate-500">{h.description}</p>
                    {h.birdId && (
                      <p className="mt-1 text-xs text-slate-400">
                        Ave {birds.find((b) => b.id === h.birdId)?.ringCode}
                      </p>
                    )}
                  </div>
                  <Badge tone={h.kind === "vacina" ? "sky" : h.kind === "medicacao" ? "violet" : "amber"}>
                    {h.kind}
                  </Badge>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button variant="secondary" onClick={() => toggleHealth(h.id)}>
                    <Check size={14} /> {h.status === "concluida" ? "Reabrir" : "Concluir"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditing(h);
                      setOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button variant="ghost" className="text-rose-600" onClick={() => deleteHealth(h.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <HealthModal
        open={open}
        initial={editing}
        defaultDate={selected}
        onClose={() => setOpen(false)}
        onSave={(data) => {
          saveHealth(data);
          setOpen(false);
        }}
      />
    </div>
  );
}

function HealthModal({
  open,
  initial,
  defaultDate,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: HealthEvent | null;
  defaultDate: string;
  onClose: () => void;
  onSave: (h: Omit<HealthEvent, "id" | "propertyId"> & { id?: string }) => void;
}) {
  const { birds } = useApp();
  const [date, setDate] = useState(defaultDate);
  const [kind, setKind] = useState<HealthKind>("tarefa");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [birdId, setBirdId] = useState("");
  const key = `${open}-${initial?.id ?? "new"}-${defaultDate}`;
  const [seen, setSeen] = useState("");
  if (open && seen !== key) {
    setSeen(key);
    setDate(initial?.date ?? defaultDate);
    setKind(initial?.kind ?? "tarefa");
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setBirdId(initial?.birdId ?? "");
  }

  return (
    <Modal open={open} title={initial ? "Editar evento" : "Novo evento sanitário"} onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSave({
            id: initial?.id,
            date,
            kind,
            title,
            description,
            birdId: birdId || undefined,
            status: initial?.status ?? "pendente",
          });
        }}
      >
        <Field label="Data">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        <Field label="Tipo">
          <Select value={kind} onChange={(e) => setKind(e.target.value as HealthKind)}>
            <option value="vacina">Vacina</option>
            <option value="medicacao">Medicação</option>
            <option value="tarefa">Tarefa</option>
          </Select>
        </Field>
        <Field label="Título">
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Detalhes">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Ave (opcional)">
          <Select value={birdId} onChange={(e) => setBirdId(e.target.value)}>
            <option value="">Plantel / lote geral</option>
            {birds.map((b) => (
              <option key={b.id} value={b.id}>
                {b.ringCode} · {b.breed}
              </option>
            ))}
          </Select>
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

function buildMonth(cursor: Date) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
