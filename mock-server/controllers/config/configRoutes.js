const express = require('express');
const router = express.Router();
const { getBusinessRules, getRuleCategory, updateBusinessRules } = require('./configController');

router.get('/config', getBusinessRules);
router.get('/config/:category', getRuleCategory);
router.put('/config', updateBusinessRules);

module.exports = router;
