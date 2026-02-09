import { Container } from '@mui/material';
import BarberDetails from '../components/barbers/BarberDetails';

const EditBarberPage: React.FC = () => {
  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{
        mt: { xs: 2, sm: 4 },
        mb: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <BarberDetails />
    </Container>
  );
};

export default EditBarberPage;
