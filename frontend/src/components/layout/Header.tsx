import { AppBar, Toolbar, Typography } from '@mui/material';
import { ContentCut as ContentCutIcon } from '@mui/icons-material';

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <ContentCutIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
          Barber Shop Scheduler
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
