const express = require('express');
const router = express.Router();
const {
  login,
  getCurrentUser,
  createUser,
} = require('./authController');

// Routes
router.post('/auth/login', login);
router.get('/auth/me', getCurrentUser);
router.post('/auth/register', createUser);

module.exports = router;
