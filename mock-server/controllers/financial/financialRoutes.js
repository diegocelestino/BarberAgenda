const express = require('express');
const router = express.Router();
const {
  createTransaction,
  listTransactions,
  getSummary,
  getCommissions,
  payCommission,
} = require('./financialController');

router.get('/financial/summary', getSummary);
router.get('/financial/transactions', listTransactions);
router.post('/financial/transactions', createTransaction);
router.get('/financial/commissions', getCommissions);
router.post('/financial/commissions/pay', payCommission);

module.exports = router;
