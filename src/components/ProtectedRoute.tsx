import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRedirects: Record<UserRole, string> = {
      student: '/student/dashboard',
      teacher: '/teacher/groups',
      manager: '/manager/orders',
      admin: '/admin/users',
    };
    return <Navigate to={roleRedirects[user.role]} replace />;
  }

  return <>{children}</>;
}
