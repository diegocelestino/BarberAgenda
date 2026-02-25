import { useState } from 'react';
import {
  Box, Button, Stack, TextField, Typography,
  ToggleButton, ToggleButtonGroup, Alert, Snackbar,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateBarber, selectBarbersLoading } from '../../store/barbers';
import { BarberSchedule, Barber } from '../../services/api';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEFAULT_SCHEDULE: BarberSchedule = {
  openTime: '09:00',
  closeTime: '18:00',
  lunchStart: '12:00',
  lunchEnd: '13:00',
  workDays: [1, 2, 3, 4, 5, 6],
  slotInterval: 30,
};

interface Props {
  barber: Barber;
}

const BarberScheduleTab: React.FC<Props> = ({ barber }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectBarbersLoading);
  const [successOpen, setSuccessOpen] = useState(false);

  const [schedule, setSchedule] = useState<BarberSchedule>(
    barber.schedule ?? DEFAULT_SCHEDULE
  );

  const handleChange = (field: keyof BarberSchedule, value: any) => {
    setSchedule((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(updateBarber({ barberId: barber.barberId, data: { schedule } })).unwrap();
    setSuccessOpen(true);
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Working Days</Typography>
            <ToggleButtonGroup
              value={schedule.workDays}
              onChange={(_, newDays) => handleChange('workDays', newDays)}
              sx={{ flexWrap: 'wrap', gap: 0.5 }}
            >
              {DAY_LABELS.map((label, index) => (
                <ToggleButton key={index} value={index} size="small" sx={{ minWidth: 48 }}>
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Open Time"
              type="time"
              value={schedule.openTime}
              onChange={(e) => handleChange('openTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Close Time"
              type="time"
              value={schedule.closeTime}
              onChange={(e) => handleChange('closeTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Lunch Start"
              type="time"
              value={schedule.lunchStart}
              onChange={(e) => handleChange('lunchStart', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Lunch End"
              type="time"
              value={schedule.lunchEnd}
              onChange={(e) => handleChange('lunchEnd', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>

          <TextField
            label="Slot Interval (minutes)"
            type="number"
            value={schedule.slotInterval}
            onChange={(e) => handleChange('slotInterval', parseInt(e.target.value))}
            inputProps={{ min: 15, max: 120, step: 15 }}
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={loading || schedule.workDays.length === 0}
            fullWidth
          >
            {loading ? 'Saving...' : 'Save Schedule'}
          </Button>
        </Stack>
      </Box>

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessOpen(false)} severity="success" sx={{ width: '100%' }}>
          Schedule saved successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default BarberScheduleTab;
