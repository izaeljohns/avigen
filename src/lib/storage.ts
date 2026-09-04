import type { Database, Session } from "../types";

const DB_KEY = "avigen-db-v1";
const SESSION_KEY = "avigen-session-v1";

const empty: Database = {
  users: [],
  properties: [],
  incubators: [],
  batches: [],
  birds: [],
  health: [],
  transactions: [],
};

export function loadDb(): Database {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return structuredClone(empty);
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return structuredClone(empty);
  }
}

export function saveDb(db: Database) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session | null) {
  if (!session) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
