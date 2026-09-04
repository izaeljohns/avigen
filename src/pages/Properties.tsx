import { FormEvent, useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field, Input, Select, Textarea } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import type { Property } from "../types";
import { formatDate } from "../lib/utils";

const TYPES: Record<Property["productionType"], string> = {
  postura: "Postura",
  corte: "Corte",
  reproducao: "Reprodução / genética",
  misto: "Misto",
};

export function PropertiesPage() {
  const { properties, property, saveProperty, deleteProperty, selectProperty } = useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Cada unidade isola plantel, incubação e financeiro. Ideal para múltiplas granjas.
        </p>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus size={16} /> Nova unidade
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {properties.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900">{p.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin size={14} /> {p.location || "Sem local"}
                </p>
              </div>
              {property?.id === p.id && <Badge tone="teal">Ativa</Badge>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{TYPES[p.productionType]}</Badge>
              <span className="text-xs text-slate-400">desde {formatDate(p.createdAt.slice(0, 10))}</span>
            </div>
            {p.notes && <p className="mt-3 text-sm text-slate-600">{p.notes}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => selectProperty(p.id)}>
                Usar esta unidade
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditing(p);
                  setOpen(true);
                }}
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                className="text-rose-600"
                onClick={() => {
                  if (confirm("Excluir esta unidade e todos os dados vinculados?")) deleteProperty(p.id);
                }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}
        {properties.length === 0 && (
          <Card className="col-span-full p-10 text-center text-slate-500">
            Nenhuma propriedade ainda. Cadastre a primeira unidade de criação.
          </Card>
        )}
      </div>

      <PropertyModal
        open={open}
        initial={editing}
        onClose={() => setOpen(false)}
        onSave={(data) => {
          saveProperty(data);
          setOpen(false);
        }}
      />
    </div>
  );
}

function PropertyModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Property | null;
  onClose: () => void;
  onSave: (p: Omit<Property, "id" | "userId" | "createdAt"> & { id?: string }) => void;
}) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [productionType, setProductionType] = useState<Property["productionType"]>("misto");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setName(initial?.name ?? "");
    setLocation(initial?.location ?? "");
    setProductionType(initial?.productionType ?? "misto");
    setNotes(initial?.notes ?? "");
  };

  return (
    <Modal
      open={open}
      title={initial ? "Editar unidade" : "Nova unidade"}
      onClose={onClose}
    >
      <form
        className="space-y-3"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSave({ id: initial?.id, name, location, productionType, notes });
        }}
        onChange={() => undefined}
      >
        <Sync initial={initial} onSync={reset} open={open} />
        <Field label="Nome da propriedade">
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Localização">
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Cidade, UF" />
        </Field>
        <Field label="Tipo de produção">
          <Select
            value={productionType}
            onChange={(e) => setProductionType(e.target.value as Property["productionType"])}
          >
            {Object.entries(TYPES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Observações">
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

function Sync({
  initial,
  open,
  onSync,
}: {
  initial: Property | null;
  open: boolean;
  onSync: () => void;
}) {
  const key = `${open}-${initial?.id ?? "new"}`;
  const [seen, setSeen] = useState("");
  if (seen !== key) {
    setSeen(key);
    onSync();
  }
  return null;
}
