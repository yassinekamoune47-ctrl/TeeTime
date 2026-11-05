import {useAuthStore} from "@/features/auth/store.ts";
import {useAuth} from "@/features/auth/hooks/useAuth.ts";
import {Navigate, Outlet} from "react-router-dom";

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isLoading } = useAuth(); // calling it will trigger the queryFn which calls the GET /auth/me, which zustand via loginStore()

  if (isLoading) {
    return null;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}