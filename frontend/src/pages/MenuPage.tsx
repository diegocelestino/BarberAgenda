import { Container, Grid, Card, CardContent, CardActionArea, Typography, Box } from '@mui/material';
import { People as PeopleIcon, Build as BuildIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const MenuPage: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Barbers',
      description: 'Manage barbers and their schedules',
      icon: <PeopleIcon sx={{ fontSize: 80 }} />,
      path: '/admin/barbers',
      color: '#90caf9',
    },
    {
      title: 'Services',
      description: 'Manage services and durations',
      icon: <BuildIcon sx={{ fontSize: 80 }} />,
      path: '/admin/services',
      color: '#f48fb1',
    },
  ];

  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{
        mt: { xs: 4, sm: 8 },
        mb: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        align="center"
        gutterBottom
        sx={{ mb: 6, fontWeight: 'bold' }}
      >
        Welcome
      </Typography>

      <Grid container spacing={4}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} key={item.path}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(item.path)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 6,
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: item.color, mb: 2 }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h4" component="h2" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MenuPage;
