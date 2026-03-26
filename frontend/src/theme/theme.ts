import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#b8860b', // Darker gold
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1a1a1a', // Rich black
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5', // Light gray
      paper: '#ffffff', // White
    },
    text: {
      primary: '#1a1a1a', // Dark
      secondary: '#666666', // Medium gray
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});
