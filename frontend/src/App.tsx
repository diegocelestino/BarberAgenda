import { CssBaseline, ThemeProvider, createTheme, Container, Box } from '@mui/material';
import Header from './components/layout/Header';
import CreateBarber from './components/barbers/CreateBarber';
import BarberList from './components/barbers/BarberList';

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
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />

        <Container
          component="main"
          maxWidth="lg"
          sx={{
            mt: { xs: 2, sm: 4 },
            mb: { xs: 2, sm: 4 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <CreateBarber />
          <BarberList />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
