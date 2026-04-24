import { lazy, Suspense } from 'react';
import { CssBaseline, ThemeProvider, Box, CircularProgress } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { theme } from './theme/theme';
import Header from './components/layout/Header';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load route components for code splitting
const PublicHomePage = lazy(() => import('./pages/PublicHomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const BarbersPage = lazy(() => import('./pages/BarbersPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const EditBarberPage = lazy(() => import('./pages/EditBarberPage'));
const EditBarberDetailsPage = lazy(() => import('./pages/EditBarberDetailsPage'));
const BarberSchedulePage = lazy(() => import('./pages/BarberSchedulePage'));
const BarberAppointmentsPage = lazy(() => import('./pages/BarberAppointmentsPage'));
const BarberExtractPage = lazy(() => import('./pages/BarberExtractPage'));

// Loading fallback component
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
    }}
  >
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<PublicHomePage />} />
                  <Route path="/login" element={<LoginPage />} />

                  {/* Protected Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <MenuPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/barbers"
                    element={
                      <ProtectedRoute>
                        <BarbersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/services"
                    element={
                      <ProtectedRoute>
                        <ServicesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/barber/:barberId"
                    element={
                      <ProtectedRoute>
                        <EditBarberPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/barbers/:barberId/edit"
                    element={
                      <ProtectedRoute>
                        <EditBarberDetailsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/barbers/:barberId/schedule"
                    element={
                      <ProtectedRoute>
                        <BarberSchedulePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/barbers/:barberId/appointments"
                    element={
                      <ProtectedRoute>
                        <BarberAppointmentsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/barbers/:barberId/extract"
                    element={
                      <ProtectedRoute>
                        <BarberExtractPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Redirect old routes to admin */}
                  <Route path="/barbers" element={<Navigate to="/admin/barbers" replace />} />
                  <Route path="/services" element={<Navigate to="/admin/services" replace />} />
                  <Route path="/barber/:barberId" element={<Navigate to="/admin/barber/:barberId" replace />} />
                </Routes>
              </Suspense>
            </Box>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
