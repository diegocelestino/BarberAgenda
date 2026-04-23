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
  
  const { name, serviceIds, rating, photoUrl, schedule } = req.body;
  
  barbers[barberIndex] = {
    ...barbers[barberIndex],
    ...(name && { name }),
    ...(serviceIds && { serviceIds }),
    ...(rating !== undefined && { rating }),
    ...(photoUrl && { photoUrl }),
    ...(schedule && { schedule }),
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

// Load appointments data from the appointments controller
// This ensures we get the in-memory appointments that include newly created ones
const loadAppointments = () => {
  try {
    // Import the appointments from the appointments controller
    const appointmentController = require('../appointments/appointmentController');
    return appointmentController.getAppointmentsInMemory();
  } catch (error) {
    console.error('Error loading appointments data:', error);
    return [];
  }
};

// Generate time slots from barber schedule
const generateTimeSlots = (schedule) => {
  const slots = [];
  
  // Validate schedule
  if (!schedule || !schedule.openTime || !schedule.closeTime) {
    console.error('Invalid schedule - missing required time properties');
    return slots;
  }
  
  try {
    const [openH, openM] = schedule.openTime.split(':').map(Number);
    const [closeH, closeM] = schedule.closeTime.split(':').map(Number);
    const [lunchStartH, lunchStartM] = (schedule.lunchStart || '12:00').split(':').map(Number);
    const [lunchEndH, lunchEndM] = (schedule.lunchEnd || '13:00').split(':').map(Number);
    
    // Validate parsed numbers
    if (isNaN(openH) || isNaN(openM) || isNaN(closeH) || isNaN(closeM)) {
      console.error('Invalid schedule - could not parse time values');
      return slots;
    }
    
    const startMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;
    const lunchStart = lunchStartH * 60 + lunchStartM;
    const lunchEnd = lunchEndH * 60 + lunchEndM;
    const slotInterval = schedule.slotInterval || 30;
    
    for (let m = startMinutes; m < endMinutes; m += slotInterval) {
      // Skip lunch break slots
      if (m >= lunchStart && m < lunchEnd) continue;
      
      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
  } catch (error) {
    console.error('Error generating time slots:', error);
  }
  
  return slots;
};

// Get available time slots for a barber on a specific date
const getAvailableSlots = (req, res) => {
  const { barberId } = req.params;
  const { date, duration } = req.query;
  
  console.log(`GET /barbers/${barberId}/available-slots`, { date, duration });
  
  // Validate required parameters
  if (!date) {
    return res.status(400).json({ error: 'date parameter is required (ISO date string)' });
  }
  
  if (!duration) {
    return res.status(400).json({ error: 'duration parameter is required (minutes)' });
  }
  
  // Find barber
  const barber = barbers.find(b => b.barberId === barberId);
  if (!barber) {
    return res.status(404).json({ error: 'Barber not found' });
  }
  
  // Get barber schedule with defaults
  const schedule = barber.schedule || {
    openTime: '09:00',
    closeTime: '18:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    workDays: [1, 2, 3, 4, 5, 6],
    slotInterval: 30,
  };
  
  // Parse the date (format: YYYY-MM-DD)
  const requestedDate = new Date(date + 'T00:00:00-03:00');
  const dayOfWeek = requestedDate.getDay();
  
  // Check if barber works on this day
  const workDays = schedule.workDays || [1, 2, 3, 4, 5, 6];
  if (!workDays.includes(dayOfWeek)) {
    return res.json({ 
      slots: [], 
      date,
      message: 'Barber does not work on this day'
    });
  }
  
  // Generate all possible time slots
  const allSlots = generateTimeSlots(schedule);
  
  if (allSlots.length === 0) {
    return res.json({ 
      slots: [], 
      date,
      message: 'No time slots available - check barber schedule configuration'
    });
  }
  
  // Load appointments for this barber on this date
  const appointments = loadAppointments();
  const dayStart = requestedDate.getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;
  
  const dayAppointments = appointments.filter(apt => 
    apt.barberId === barberId &&
    apt.status !== 'cancelled' &&
    apt.startTime >= dayStart &&
    apt.startTime < dayEnd
  );
  
  // Merge overlapping appointments
  const mergedAppointments = [];
  dayAppointments.forEach(apt => {
    let merged = false;
    
    for (let i = 0; i < mergedAppointments.length; i++) {
      const existing = mergedAppointments[i];
      const overlaps = apt.startTime < existing.endTime && apt.endTime > existing.startTime;
      
      if (overlaps) {
        mergedAppointments[i] = {
          ...existing,
          startTime: Math.min(existing.startTime, apt.startTime),
          endTime: Math.max(existing.endTime, apt.endTime),
        };
        merged = true;
        break;
      }
    }
    
    if (!merged) {
      mergedAppointments.push({ ...apt });
    }
  });
  
  // Filter slots based on availability
  const serviceDuration = parseInt(duration);
  const now = Date.now();
  const oneHourFromNow = now + 60 * 60 * 1000;
  
  const availableSlots = allSlots.filter(timeSlot => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    
    // Create slot time in Brazil timezone
    const year = requestedDate.getFullYear();
    const month = String(requestedDate.getMonth() + 1).padStart(2, '0');
    const day = String(requestedDate.getDate()).padStart(2, '0');
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    const slotDateTimeString = `${year}-${month}-${day}T${timeStr}:00-03:00`;
    const slotStart = new Date(slotDateTimeString).getTime();
    const slotEnd = slotStart + serviceDuration * 60 * 1000;
    
    // Check if slot is at least 1 hour in the future
    if (slotStart < oneHourFromNow) {
      return false;
    }
    
    // Check for conflicts with existing appointments
    const hasConflict = mergedAppointments.some(apt => {
      return slotStart < apt.endTime && slotEnd > apt.startTime;
    });
    
    return !hasConflict;
  });
  
  res.json({ 
    slots: availableSlots,
    date,
    barberId,
    totalSlots: allSlots.length,
    availableCount: availableSlots.length,
    bookedCount: allSlots.length - availableSlots.length
  });
};

// Load services data
const loadServices = () => {
  try {
    const dataPath = path.join(__dirname, '../../resources', 'services', 'default.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading services data:', error);
    return [];
  }
};

// Get barber extract/report
const getExtract = (req, res) => {
  const { barberId } = req.params;
  const { startDate, endDate, format = 'json' } = req.query;
  
  console.log(`GET /barbers/${barberId}/extract`, { startDate, endDate, format });
  
  // Validate required parameters
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate parameters are required (timestamps)' });
  }
  
  // Find barber
  const barber = barbers.find(b => b.barberId === barberId);
  if (!barber) {
    return res.status(404).json({ error: 'Barber not found' });
  }
  
  // Load appointments and services
  const appointments = loadAppointments();
  const services = loadServices();
  
  // Filter completed appointments in date range
  const start = parseInt(startDate);
  const end = parseInt(endDate);
  
  const completedAppointments = appointments.filter(apt => 
    apt.barberId === barberId &&
    apt.status === 'completed' &&
    apt.startTime >= start &&
    apt.startTime <= end
  ).sort((a, b) => b.startTime - a.startTime); // Most recent first
  
  // Calculate totals and aggregations
  let totalRevenue = 0;
  const byService = {};
  
  completedAppointments.forEach(apt => {
    const service = services.find(s => s.serviceId === apt.service);
    const price = service ? service.price : 0;
    const serviceName = service ? service.title : apt.service;
    
    totalRevenue += price;
    
    if (!byService[apt.service]) {
      byService[apt.service] = {
        serviceId: apt.service,
        serviceName,
        count: 0,
        revenue: 0,
      };
    }
    
    byService[apt.service].count++;
    byService[apt.service].revenue += price;
  });
  
  const summary = {
    totalRevenue,
    totalAppointments: completedAppointments.length,
    byService: Object.values(byService),
  };
  
  // Format response based on requested format
  if (format === 'pdf') {
    // Generate PDF
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    
    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=extrato_${barber.name}_${startDate}_${endDate}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Title
    doc.fontSize(18).text('Extrato de Atendimentos', { align: 'left' });
    doc.moveDown();
    
    // Barber info
    doc.fontSize(12);
    doc.text(`Barbeiro: ${barber.name}`);
    doc.text(`Período: ${new Date(start).toLocaleDateString('pt-BR')} - ${new Date(end).toLocaleDateString('pt-BR')}`);
    doc.moveDown();
    
    // Summary
    doc.fontSize(14).text('Resumo', { underline: true });
    doc.fontSize(12);
    doc.text(`Total de atendimentos: ${summary.totalAppointments}`);
    doc.text(`Receita total: R$ ${summary.totalRevenue.toFixed(2)}`);
    doc.moveDown();
    
    // By service
    if (summary.byService.length > 0) {
      doc.fontSize(14).text('Por Serviço', { underline: true });
      doc.fontSize(10);
      summary.byService.forEach(s => {
        doc.text(`${s.serviceName}: ${s.count} atendimentos - R$ ${s.revenue.toFixed(2)}`);
      });
      doc.moveDown();
    }
    
    // Appointments list
    doc.fontSize(14).text('Atendimentos', { underline: true });
    doc.fontSize(9);
    
    completedAppointments.forEach(apt => {
      const service = services.find(s => s.serviceId === apt.service);
      const price = service ? service.price : 0;
      const serviceName = service ? service.title : apt.service;
      const date = new Date(apt.startTime);
      
      doc.text(
        `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ` +
        `${apt.customerName} - ${serviceName} - R$ ${price.toFixed(2)}`
      );
    });
    
    // Finalize PDF
    doc.end();
  } else {
    // Return JSON
    res.json({
      barber: {
        barberId: barber.barberId,
        name: barber.name,
      },
      period: {
        startDate: start,
        endDate: end,
      },
      summary,
      appointments: completedAppointments.map(apt => {
        const service = services.find(s => s.serviceId === apt.service);
        return {
          ...apt,
          serviceName: service ? service.title : apt.service,
          servicePrice: service ? service.price : 0,
        };
      }),
    });
  }
};

// Get services for a specific barber (filtered by barber's serviceIds)
const getBarberServices = (req, res) => {
  const { barberId } = req.params;
  console.log(`GET /barbers/${barberId}/services`);
  
  // Find barber
  const barber = barbers.find(b => b.barberId === barberId);
  if (!barber) {
    return res.status(404).json({ error: 'Barber not found' });
  }
  
  // Load all services
  const allServices = loadServices();
  
  // Filter services by barber's serviceIds
  const barberServices = allServices.filter(service => 
    barber.serviceIds && barber.serviceIds.includes(service.serviceId)
  );
  
  res.json({ services: barberServices });
};

module.exports = {
  getAllBarbers,
  getBarberById,
  createBarber,
  updateBarber,
  deleteBarber,
  getAvailableSlots,
  getExtract,
  getBarberServices,
};
