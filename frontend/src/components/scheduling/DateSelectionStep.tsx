import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isBusinessDay, getMaxBookingDate } from '../../config/businessHours';

interface DateSelectionStepProps {
  onNext: (date: Date) => void;
  onBack: () => void;
  selectedDate?: Date;
}

const DateSelectionStep: React.FC<DateSelectionStepProps> = ({ onNext, onBack, selectedDate }) => {
  const [date, setDate] = useState<Date | null>(selectedDate || null);

  const handleNext = () => {
    if (date) {
      onNext(date);
    }
  };

  const minDate = new Date();
  const maxDate = getMaxBookingDate();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CalendarIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mr: 2 }} />
        <Typography variant="h5" color="text.primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Choose a Date
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        Select your preferred appointment date
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar
            value={date}
            onChange={(newDate) => setDate(newDate)}
            minDate={minDate}
            maxDate={maxDate}
            shouldDisableDate={(date) => !isBusinessDay(date)}
            sx={{
              bgcolor: 'background.default',
              borderRadius: 2,
              maxWidth: '100%',
              '& .MuiPickersCalendarHeader-root': {
                paddingLeft: { xs: 1, sm: 2 },
                paddingRight: { xs: 1, sm: 2 },
              },
              '& .MuiDayCalendar-header': {
                justifyContent: 'space-around',
              },
              '& .MuiPickersDay-root': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              },
            }}
          />
        </LocalizationProvider>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          fullWidth
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          fullWidth
          disabled={!date}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default DateSelectionStep;
