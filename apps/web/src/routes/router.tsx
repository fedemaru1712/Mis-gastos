import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { PrivateLayout } from "@/components/layout/private-layout";
import { useAuth } from "@/hooks/use-auth";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { LoginPage } from "@/features/auth/login-page";
import { SettingsPage } from "@/features/auth/settings-page";
import { InvestmentsPage } from "@/features/investments/investments-page";
import { TransactionsPage } from "@/features/transactions/transactions-page";

function ProtectedRoutes() {
  const { isLoading, user } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Cargando...</div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <PrivateLayout>
      <Outlet />
    </PrivateLayout>
  );
}

export function AppRouter() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/investments" element={<InvestmentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
