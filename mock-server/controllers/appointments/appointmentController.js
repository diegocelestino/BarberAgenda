const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Load initial data from JSON file
const loadAppointments = () => {
  try {
    const dataPath = path.join(__dirname, '../../resources', 'appointments', 'default.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading appointments data:', error);
    return [];
  }
};

// In-memory database
let appointments = loadAppointments();

// Get appointments for a barber
const getAppointmentsByBarber = (req, res) => {
  const { barberId } = req.params;
  const { startDate, endDate } = req.query;
  
  console.log(`GET /barbers/${barberId}/appointments`);
  
  let filtered = appointments.filter(a => a.barberId === barberId);
  
  if (startDate) {
    filtered = filtered.filter(a => a.startTime >= parseInt(startDate));
  }
  
  if (endDate) {
    filtered = filtered.filter(a => a.startTime <= parseInt(endDate));
  }
  
  // Sort by start time
  filtered.sort((a, b) => a.startTime - b.startTime);
  
  res.json({ appointments: filtered });
};

// Get single appointment
const getAppointmentById = (req, res) => {
  const { barberId, appointmentId } = req.params;
  console.log(`GET /barbers/${barberId}/appointments/${appointmentId}`);
  
  const appointment = appointments.find(
    a => a.barberId === barberId && a.appointmentId === appointmentId
  );
  
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  
  res.json({ appointment });
};

// Create appointment
const createAppointment = (req, res) => {
  const { barberId } = req.params;
  console.log('POST /barbers/:barberId/appointments', req.body);
  
  const { customerName, customerPhone, startTime, endTime, service, notes } = req.body;
  
  if (!customerName || !startTime || !endTime) {
    return res.status(400).json({ error: 'Customer name, start time, and end time are required' });
  }
  
  // Check for conflicts
  const hasConflict = appointments.some(a => 
    a.barberId === barberId &&
    a.status !== 'cancelled' &&
    ((startTime >= a.startTime && startTime < a.endTime) ||
     (endTime > a.startTime && endTime <= a.endTime) ||
     (startTime <= a.startTime && endTime >= a.endTime))
  );
  
  if (hasConflict) {
    return res.status(409).json({ error: 'Time slot conflicts with existing appointment' });
  }
  
  const newAppointment = {
    appointmentId: uuidv4(),
    barberId,
    customerName,
    customerPhone: customerPhone || '',
    startTime,
    endTime,
    service: service || 'Haircut',
    notes: notes || '',
    status: 'scheduled',
    createdAt: Date.now(),
  };
  
  appointments.push(newAppointment);
  res.status(201).json({ appointment: newAppointment });
};

// Update appointment
const updateAppointment = (req, res) => {
  const { barberId, appointmentId } = req.params;
  console.log(`PUT /barbers/${barberId}/appointments/${appointmentId}`, req.body);
  
  const appointmentIndex = appointments.findIndex(
    a => a.barberId === barberId && a.appointmentId === appointmentId
  );
  
  if (appointmentIndex === -1) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  
  const { customerName, customerPhone, startTime, endTime, service, notes, status } = req.body;
  
  // Check for conflicts if time is being changed
  if (startTime || endTime) {
    const newStart = startTime || appointments[appointmentIndex].startTime;
    const newEnd = endTime || appointments[appointmentIndex].endTime;
    
    const hasConflict = appointments.some((a, idx) => 
      idx !== appointmentIndex &&
      a.barberId === barberId &&
      a.status !== 'cancelled' &&
      ((newStart >= a.startTime && newStart < a.endTime) ||
       (newEnd > a.startTime && newEnd <= a.endTime) ||
       (newStart <= a.startTime && newEnd >= a.endTime))
    );
    
    if (hasConflict) {
      return res.status(409).json({ error: 'Time slot conflicts with existing appointment' });
    }
  }
  
  appointments[appointmentIndex] = {
    ...appointments[appointmentIndex],
    ...(customerName && { customerName }),
    ...(customerPhone !== undefined && { customerPhone }),
    ...(startTime && { startTime }),
    ...(endTime && { endTime }),
    ...(service && { service }),
    ...(notes !== undefined && { notes }),
    ...(status && { status }),
  };
  
  res.json({ appointment: appointments[appointmentIndex] });
};

// Delete appointment
const deleteAppointment = (req, res) => {
  const { barberId, appointmentId } = req.params;
  console.log(`DELETE /barbers/${barberId}/appointments/${appointmentId}`);
  
  const appointmentIndex = appointments.findIndex(
    a => a.barberId === barberId && a.appointmentId === appointmentId
  );
  
  if (appointmentIndex === -1) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  
  appointments.splice(appointmentIndex, 1);
  res.status(204).send();
};

module.exports = {
  getAppointmentsByBarber,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
