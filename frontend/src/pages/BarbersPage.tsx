import { Container } from '@mui/material';
import CreateBarber from '../components/barbers/CreateBarber';
import BarberList from '../components/barbers/BarberList';

const BarbersPage: React.FC = () => {
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
      <CreateBarber />
      <BarberList />
    </Container>
  );
};

export default BarbersPage;
