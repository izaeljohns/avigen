import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Camera, Plus, Search, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Field, Input, Select, Textarea } from "../components/ui/Field";
import { BIRD_STATUS, BREEDS, RING_COLORS, STATUS_TONE } from "../lib/labels";
import { formatDate, todayISO } from "../lib/utils";
import type { Bird, BirdStatus, RingType } from "../types";

export function FlockPage() {
  const { birds } = useApp();
  const [q, setQ] = useState("");
  const [breed, setBreed] = useState("");
  const [status, setStatus] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return birds.filter((b) => {
      if (term && !b.ringCode.toLowerCase().includes(term) && !b.breed.toLowerCase().includes(term)) {
        return false;
      }
      if (breed && b.breed !== breed) return false;
      if (status && b.status !== status) return false;
      return true;
    });
  }, [birds, q, breed, status]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Fichas individuais com anilha, genética e status do plantel.</p>
        <Link to="/plantel/novo">
          <Button>
            <Plus size={16} /> Nova ave
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <Input
              className="pl-9"
              placeholder="Buscar por anilha ou raça"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={breed} onChange={(e) => setBreed(e.target.value)}>
            <option value="">Todas as raças</option>
            {[...new Set(birds.map((b) => b.breed))].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos os status</option>
            {Object.entries(BIRD_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((b) => (
          <Link key={b.id} to={`/plantel/${b.id}`}>
            <Card className="h-full overflow-hidden transition hover:border-brand-200 hover:shadow-md">
              <div className="flex gap-4 p-4">
                <Photo src={b.photo} alt={b.ringCode} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{b.ringCode}</p>
                    <Badge tone={STATUS_TONE[b.status]}>{BIRD_STATUS[b.status]}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{b.breed}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Lacre {b.ringColor} · {b.ringType} · {sexLabel(b.sex)}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <Card className="p-10 text-center text-slate-500">Nenhuma ave encontrada com esses filtros.</Card>
      )}
    </div>
  );
}

export function BirdFormPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { birds, batches, saveBird, deleteBird } = useApp();
  const existing = birds.find((b) => b.id === id);
  const isNew = id === undefined || id === "novo";

  const [ringCode, setRingCode] = useState(existing?.ringCode ?? "");
  const [ringColor, setRingColor] = useState(existing?.ringColor ?? "Verde");
  const [ringType, setRingType] = useState<RingType>(existing?.ringType ?? "oficial");
  const [breed, setBreed] = useState(existing?.breed ?? BREEDS[0]);
  const [sex, setSex] = useState<Bird["sex"]>(existing?.sex ?? "F");
  const [status, setStatus] = useState<BirdStatus>(existing?.status ?? "crescimento");
  const [photo, setPhoto] = useState(existing?.photo ?? "");
  const [birthDate, setBirthDate] = useState(existing?.birthDate ?? todayISO());
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [batchId, setBatchId] = useState(existing?.batchId ?? "");

  if (!isNew && !existing) {
    return <p className="text-slate-500">Ave não encontrada.</p>;
  }

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const savedId = saveBird({
      id: isNew ? undefined : existing?.id,
      ringCode,
      ringColor,
      ringType,
      breed,
      sex,
      status,
      photo,
      birthDate,
      notes,
      batchId: batchId || undefined,
    });
    nav(`/plantel/${savedId}`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={submit} className="space-y-5">
        <Card className="p-5">
          <h2 className="text-lg font-semibold">{isNew ? "Nova ficha" : `Ficha ${existing?.ringCode}`}</h2>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <div>
              <Photo src={photo} alt="foto" large />
              <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <Camera size={16} /> Foto
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              </label>
            </div>
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="URL da foto (opcional)">
                  <Input
                    placeholder="https://..."
                    value={photo.startsWith("data:") ? "" : photo}
                    onChange={(e) => setPhoto(e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Anilha / lacre">
                <Input required value={ringCode} onChange={(e) => setRingCode(e.target.value)} placeholder="AG-0001" />
              </Field>
              <Field label="Cor do lacre">
                <Select value={ringColor} onChange={(e) => setRingColor(e.target.value)}>
                  {RING_COLORS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Tipo de anilha">
                <Select value={ringType} onChange={(e) => setRingType(e.target.value as RingType)}>
                  <option value="oficial">Oficial</option>
                  <option value="identificacao">Identificação</option>
                  <option value="lacre">Lacre</option>
                </Select>
              </Field>
              <Field label="Raça">
                <Select value={breed} onChange={(e) => setBreed(e.target.value)}>
                  {BREEDS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Sexo">
                <Select value={sex} onChange={(e) => setSex(e.target.value as Bird["sex"])}>
                  <option value="F">Fêmea</option>
                  <option value="M">Macho</option>
                  <option value="I">Indefinido</option>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={status} onChange={(e) => setStatus(e.target.value as BirdStatus)}>
                  {Object.entries(BIRD_STATUS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Nascimento">
                <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </Field>
              <Field label="Lote de eclosão">
                <Select value={batchId} onChange={(e) => setBatchId(e.target.value)}>
                  <option value="">Não vinculado</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.breed} · {formatDate(b.entryDate)}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Anotações / pedigree">
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                </Field>
              </div>
            </div>
          </div>
        </Card>
        <div className="flex flex-wrap justify-between gap-2">
          {!isNew && (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                if (existing && confirm("Excluir esta ficha?")) {
                  deleteBird(existing.id);
                  nav("/plantel");
                }
              }}
            >
              <Trash2 size={16} /> Excluir
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="secondary" onClick={() => nav("/plantel")}>
              Cancelar
            </Button>
            <Button type="submit">Salvar ficha</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Photo({ src, alt, large }: { src: string; alt: string; large?: boolean }) {
  const size = large ? "h-36 w-36" : "h-16 w-16";
  if (src) {
    return <img src={src} alt={alt} className={`${size} rounded-xl object-cover bg-slate-100`} />;
  }
  return (
    <div className={`${size} flex items-center justify-center rounded-xl bg-brand-50 text-brand-800`}>
      <Camera size={large ? 28 : 18} />
    </div>
  );
}

function sexLabel(s: Bird["sex"]) {
  return s === "F" ? "Fêmea" : s === "M" ? "Macho" : "Indefinido";
}
