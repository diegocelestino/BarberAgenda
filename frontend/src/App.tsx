import { lazy, Suspense } from 'react';
import { ConfigProvider, Spin } from 'antd';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { antdTheme } from './theme/theme';
import Header from './components/layout/Header';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

const PublicHomePage = lazy(() => import('./pages/PublicHomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./modules/admin/pages/DashboardPage'));
const AgendaPage = lazy(() => import('./modules/admin/pages/AgendaPage'));
const CustomersPage = lazy(() => import('./modules/admin/pages/CustomersPage'));
const CustomerDetailPage = lazy(() => import('./modules/admin/pages/CustomerDetailPage'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider theme={antdTheme}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes with Header */}
                <Route path="/" element={<><Header /><PublicHomePage /></>} />
                <Route path="/login" element={<><Header /><LoginPage /></>} />

                {/* Admin routes — full-page layout, no old Header */}
                <Route path="/admin" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/admin/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
                <Route path="/admin/clientes" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
                <Route path="/admin/clientes/:id" element={<ProtectedRoute><CustomerDetailPage /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
