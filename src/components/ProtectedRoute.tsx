import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'admin' | 'collaborator')[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ['user', 'admin', 'collaborator'],
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, isAdmin, isCollaborator, isOnlyCollaborator, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Collaborator-only users can only access collaborator routes
  if (isOnlyCollaborator) {
    // Check if trying to access non-collaborator routes
    if (!allowedRoles.includes('collaborator') || 
        (allowedRoles.includes('user') && !allowedRoles.includes('collaborator')) ||
        (allowedRoles.includes('admin'))) {
      return <Navigate to="/colaborador" replace />;
    }
  }

  // Admin routes - only admins can access
  if (allowedRoles.length === 1 && allowedRoles[0] === 'admin' && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Special route wrapper for collaborator-only users
export function CollaboratorRestrictedRoute({ children }: { children: React.ReactNode }) {
  const { user, isOnlyCollaborator, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Collaborator-only users cannot access regular user routes
  if (isOnlyCollaborator) {
    return <Navigate to="/colaborador" replace />;
  }

  return <>{children}</>;
}
