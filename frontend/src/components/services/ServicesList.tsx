import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchServices,
  selectAllServices,
  selectServicesLoading,
  selectServicesError,
} from '../../store/services';
import { Service } from '../../services/servicesApi';
import CreateServiceDialog from './CreateServiceDialog';
import EditServiceDialog from './EditServiceDialog';
import DeleteServiceDialog from './DeleteServiceDialog';

const ServicesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const services = useAppSelector(selectAllServices);
  const loading = useAppSelector(selectServicesLoading);
  const error = useAppSelector(selectServicesError);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const handleEditClick = (service: Service) => {
    setSelectedService(service);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (service: Service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedService(null);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    setSelectedService(null);
  };

  if (loading && services.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Services
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Service
        </Button>
      </Box>

      {services.length === 0 ? (
        <Alert severity="info">
          No services found. Create one to get started!
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service</TableCell>
                <TableCell align="right">Duration</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.serviceId} hover>
                  <TableCell>
                    <Typography variant="body1">{service.title}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {service.durationMinutes} min
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(service)}
                      title="Edit service"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(service)}
                      title="Delete service"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CreateServiceDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditServiceDialog
        open={editDialogOpen}
        service={selectedService}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
      />

      <DeleteServiceDialog
        open={deleteDialogOpen}
        serviceId={selectedService?.serviceId || null}
        serviceName={selectedService?.title || null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default ServicesList;
