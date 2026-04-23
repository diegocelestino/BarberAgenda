import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Stack,
  Button,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchBarberById,
  selectSelectedBarber,
  selectBarbersLoading,
  selectBarbersError,
  clearSelectedBarber,
} from '../store/barbers';
import { parseDate, endOfDay, formatFullDate, formatTime, getTodayDateString } from '../utils/dateTime';
import { barberApi } from '../services/api';

interface ExtractData {
  barber: {
    barberId: string;
    name: string;
  };
  period: {
    startDate: number;
    endDate: number;
  };
  summary: {
    totalRevenue: number;
    totalAppointments: number;
    byService: Array<{
      serviceId: string;
      serviceName: string;
      count: number;
      revenue: number;
    }>;
  };
  appointments: Array<{
    appointmentId: string;
    customerName: string;
    customerPhone?: string;
    startTime: number;
    serviceName: string;
    servicePrice: number;
    notes?: string;
  }>;
}

const BarberExtractPage: React.FC = () => {
  const { barberId } = useParams<{ barberId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const barber = useAppSelector(selectSelectedBarber);
  const loading = useAppSelector(selectBarbersLoading);
  const error = useAppSelector(selectBarbersError);

  const [startDate, setStartDate] = useState(() => {
    return getTodayDateString();
  });

  const [endDate, setEndDate] = useState(() => {
    return getTodayDateString();
  });

  const [extractData, setExtractData] = useState<ExtractData | null>(null);
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  useEffect(() => {
    if (barberId) {
      dispatch(fetchBarberById(barberId));
    }
    
    return () => {
      dispatch(clearSelectedBarber());
    };
  }, [barberId, dispatch]);

  useEffect(() => {
    if (barberId && startDate && endDate) {
      const loadData = async () => {
        try {
          setExtractLoading(true);
          setExtractError(null);

          // Parse dates using centralized utility
          const start = parseDate(startDate);
          const end = endOfDay(parseDate(endDate));

          // Fetch extract from backend
          const data = await barberApi.getExtract(barberId, start, end);
          setExtractData(data);
        } catch (err) {
          console.error('Error loading extract:', err);
          setExtractError('Erro ao carregar extrato. Por favor, tente novamente.');
        } finally {
          setExtractLoading(false);
        }
      };

      loadData();
    }
  }, [barberId, startDate, endDate]);

  const formatDateTime = (timestamp: number) => {
    return {
      date: formatFullDate(timestamp),
      time: formatTime(timestamp),
    };
  };

  const handleDownloadPDF = async () => {
    if (!barberId || !extractData) return;

    try {
      // Parse dates using centralized utility
      const start = parseDate(startDate);
      const end = endOfDay(parseDate(endDate));

      // Call backend API with format=pdf
      const apiUrl = process.env.REACT_APP_API_URL;
      const url = `${apiUrl}/barbers/${barberId}/extract?startDate=${start}&endDate=${end}&format=pdf`;
      
      // Open in new tab to download
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Erro ao baixar PDF. Por favor, tente novamente.');
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
        Barbeiro não encontrado
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 } }}>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate(`/admin/barber/${barberId}`)} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h2">
              Extrato - {barber.name}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            disabled={!extractData || extractData.summary.totalAppointments === 0}
          >
            Baixar PDF
          </Button>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Data Início"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Data Fim"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>

        {extractError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {extractError}
          </Alert>
        )}

        {extractLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        ) : !extractData ? (
          <Alert severity="info">
            Selecione um período para visualizar o extrato.
          </Alert>
        ) : extractData.summary.totalAppointments === 0 ? (
          <Alert severity="info">
            Nenhum atendimento concluído encontrado no período selecionado.
          </Alert>
        ) : (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total de atendimentos: {extractData.summary.totalAppointments}
              </Typography>
              <Typography variant="h6" color="primary">
                Total: R$ {extractData.summary.totalRevenue.toFixed(2)}
              </Typography>
            </Box>

            {extractData.summary.byService.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Por Serviço:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {extractData.summary.byService.map((service) => (
                    <Chip
                      key={service.serviceId}
                      label={`${service.serviceName}: ${service.count}x - R$ ${service.revenue.toFixed(2)}`}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Hora</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Serviço</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Observações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {extractData.appointments.map((appointment) => {
                    const { date, time } = formatDateTime(appointment.startTime);
                    return (
                      <TableRow key={appointment.appointmentId} hover>
                        <TableCell>{date}</TableCell>
                        <TableCell>{time}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {appointment.customerName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={appointment.serviceName} size="small" color="success" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            R$ {appointment.servicePrice.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.customerPhone || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.notes || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default BarberExtractPage;
