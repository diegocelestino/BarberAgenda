const express = require('express');
const router = express.Router();
const {
  getAppointmentsByBarber,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require('./appointmentController');

// Routes
router.get('/barbers/:barberId/appointments', getAppointmentsByBarber);
router.get('/barbers/:barberId/appointments/:appointmentId', getAppointmentById);
router.post('/barbers/:barberId/appointments', createAppointment);
router.put('/barbers/:barberId/appointments/:appointmentId', updateAppointment);
router.delete('/barbers/:barberId/appointments/:appointmentId', deleteAppointment);

module.exports = router;
