import { AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material';
import { Home as HomeIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
          onClick={() => navigate('/')}
          edge="start"
          sx={{ mr: 2 }}
        >
          <HomeIcon />
        </IconButton>
        <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
          Barber Shop Scheduler
        </Typography>
        {isAuthenticated && (
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
