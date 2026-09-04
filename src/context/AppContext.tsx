import { 
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type {
  Bird,
  Database,
  EggBatch,
  HealthEvent,
  Incubator,
  Property,
  Session,
  Transaction,
  User,
} from "../types";
import { loadDb, loadSession, saveDb, saveSession } from "../lib/storage";
import { buildDemoDb } from "../lib/seed";
import { uid } from "../lib/utils";

type Ctx = {
  db: Database;
  session: Session | null;
  user: User | null;
  property: Property | null;
  properties: Property[];
  incubators: Incubator[];
  batches: EggBatch[];
  birds: Bird[];
  health: HealthEvent[];
  transactions: Transaction[];
  login: (email: string, password: string) => string | null;
  register: (name: string, email: string, password: string) => string | null;
  logout: () => void;
  loadDemo: () => void;
  selectProperty: (id: string | null) => void;
  saveProperty: (p: Omit<Property, "id" | "userId" | "createdAt"> & { id?: string }) => void;
  deleteProperty: (id: string) => void;
  saveIncubator: (i: Omit<Incubator, "id" | "propertyId"> & { id?: string }) => void;
  deleteIncubator: (id: string) => void;
  saveBatch: (b: Omit<EggBatch, "id" | "propertyId"> & { id?: string }) => void;
  deleteBatch: (id: string) => void;
  saveBird: (b: Omit<Bird, "id" | "propertyId"> & { id?: string }) => string;
  deleteBird: (id: string) => void;
  saveHealth: (h: Omit<HealthEvent, "id" | "propertyId"> & { id?: string }) => void;
  deleteHealth: (id: string) => void;
  toggleHealth: (id: string) => void;
  saveTx: (t: Omit<Transaction, "id" | "propertyId"> & { id?: string }) => void;
  deleteTx: (id: string) => void;
};

const AppContext = createContext<Ctx | null>(null);

function persist(db: Database, session: Session | null) {
  saveDb(db);
  saveSession(session);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database>(() => ({
    users: [],
    properties: [],
    incubators: [],
    batches: [],
    birds: [],
    health: [],
    transactions: []
  }));
  const [session, setSession] = useState<Session | null>(() => loadSession());

  useEffect(() => {
    async function initDb() {
      const data = await loadDb();
      setDb(data);
    }
    initDb();
  }, []);

  const commit = useCallback((nextDb: Database, nextSession: Session | null) => {
    setDb(nextDb);
    setSession(nextSession);
    persist(nextDb, nextSession);
  }, []);

  const user = db.users.find((u) => u.id === session?.userId) ?? null;
  const properties = db.properties.filter((p) => p.userId === user?.id);
  const property =
    properties.find((p) => p.id === session?.propertyId) ?? properties[0] ?? null;

  const pid = property?.id;
  const incubators = db.incubators.filter((i) => i.propertyId === pid);
  const batches = db.batches.filter((b) => b.propertyId === pid);
  const birds = db.birds.filter((b) => b.propertyId === pid);
  const health = db.health.filter((h) => h.propertyId === pid);
  const transactions = db.transactions.filter((t) => t.propertyId === pid);

  const login = (email: string, password: string) => {
    const found = db.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    );
    if (!found) return "E-mail ou senha inválidos.";
    const props = db.properties.filter((p) => p.userId === found.id);
    commit(db, { userId: found.id, propertyId: props[0]?.id ?? null });
    return null;
  };

  const register = (name: string, email: string, password: string) => {
    if (db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return "Já existe uma conta com este e-mail.";
    }
    const u: User = {
      id: uid(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
    };
    commit({ ...db, users: [...db.users, u] }, { userId: u.id, propertyId: null });
    return null;
  };

  const logout = () => commit(db, null);

  const loadDemo = () => {
    const demo = buildDemoDb();
    commit(demo, { userId: demo.users[0].id, propertyId: demo.properties[0].id });
  };

  const selectProperty = (id: string | null) => {
    if (!session) return;
    commit(db, { ...session, propertyId: id });
  };

  const requirePid = () => {
    if (!pid) throw new Error("Selecione uma propriedade.");
    return pid;
  };

  const saveProperty: Ctx["saveProperty"] = (p) => {
    if (!user) return;
    if (p.id) {
      const next = {
        ...db,
        properties: db.properties.map((x) => (x.id === p.id ? { ...x, ...p } : x)),
      };
      commit(next, session);
    } else {
      const created: Property = {
        id: uid(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        name: p.name,
        location: p.location,
        productionType: p.productionType,
        notes: p.notes,
      };
      commit(
        { ...db, properties: [...db.properties, created] },
        session ? { ...session, propertyId: created.id } : session,
      );
    }
  };

  const deleteProperty = (id: string) => {
    const next: Database = {
      ...db,
      properties: db.properties.filter((p) => p.id !== id),
      incubators: db.incubators.filter((i) => i.propertyId !== id),
      batches: db.batches.filter((b) => b.propertyId !== id),
      birds: db.birds.filter((b) => b.propertyId !== id),
      health: db.health.filter((h) => h.propertyId !== id),
      transactions: db.transactions.filter((t) => t.propertyId !== id),
    };
    const nextPid = session?.propertyId === id ? next.properties.find((p) => p.userId === user?.id)?.id ?? null : session?.propertyId ?? null;
    commit(next, session ? { ...session, propertyId: nextPid } : session);
  };

  const saveIncubator: Ctx["saveIncubator"] = (i) => {
    const propertyId = requirePid();
    if (i.id) {
      commit(
        { ...db, incubators: db.incubators.map((x) => (x.id === i.id ? { ...x, ...i, propertyId } : x)) },
        session,
      );
    } else {
      commit(
        { ...db, incubators: [...db.incubators, { ...i, id: uid(), propertyId }] },
        session,
      );
    }
  };

  const deleteIncubator = (id: string) => {
    commit(
      {
        ...db,
        incubators: db.incubators.filter((i) => i.id !== id),
        batches: db.batches.filter((b) => b.incubatorId !== id),
      },
      session,
    );
  };

  const saveBatch: Ctx["saveBatch"] = (b) => {
    const propertyId = requirePid();
    if (b.id) {
      commit(
        { ...db, batches: db.batches.map((x) => (x.id === b.id ? { ...x, ...b, propertyId } : x)) },
        session,
      );
    } else {
      commit({ ...db, batches: [...db.batches, { ...b, id: uid(), propertyId }] }, session);
    }
  };

  const deleteBatch = (id: string) => {
    commit({ ...db, batches: db.batches.filter((b) => b.id !== id) }, session);
  };

  const saveBird: Ctx["saveBird"] = (b) => {
    const propertyId = requirePid();
    if (b.id) {
      commit(
        { ...db, birds: db.birds.map((x) => (x.id === b.id ? { ...x, ...b, propertyId } : x)) },
        session,
      );
      return b.id;
    }
    const id = uid();
    commit({ ...db, birds: [...db.birds, { ...b, id, propertyId }] }, session);
    return id;
  };

  const deleteBird = (id: string) => {
    commit({ ...db, birds: db.birds.filter((b) => b.id !== id) }, session);
  };

  const saveHealth: Ctx["saveHealth"] = (h) => {
    const propertyId = requirePid();
    if (h.id) {
      commit(
        { ...db, health: db.health.map((x) => (x.id === h.id ? { ...x, ...h, propertyId } : x)) },
        session,
      );
    } else {
      commit({ ...db, health: [...db.health, { ...h, id: uid(), propertyId }] }, session);
    }
  };

  const deleteHealth = (id: string) => {
    commit({ ...db, health: db.health.filter((h) => h.id !== id) }, session);
  };

  const toggleHealth = (id: string) => {
    commit(
      {
        ...db,
        health: db.health.map((h) =>
          h.id === id ? { ...h, status: h.status === "concluida" ? "pendente" : "concluida" } : h,
        ),
      },
      session,
    );
  };

  const saveTx: Ctx["saveTx"] = (t) => {
    const propertyId = requirePid();
    if (t.id) {
      commit(
        {
          ...db,
          transactions: db.transactions.map((x) => (x.id === t.id ? { ...x, ...t, propertyId } : x)),
        },
        session,
      );
    } else {
      commit(
        { ...db, transactions: [...db.transactions, { ...t, id: uid(), propertyId }] },
        session,
      );
    }
  };

  const deleteTx = (id: string) => {
    commit({ ...db, transactions: db.transactions.filter((t) => t.id !== id) }, session);
  };

  const value = useMemo(
    () => ({
      db,
      session,
      user,
      property,
      properties,
      incubators,
      batches,
      birds,
      health,
      transactions,
      login,
      register,
      logout,
      loadDemo,
      selectProperty,
      saveProperty,
      deleteProperty,
      saveIncubator,
      deleteIncubator,
      saveBatch,
      deleteBatch,
      saveBird,
      deleteBird,
      saveHealth,
      deleteHealth,
      toggleHealth,
      saveTx,
      deleteTx,
    }),
    [db, session, user, property, properties, incubators, batches, birds, health, transactions],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp fora do AppProvider");
  return ctx;
}
