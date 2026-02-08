import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Lazy load pages
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('../features/home/pages/HomePage'));
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const NotFoundPage = lazy(() => import('../features/common/pages/NotFoundPage'));
// Loading component
const Loading = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-text-muted text-sm">Loading...</span>
        </div>
    </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        
        {/* Protected routes */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        
        {/* 404 */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
