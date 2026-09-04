import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bird,
  CalendarDays,
  Egg,
  LayoutDashboard,
  LogOut,
  Menu,
  Wallet,
  Warehouse,
  X,
} from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { cn } from "../lib/cn";

const links = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/incubacao", label: "Incubação", icon: Egg },
  { to: "/plantel", label: "Plantel", icon: Bird },
  { to: "/manejo", label: "Manejo", icon: CalendarDays },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/propriedades", label: "Unidades", icon: Warehouse },
];

export function AppShell() {
  const { user, property, properties, selectProperty, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const title = links.find((l) =>
    l.to === "/" ? location.pathname === "/" : location.pathname.startsWith(l.to),
  )?.label ?? "AviGen";

  return (
    <div className="min-h-dvh bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-800/40 bg-slate-900 text-slate-200 lg:flex">
        <Brand />
        <Nav onNavigate={() => undefined} />
        <UserFooter
          name={user?.name ?? ""}
          onLogout={() => {
            logout();
            navigate("/login");
          }}
        />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-slate-900 text-slate-200">
            <div className="flex items-center justify-between px-4 py-4">
              <Brand compact />
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10">
                <X size={18} />
              </button>
            </div>
            <Nav onNavigate={() => setOpen(false)} />
            <UserFooter
              name={user?.name ?? ""}
              onLogout={() => {
                logout();
                navigate("/login");
              }}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
          <button
            className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="flex-1 text-base font-semibold text-slate-900 lg:text-lg">{title}</h1>
          {properties.length > 0 && (
            <select
              value={property?.id ?? ""}
              onChange={(e) => selectProperty(e.target.value || null)}
              className="max-w-[52vw] truncate rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm sm:max-w-xs"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </header>

        <main className="px-4 py-5 pb-24 lg:px-8 lg:pb-8">
          {!property && location.pathname !== "/propriedades" ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <Warehouse className="mx-auto text-brand-700" />
              <h2 className="mt-3 text-lg font-semibold">Cadastre uma unidade</h2>
              <p className="mt-1 text-sm text-slate-500">
                O AviGen organiza incubação, plantel e financeiro por propriedade.
              </p>
              <button
                className="mt-4 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white"
                onClick={() => navigate("/propriedades")}
              >
                Ir para unidades
              </button>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-slate-200 bg-white px-1 py-1 lg:hidden">
        {links.slice(0, 5).map((l) => {
          const Icon = l.icon;
          const active = l.to === "/" ? location.pathname === "/" : location.pathname.startsWith(l.to);
          return (
            <NavLink
              key={l.to}
              to={l.to}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-medium",
                active ? "text-brand-700" : "text-slate-500",
              )}
            >
              <Icon size={18} />
              {l.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 px-5", compact ? "" : "py-6")}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-slate-900">
        <Egg size={20} />
      </div>
      <div>
        <p className="text-base font-bold text-white">AviGen</p>
        <p className="text-[11px] text-slate-400">Precisão & genética</p>
      </div>
    </div>
  );
}

function Nav({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-3">
      {links.map((l) => {
        const Icon = l.icon;
        return (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white",
              )
            }
          >
            <Icon size={18} />
            {l.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function UserFooter({ name, onLogout }: { name: string; onLogout: () => void }) {
  return (
    <div className="border-t border-white/10 p-4">
      <p className="truncate text-sm font-medium text-white">{name}</p>
      <button
        onClick={onLogout}
        className="mt-2 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white"
      >
        <LogOut size={14} /> Sair
      </button>
    </div>
  );
}
