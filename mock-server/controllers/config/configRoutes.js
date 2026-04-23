const express = require('express');
const router = express.Router();
const {
  getBusinessRules,
  getRuleCategory,
} = require('./configController');

// Routes
router.get('/config/business-rules', getBusinessRules);
router.get('/config/business-rules/:category', getRuleCategory);

module.exports = router;
