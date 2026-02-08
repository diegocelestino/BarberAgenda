const express = require('express');
const cors = require('cors');
const barberRoutes = require('./controllers/barbers/barberRoutes');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', barberRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
});
