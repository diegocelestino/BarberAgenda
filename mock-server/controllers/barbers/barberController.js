const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Load initial data from JSON file
const loadBarbers = () => {
  try {
    const dataPath = path.join(__dirname, '../../resources', 'barbers', 'default.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading barbers data:', error);
    return [];
  }
};

// In-memory database
let barbers = loadBarbers();

// Get all barbers
const getAllBarbers = (req, res) => {
  console.log('GET /barbers');
  res.json({ barbers });
};

// Get single barber
const getBarberById = (req, res) => {
  const { barberId } = req.params;
  console.log(`GET /barbers/${barberId}`);
  
  const barber = barbers.find(b => b.barberId === barberId);
  
  if (!barber) {
    return res.status(404).json({ error: 'Barber not found' });
  }
  
  res.json({ barber });
};

// Create barber
const createBarber = (req, res) => {
  console.log('POST /barbers', req.body);
  
  const { name, serviceIds, rating, photoUrl } = req.body;
  
  if (!name || !serviceIds || !Array.isArray(serviceIds)) {
    return res.status(400).json({ error: 'Name and serviceIds are required' });
  }
  
  const newBarber = {
    barberId: uuidv4(),
    name,
    serviceIds,
    rating: rating || 0,
    photoUrl: photoUrl || 'https://via.placeholder.com/150',
    createdAt: Date.now(),
  };
  
  barbers.push(newBarber);
  res.status(201).json({ barber: newBarber });
};

// Update barber
const updateBarber = (req, res) => {
  const { barberId } = req.params;
  console.log(`PUT /barbers/${barberId}`, req.body);
  
  const barberIndex = barbers.findIndex(b => b.barberId === barberId);
  
  if (barberIndex === -1) {
    return res.status(404).json({ error: 'Barber not found' });
  }
  
  const { name, serviceIds, rating, photoUrl } = req.body;
  
  barbers[barberIndex] = {
    ...barbers[barberIndex],
    ...(name && { name }),
    ...(serviceIds && { serviceIds }),
    ...(rating !== undefined && { rating }),
    ...(photoUrl && { photoUrl }),
  };
  
  res.json({ barber: barbers[barberIndex] });
};

// Delete barber
const deleteBarber = (req, res) => {
  const { barberId } = req.params;
  console.log(`DELETE /barbers/${barberId}`);
  
  const barberIndex = barbers.findIndex(b => b.barberId === barberId);
  
  if (barberIndex === -1) {
    return res.status(404).json({ error: 'Barber not found' });
  }
  
  barbers.splice(barberIndex, 1);
  res.status(204).send();
};

module.exports = {
  getAllBarbers,
  getBarberById,
  createBarber,
  updateBarber,
  deleteBarber,
};
