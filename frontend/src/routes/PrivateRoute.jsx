import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const AuthGateLoading = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <span className="text-text-muted text-sm">{message}</span>
    </div>
  </div>
);

/**
 * Private route wrapper - redirects to login if not authenticated
 */
const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, hasHydrated } = useAuthStore();

  if (!hasHydrated || isLoading) {
    return <AuthGateLoading message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
