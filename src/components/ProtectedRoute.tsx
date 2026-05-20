import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center">
    <div className="text-primary">Loading...</div>
  </div>;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/login?redirect=/admin" replace />;
  return <>{children}</>;
}

export function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}