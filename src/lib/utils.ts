export function uid() {
  return crypto.randomUUID();
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(isoDate: string, days: number) {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDate(iso?: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function formatMoney(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function hatchDate(entryDate: string) {
  return addDays(entryDate, 21);
}

export function daysUntil(iso: string) {
  const target = new Date(iso + "T12:00:00").getTime();
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.round((target - now.getTime()) / 86400000);
}

export function hatchRate(quantity: number, hatched: number) {
  if (!quantity) return 0;
  return Math.round((hatched / quantity) * 1000) / 10;
}
