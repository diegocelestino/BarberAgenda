import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicHomePage from './pages/PublicHomePage';
import LoginPage from './pages/LoginPage';
import MenuPage from './pages/MenuPage';
import BarbersPage from './pages/BarbersPage';
import ServicesPage from './pages/ServicesPage';
import EditBarberPage from './pages/EditBarberPage';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
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

              {/* Redirect old routes to admin */}
              <Route path="/barbers" element={<Navigate to="/admin/barbers" replace />} />
              <Route path="/services" element={<Navigate to="/admin/services" replace />} />
              <Route path="/barber/:barberId" element={<Navigate to="/admin/barber/:barberId" replace />} />
            </Routes>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
