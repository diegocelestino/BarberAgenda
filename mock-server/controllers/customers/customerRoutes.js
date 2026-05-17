const express = require('express');
const router = express.Router();
const {
  listCustomers,
  getCustomer,
  getByPhone,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('./customerController');

router.get('/customers', listCustomers);
router.get('/customers/phone/:phone', getByPhone);
router.get('/customers/:customerId', getCustomer);
router.post('/customers', createCustomer);
router.put('/customers/:customerId', updateCustomer);
router.delete('/customers/:customerId', deleteCustomer);

module.exports = router;
