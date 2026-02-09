import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchBarberById,
  updateBarber,
  selectSelectedBarber,
  selectBarbersLoading,
  selectBarbersError,
  clearSelectedBarber,
} from '../../store/barbers';
import { clearAppointments } from '../../store/appointments';
import AppointmentCalendar from '../appointments/AppointmentCalendar';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const BarberDetails: React.FC = () => {
  const { barberId } = useParams<{ barberId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const barber = useAppSelector(selectSelectedBarber);
  const loading = useAppSelector(selectBarbersLoading);
  const error = useAppSelector(selectBarbersError);
  
  const [tabValue, setTabValue] = useState(0);
  const [name, setName] = useState('');
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (barberId) {
      dispatch(fetchBarberById(barberId));
    }
    
    return () => {
      dispatch(clearSelectedBarber());
      dispatch(clearAppointments());
    };
  }, [barberId, dispatch]);

  useEffect(() => {
    if (barber) {
      setName(barber.name);
      setSpecialties(barber.specialties);
      setRating(barber.rating);
    }
  }, [barber]);

  const handleAddSpecialty = () => {
    const trimmed = specialtyInput.trim();
    if (trimmed && !specialties.includes(trimmed)) {
      setSpecialties([...specialties, trimmed]);
      setSpecialtyInput('');
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter((s) => s !== specialty));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !barberId) {
      return;
    }

    try {
      await dispatch(
        updateBarber({
          barberId,
          data: {
            name: name.trim(),
            specialties: specialties.length > 0 ? specialties : ['General'],
            rating,
          },
        })
      ).unwrap();

      setSuccessOpen(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Failed to update barber:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSpecialty();
    }
  };

  if (loading && !barber) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!barber) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        Barber not found
      </Alert>
    );
  }

  return (
    <>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h2">
            {barber.name}
          </Typography>
        </Box>

        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Details" />
          <Tab label="Appointments" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                variant="outlined"
              />

              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    label="Add Specialty"
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., Haircut, Beard Trim"
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddSpecialty}
                    disabled={!specialtyInput.trim()}
                  >
                    Add
                  </Button>
                </Stack>

                {specialties.length > 0 && (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                    {specialties.map((specialty, index) => (
                      <Chip
                        key={index}
                        label={specialty}
                        onDelete={() => handleRemoveSpecialty(specialty)}
                        color="primary"
                        size="small"
                      />
                    ))}
                  </Stack>
                )}
              </Box>

              <TextField
                label="Rating"
                type="number"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                inputProps={{
                  min: 0,
                  max: 5,
                  step: 0.1,
                }}
                fullWidth
                variant="outlined"
              />

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  disabled={loading || !name.trim()}
                  fullWidth
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <AppointmentCalendar />
        </TabPanel>
      </Paper>

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Barber updated successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default BarberDetails;
