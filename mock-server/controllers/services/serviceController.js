const fs = require('fs');
const path = require('path');

// Load services from JSON file
const servicesPath = path.join(__dirname, '../../resources/services/default.json');
let services = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));

// Get all services
const getAllServices = (req, res) => {
  res.json(services);
};

// Get service by ID
const getServiceById = (req, res) => {
  const { serviceId } = req.params;
  const service = services.find(s => s.serviceId === serviceId);
  
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  res.json(service);
};

// Create service
const createService = (req, res) => {
  const { title, name, description, price, duration, durationMinutes } = req.body;
  
  if (!title || !name || !price || !duration) {
    return res.status(400).json({ error: 'Title, name, price, and duration are required' });
  }
  
  const newService = {
    serviceId: `service-${Date.now()}`,
    title,
    name,
    description: description || '',
    price: parseFloat(price),
    duration: parseInt(duration),
    durationMinutes: parseInt(durationMinutes || duration),
  };
  
  services.push(newService);
  
  // Save to file
  fs.writeFileSync(servicesPath, JSON.stringify(services, null, 2));
  
  res.status(201).json(newService);
};

// Update service
const updateService = (req, res) => {
  const { serviceId } = req.params;
  const { title, name, description, price, duration, durationMinutes } = req.body;
  
  const serviceIndex = services.findIndex(s => s.serviceId === serviceId);
  
  if (serviceIndex === -1) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  if (title !== undefined) {
    services[serviceIndex].title = title;
  }
  
  if (name !== undefined) {
    services[serviceIndex].name = name;
  }
  
  if (description !== undefined) {
    services[serviceIndex].description = description;
  }
  
  if (price !== undefined) {
    services[serviceIndex].price = parseFloat(price);
  }
  
  if (duration !== undefined) {
    services[serviceIndex].duration = parseInt(duration);
    services[serviceIndex].durationMinutes = parseInt(duration);
  }
  
  if (durationMinutes !== undefined) {
    services[serviceIndex].durationMinutes = parseInt(durationMinutes);
  }
  
  // Save to file
  fs.writeFileSync(servicesPath, JSON.stringify(services, null, 2));
  
  res.json(services[serviceIndex]);
};

// Delete service
const deleteService = (req, res) => {
  const { serviceId } = req.params;
  
  const serviceIndex = services.findIndex(s => s.serviceId === serviceId);
  
  if (serviceIndex === -1) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  services.splice(serviceIndex, 1);
  
  // Save to file
  fs.writeFileSync(servicesPath, JSON.stringify(services, null, 2));
  
  res.status(204).send();
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
