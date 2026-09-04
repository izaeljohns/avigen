import  supabase  from "./supabase";
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

export async function loadDb(): Promise<Database> {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('content')
      .eq('id', 'default_user')
      .single();

    if (error || !data) return structuredClone(empty);
    return { ...empty, ...data.content };
  } catch {
    return structuredClone(empty);
  }
}

export async function saveDb(db: Database): Promise<void> {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  await supabase
    .from('user_data')
    .upsert({ id: 'default_user', content: db });
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
