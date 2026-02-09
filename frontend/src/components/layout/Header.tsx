import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
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
      </Toolbar>
    </AppBar>
  );
};

export default Header;
