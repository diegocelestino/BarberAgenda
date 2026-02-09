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
  const { title, durationMinutes } = req.body;
  
  if (!title || !durationMinutes) {
    return res.status(400).json({ error: 'Title and duration are required' });
  }
  
  const newService = {
    serviceId: `service-${Date.now()}`,
    title,
    durationMinutes: parseInt(durationMinutes),
  };
  
  services.push(newService);
  
  // Save to file
  fs.writeFileSync(servicesPath, JSON.stringify(services, null, 2));
  
  res.status(201).json(newService);
};

// Update service
const updateService = (req, res) => {
  const { serviceId } = req.params;
  const { title, durationMinutes } = req.body;
  
  const serviceIndex = services.findIndex(s => s.serviceId === serviceId);
  
  if (serviceIndex === -1) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  if (title !== undefined) {
    services[serviceIndex].title = title;
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
