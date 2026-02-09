import { Container } from '@mui/material';
import ServicesList from '../components/services/ServicesList';

const ServicesPage: React.FC = () => {
  return (
    <Container
      component="main"
      maxWidth="lg"
      sx={{
        mt: { xs: 2, sm: 4 },
        mb: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <ServicesList />
    </Container>
  );
};

export default ServicesPage;
