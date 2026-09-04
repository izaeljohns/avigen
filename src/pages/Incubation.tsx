import { FormEvent, useState } from "react";
import { Egg, Plus, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Field, Input, Select, Textarea } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { daysUntil, formatDate, hatchDate, hatchRate, todayISO } from "../lib/utils";
import { BREEDS } from "../lib/labels";
import type { BatchStatus, EggBatch, Incubator, IncubatorType } from "../types";

export function IncubationPage() {
  const { incubators, batches, saveIncubator, deleteIncubator, saveBatch, deleteBatch } = useApp();
  const [incOpen, setIncOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [editInc, setEditInc] = useState<Incubator | null>(null);
  const [editBatch, setEditBatch] = useState<EggBatch | null>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Unidades de incubação</h2>
          <Button
            onClick={() => {
              setEditInc(null);
              setIncOpen(true);
            }}
          >
            <Plus size={16} /> Chocadeira
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {incubators.map((i) => {
            const occ = batches
              .filter((b) => b.incubatorId === i.id && b.status === "incubando")
              .reduce((s, b) => s + Math.max(0, b.quantity - b.discarded), 0);
            return (
              <Card key={i.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-amber-50 p-2 text-amber-700">
                      <Egg size={18} />
                    </span>
                    <div>
                      <p className="font-semibold">{i.name}</p>
                      <p className="text-xs text-slate-500">
                        {i.type === "mecanica" ? "Mecânica" : "Natural"} · cap. {i.capacity}
                      </p>
                    </div>
                  </div>
                  <Badge tone={occ > i.capacity ? "rose" : "teal"}>
                    {occ}/{i.capacity}
                  </Badge>
                </div>
                {i.notes && <p className="mt-3 text-sm text-slate-600">{i.notes}</p>}
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditInc(i);
                      setIncOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-rose-600"
                    onClick={() => {
                      if (confirm("Excluir chocadeira e seus lotes?")) deleteIncubator(i.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            );
          })}
          {incubators.length === 0 && (
            <Card className="p-8 text-sm text-slate-500">Cadastre chocadeiras mecânicas ou ninhos naturais.</Card>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Lotes de ovos</h2>
          <Button
            disabled={incubators.length === 0}
            onClick={() => {
              setEditBatch(null);
              setBatchOpen(true);
            }}
          >
            <Plus size={16} /> Novo lote
          </Button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Entrada</th>
                  <th className="px-4 py-3">Raça</th>
                  <th className="px-4 py-3">Qtd</th>
                  <th className="px-4 py-3">Eclosão prev.</th>
                  <th className="px-4 py-3">Taxa</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => {
                  const hatch = hatchDate(b.entryDate);
                  const left = daysUntil(hatch);
                  const rate = hatchRate(b.quantity, b.hatched);
                  return (
                    <tr key={b.id} className="border-t border-slate-100">
                      <td className="px-4 py-3">{formatDate(b.entryDate)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{b.breed}</p>
                        <p className="text-xs text-slate-400">
                          {incubators.find((i) => i.id === b.incubatorId)?.name}
                        </p>
                      </td>
                      <td className="px-4 py-3">{b.quantity}</td>
                      <td className="px-4 py-3">
                        {formatDate(hatch)}
                        {b.status === "incubando" && (
                          <span className="block text-xs text-slate-400">
                            {left >= 0 ? `${left} dias` : `${Math.abs(left)} dias atraso`}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {b.status === "incubando" ? "—" : `${rate}% (${b.hatched})`}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={b.status === "incubando" ? "sky" : b.status === "eclodido" ? "emerald" : "slate"}>
                          {b.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditBatch(b);
                            setBatchOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button variant="ghost" className="text-rose-600" onClick={() => deleteBatch(b.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {batches.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                      Nenhum lote cadastrado. A data prevista de eclosão é calculada em 21 dias.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <IncubatorModal
        open={incOpen}
        initial={editInc}
        onClose={() => setIncOpen(false)}
        onSave={(data) => {
          saveIncubator(data);
          setIncOpen(false);
        }}
      />
      <BatchModal
        open={batchOpen}
        initial={editBatch}
        incubators={incubators}
        onClose={() => setBatchOpen(false)}
        onSave={(data) => {
          saveBatch(data);
          setBatchOpen(false);
        }}
      />
    </div>
  );
}

function IncubatorModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Incubator | null;
  onClose: () => void;
  onSave: (i: Omit<Incubator, "id" | "propertyId"> & { id?: string }) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<IncubatorType>("mecanica");
  const [capacity, setCapacity] = useState(48);
  const [notes, setNotes] = useState("");
  const key = `${open}-${initial?.id ?? "new"}`;
  const [seen, setSeen] = useState("");
  if (open && seen !== key) {
    setSeen(key);
    setName(initial?.name ?? "");
    setType(initial?.type ?? "mecanica");
    setCapacity(initial?.capacity ?? 48);
    setNotes(initial?.notes ?? "");
  }

  return (
    <Modal open={open} title={initial ? "Editar chocadeira" : "Nova chocadeira"} onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSave({ id: initial?.id, name, type, capacity: Number(capacity), notes });
        }}
      >
        <Field label="Nome">
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Tipo">
          <Select value={type} onChange={(e) => setType(e.target.value as IncubatorType)}>
            <option value="mecanica">Mecânica</option>
            <option value="natural">Natural</option>
          </Select>
        </Field>
        <Field label="Capacidade (ovos)">
          <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
        </Field>
        <Field label="Notas">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
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

function BatchModal({
  open,
  initial,
  incubators,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: EggBatch | null;
  incubators: Incubator[];
  onClose: () => void;
  onSave: (b: Omit<EggBatch, "id" | "propertyId"> & { id?: string }) => void;
}) {
  const [incubatorId, setIncubatorId] = useState("");
  const [entryDate, setEntryDate] = useState(todayISO());
  const [breed, setBreed] = useState(BREEDS[0]);
  const [quantity, setQuantity] = useState(12);
  const [hatched, setHatched] = useState(0);
  const [discarded, setDiscarded] = useState(0);
  const [status, setStatus] = useState<BatchStatus>("incubando");
  const [notes, setNotes] = useState("");
  const key = `${open}-${initial?.id ?? "new"}`;
  const [seen, setSeen] = useState("");
  if (open && seen !== key) {
    setSeen(key);
    setIncubatorId(initial?.incubatorId ?? incubators[0]?.id ?? "");
    setEntryDate(initial?.entryDate ?? todayISO());
    setBreed(initial?.breed ?? BREEDS[0]);
    setQuantity(initial?.quantity ?? 12);
    setHatched(initial?.hatched ?? 0);
    setDiscarded(initial?.discarded ?? 0);
    setStatus(initial?.status ?? "incubando");
    setNotes(initial?.notes ?? "");
  }

  const prev = hatchDate(entryDate);

  return (
    <Modal open={open} title={initial ? "Editar lote" : "Novo lote de ovos"} onClose={onClose} wide>
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSave({
            id: initial?.id,
            incubatorId,
            entryDate,
            breed,
            quantity: Number(quantity),
            hatched: Number(hatched),
            discarded: Number(discarded),
            status,
            notes,
          });
        }}
      >
        <Field label="Chocadeira">
          <Select value={incubatorId} onChange={(e) => setIncubatorId(e.target.value)} required>
            {incubators.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Data de entrada">
          <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required />
        </Field>
        <Field label="Raça">
          <Select value={breed} onChange={(e) => setBreed(e.target.value)}>
            {BREEDS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </Select>
        </Field>
        <Field label="Quantidade de ovos">
          <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        </Field>
        <div className="sm:col-span-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-900">
          Eclosão prevista (21 dias): <strong>{formatDate(prev)}</strong>
        </div>
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value as BatchStatus)}>
            <option value="incubando">Incubando</option>
            <option value="eclodido">Eclodido</option>
            <option value="encerrado">Encerrado</option>
          </Select>
        </Field>
        <Field label="Pintos eclodidos">
          <Input type="number" min={0} value={hatched} onChange={(e) => setHatched(Number(e.target.value))} />
        </Field>
        <Field label="Ovos descartados">
          <Input type="number" min={0} value={discarded} onChange={(e) => setDiscarded(Number(e.target.value))} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Notas">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar lote</Button>
        </div>
      </form>
    </Modal>
  );
}
