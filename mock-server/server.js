const express = require('express');
const cors = require('cors');
const barberRoutes = require('./controllers/barbers/barberRoutes');
const appointmentRoutes = require('./controllers/appointments/appointmentRoutes');
const serviceRoutes = require('./controllers/services/serviceRoutes');
const authRoutes = require('./controllers/auth/authRoutes');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', barberRoutes);
app.use('/', appointmentRoutes);
app.use('/', serviceRoutes);
app.use('/', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
});
