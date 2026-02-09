import { useState } from 'react';
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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createBarber, selectBarbersLoading } from '../../store/barbers';

const CreateBarber: React.FC = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectBarbersLoading);
  
  const [name, setName] = useState('');
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [successOpen, setSuccessOpen] = useState(false);

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

    if (!name.trim()) {
      return;
    }

    try {
      await dispatch(
        createBarber({
          name: name.trim(),
          specialties: specialties.length > 0 ? specialties : ['General'],
          rating,
        })
      ).unwrap();

      // Reset form
      setName('');
      setSpecialties([]);
      setRating(5);
      setSuccessOpen(true);
    } catch (err) {
      console.error('Failed to create barber:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSpecialty();
    }
  };

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Create New Barber
      </Typography>

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

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            disabled={loading || !name.trim()}
            fullWidth
          >
            {loading ? 'Creating...' : 'Create Barber'}
          </Button>
        </Stack>
      </Box>

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
          Barber created successfully!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CreateBarber;
