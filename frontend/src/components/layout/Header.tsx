import { AppBar, Toolbar, Typography, IconButton, Button, Chip, Box } from '@mui/material';
import { Home as HomeIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/auth';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <IconButton
          color="inherit"
          onClick={() => navigate('/', { state: { reset: Date.now() } })}
          edge="start"
          sx={{ mr: 2 }}
        >
          <HomeIcon />
        </IconButton>
        <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
          Miguel Castilho Agenda
        </Typography>
        {auth.isMockMode() && (
          <Chip 
            label="DEV" 
            size="small" 
            sx={{ 
              mr: 2,
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              fontWeight: 'bold',
            }}
          />
        )}
        {isAuthenticated && (
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Sair
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
