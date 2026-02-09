const express = require('express');
const router = express.Router();
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require('./serviceController');

// Routes
router.get('/services', getAllServices);
router.get('/services/:serviceId', getServiceById);
router.post('/services', createService);
router.put('/services/:serviceId', updateService);
router.delete('/services/:serviceId', deleteService);

module.exports = router;
