import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
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
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route path="/barbers" element={<BarbersPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/barber/:barberId" element={<EditBarberPage />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
