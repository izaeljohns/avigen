import { Navigate, Route, Routes } from "react-router-dom";
import { useApp } from "./context/AppContext";
import { AppShell } from "./components/Layout";
import { LoginPage, RegisterPage } from "./pages/Auth";
import { DashboardPage } from "./pages/Dashboard";
import { PropertiesPage } from "./pages/Properties";
import { IncubationPage } from "./pages/Incubation";
import { BirdFormPage, FlockPage } from "./pages/Flock";
import { HealthPage } from "./pages/Health";
import { FinancePage } from "./pages/Finance";
import type { ReactNode } from "react";

function Guard({ children }: { children: ReactNode }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route
        element={
          <Guard>
            <AppShell />
          </Guard>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/propriedades" element={<PropertiesPage />} />
        <Route path="/incubacao" element={<IncubationPage />} />
        <Route path="/plantel" element={<FlockPage />} />
        <Route path="/plantel/novo" element={<BirdFormPage />} />
        <Route path="/plantel/:id" element={<BirdFormPage />} />
        <Route path="/manejo" element={<HealthPage />} />
        <Route path="/financeiro" element={<FinancePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
