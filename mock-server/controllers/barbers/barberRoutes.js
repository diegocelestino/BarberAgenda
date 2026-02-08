const express = require('express');
const router = express.Router();
const {
  getAllBarbers,
  getBarberById,
  createBarber,
  updateBarber,
  deleteBarber,
} = require('./barberController');

// Routes
router.get('/barbers', getAllBarbers);
router.get('/barbers/:barberId', getBarberById);
router.post('/barbers', createBarber);
router.put('/barbers/:barberId', updateBarber);
router.delete('/barbers/:barberId', deleteBarber);

module.exports = router;
