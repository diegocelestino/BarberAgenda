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
import { ArrowBack as ArrowBackIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchBarberById,
  selectSelectedBarber,
  selectBarbersLoading,
  selectBarbersError,
  clearSelectedBarber,
} from '../store/barbers';
import {
  fetchAppointmentsByBarber,
  selectAllAppointments,
  selectAppointmentsLoading,
  clearAppointments,
} from '../store/appointments';
import { fetchServices, selectAllServices } from '../store/services';

const BarberExtractPage: React.FC = () => {
  const { barberId } = useParams<{ barberId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const barber = useAppSelector(selectSelectedBarber);
  const loading = useAppSelector(selectBarbersLoading);
  const error = useAppSelector(selectBarbersError);
  const appointments = useAppSelector(selectAllAppointments);
  const appointmentsLoading = useAppSelector(selectAppointmentsLoading);
  const services = useAppSelector(selectAllServices);

  const [startDate, setStartDate] = useState(() => {
    return new Date().toISOString().split('T')[0]; // Today
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]; // Today
  });

  useEffect(() => {
    if (barberId) {
      dispatch(fetchBarberById(barberId));
      dispatch(fetchServices()); // Fetch services for price calculation
    }
    
    return () => {
      dispatch(clearSelectedBarber());
      dispatch(clearAppointments());
    };
  }, [barberId, dispatch]);

  useEffect(() => {
    if (barberId && startDate && endDate) {
      // Parse dates in Brazil timezone (UTC-3)
      const startDateObj = new Date(startDate + 'T00:00:00-03:00');
      const endDateObj = new Date(endDate + 'T23:59:59-03:00');
      
      const start = startDateObj.getTime();
      const end = endDateObj.getTime();
      
      // Fetch only completed appointments
      dispatch(fetchAppointmentsByBarber({ 
        barberId, 
        params: { 
          startDate: start, 
          endDate: end,
          status: 'completed' // Only fetch completed appointments
        } 
      }));
    }
  }, [barberId, startDate, endDate, dispatch]);

  // All appointments are already completed from the API
  const completedAppointments = [...appointments]
    .sort((a, b) => b.startTime - a.startTime); // Most recent first

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getServicePrice = (serviceId: string): number => {
    const service = services.find(s => s.serviceId === serviceId);
    return service ? service.price : 0;
  };

  const getServiceName = (serviceId: string): string => {
    const service = services.find(s => s.serviceId === serviceId);
    return service ? service.title : serviceId;
  };

  const calculateTotal = () => {
    return completedAppointments.reduce((total, apt) => {
      return total + getServicePrice(apt.service);
    }, 0);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Extrato de Atendimentos', 14, 20);
    
    // Barber info
    doc.setFontSize(12);
    doc.text(`Barbeiro: ${barber?.name}`, 14, 30);
    doc.text(`Período: ${new Date(startDate).toLocaleDateString('pt-BR')} - ${new Date(endDate).toLocaleDateString('pt-BR')}`, 14, 37);
    
    // Table data
    const tableData = completedAppointments.map(apt => {
      const { date, time } = formatDateTime(apt.startTime);
      const price = getServicePrice(apt.service);
      const serviceName = getServiceName(apt.service);
      return [
        date,
        time,
        apt.customerName,
        serviceName,
        `R$ ${price.toFixed(2)}`,
        apt.notes || '-',
      ];
    });
    
    // Generate table
    autoTable(doc, {
      startY: 45,
      head: [['Data', 'Hora', 'Cliente', 'Serviço', 'Valor', 'Observações']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [25, 118, 210] },
    });
    
    // Total
    const finalY = (doc as any).lastAutoTable.finalY || 45;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: R$ ${calculateTotal().toFixed(2)}`, 14, finalY + 10);
    doc.text(`Quantidade de atendimentos: ${completedAppointments.length}`, 14, finalY + 17);
    
    // Save
    const fileName = `extrato_${barber?.name}_${startDate}_${endDate}.pdf`;
    doc.save(fileName);
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
            color="error"
            startIcon={<PdfIcon />}
            onClick={exportToPDF}
            disabled={completedAppointments.length === 0}
          >
            Exportar PDF
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

        {appointmentsLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        ) : completedAppointments.length === 0 ? (
          <Alert severity="info">
            Nenhum atendimento concluído encontrado no período selecionado.
          </Alert>
        ) : (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total de atendimentos: {completedAppointments.length}
              </Typography>
              <Typography variant="h6" color="primary">
                Total: R$ {calculateTotal().toFixed(2)}
              </Typography>
            </Box>
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
                  {completedAppointments.map((appointment) => {
                    const { date, time } = formatDateTime(appointment.startTime);
                    const price = getServicePrice(appointment.service);
                    const serviceName = getServiceName(appointment.service);
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
                          <Chip label={serviceName} size="small" color="success" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            R$ {price.toFixed(2)}
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
