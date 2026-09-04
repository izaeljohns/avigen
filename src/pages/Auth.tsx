import { FormEvent, useState, type ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Egg } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../lib/seed";

export function LoginPage() {
  const { user, login, loadDemo } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = login(email, password);
    if (err) setError(err);
    else nav("/");
  };

  return (
    <AuthFrame>
      <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>
      <p className="mt-1 text-sm text-slate-500">Gestão multitenant de avicultura e genética.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="E-mail">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Senha">
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Button className="w-full" type="submit">
          Acessar painel
        </Button>
      </form>
      <Button
        type="button"
        variant="secondary"
        className="mt-3 w-full"
        onClick={() => {
          loadDemo();
          nav("/");
        }}
      >
        Abrir unidade demonstrativa
      </Button>
      <p className="mt-4 text-center text-sm text-slate-500">
        Demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
      </p>
      <p className="mt-6 text-center text-sm">
        Novo por aqui?{" "}
        <Link to="/cadastro" className="font-semibold text-brand-700">
          Criar conta
        </Link>
      </p>
    </AuthFrame>
  );
}

export function RegisterPage() {
  const { user, register } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = register(name, email, password);
    if (err) setError(err);
    else nav("/propriedades");
  };

  return (
    <AuthFrame>
      <h1 className="text-2xl font-bold">Criar conta</h1>
      <p className="mt-1 text-sm text-slate-500">Comece com a sua primeira unidade de criação.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Nome">
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="E-mail">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Senha">
          <Input
            type="password"
            required
            minLength={4}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Button className="w-full" type="submit">
          Cadastrar
        </Button>
      </form>
      <p className="mt-6 text-center text-sm">
        Já tem conta?{" "}
        <Link to="/login" className="font-semibold text-brand-700">
          Entrar
        </Link>
      </p>
    </AuthFrame>
  );
}

function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-3 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-slate-900">
            <Egg />
          </div>
          <span className="text-xl font-bold">AviGen</span>
        </div>
        <div className="relative z-10 max-w-md text-white">
          <p className="text-3xl font-semibold leading-tight">
            Incubação, anilhas e genética em um só lugar.
          </p>
          <p className="mt-4 text-slate-300">
            Controle lotes de ovos, fichas individuais, calendário sanitário e o caixa de cada
            propriedade — no computador ou no celular.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-brand-600/40 blur-3xl" />
        <p className="text-sm text-slate-500">Dados salvos localmente neste navegador.</p>
      </div>
      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
