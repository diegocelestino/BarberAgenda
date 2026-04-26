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
const AdminPage = lazy(() => import('./pages/AdminPage'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider theme={antdTheme}>
        <AuthProvider>
          <BrowserRouter>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
              <Header />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<PublicHomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />

                  {/* Redirect old routes */}
                  <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
                  <Route path="/barbers" element={<Navigate to="/admin" replace />} />
                  <Route path="/services" element={<Navigate to="/admin" replace />} />
                </Routes>
              </Suspense>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
