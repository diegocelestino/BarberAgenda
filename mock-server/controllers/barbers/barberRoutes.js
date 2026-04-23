const express = require('express');
const router = express.Router();
const {
  getAllBarbers,
  getBarberById,
  createBarber,
  updateBarber,
  deleteBarber,
  getAvailableSlots,
  getExtract,
} = require('./barberController');

// Routes
router.get('/barbers', getAllBarbers);
router.get('/barbers/:barberId', getBarberById);
router.get('/barbers/:barberId/available-slots', getAvailableSlots);
router.get('/barbers/:barberId/extract', getExtract);
router.post('/barbers', createBarber);
router.put('/barbers/:barberId', updateBarber);
router.delete('/barbers/:barberId', deleteBarber);

module.exports = router;
