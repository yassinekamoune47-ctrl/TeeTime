import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import type { Role } from '@/types/user.types';

function RoleGuard({ allowedRoles }: { allowedRoles: Role[] }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export function ManagerGuard() {
  return <RoleGuard allowedRoles={['MANAGER']} />;
}

export function AdminGuard() {
  return <RoleGuard allowedRoles={['ADMIN']} />;
}

export function ApexAdminGuard() {
  return <RoleGuard allowedRoles={['ADMIN_APEX']} />;
}