const express = require('express');
const cors = require('cors');
const barberRoutes = require('./controllers/barbers/barberRoutes');
const appointmentRoutes = require('./controllers/appointments/appointmentRoutes');
const serviceRoutes = require('./controllers/services/serviceRoutes');
const authRoutes = require('./controllers/auth/authRoutes');
const configRoutes = require('./controllers/config/configRoutes');
const customerRoutes = require('./controllers/customers/customerRoutes');
const financialRoutes = require('./controllers/financial/financialRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', barberRoutes);
app.use('/', appointmentRoutes);
app.use('/', serviceRoutes);
app.use('/', authRoutes);
app.use('/', configRoutes);
app.use('/', customerRoutes);
app.use('/', financialRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
});
