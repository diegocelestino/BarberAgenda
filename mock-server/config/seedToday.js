/**
 * Generates mock data for the current week so the dashboard has realistic data.
 * Called once on server startup.
 */

const { v4: uuidv4 } = require('uuid');

const BARBER_ID = 'e4848b23-c21b-49eb-8905-db2fabadc4e5';

const SERVICES = [
  { id: '5d0791eb-06e6-4dab-8918-7aef0dacfb4b', name: 'Corte', duration: 30, price: 40 },
  { id: 'da18da28-4af3-4571-9c82-11c953e6d0c4', name: 'Barba', duration: 10, price: 35 },
  { id: '6ff97218-4ef0-4ff6-92d0-e19c3a4789b8', name: 'Corte + Barba', duration: 40, price: 75 },
  { id: '0d969102-ddf1-4256-b890-68536c0b581a', name: 'Progressiva', duration: 30, price: 60 },
  { id: 'ec53b00a-4fbe-4c62-94e7-99deb5377801', name: 'Corte + Barba + Sobrancelha', duration: 45, price: 85 },
  { id: '0f7fa71e-cf1f-48ca-95f0-a3e4c09c9c2b', name: 'Sobrancelha', duration: 5, price: 20 },
];

const CUSTOMERS = [
  { name: 'Lucas Ferreira', phone: '+5511987651234' },
  { name: 'Pedro Oliveira', phone: '+5511976543210' },
  { name: 'Rafael Costa', phone: '+5511965432109' },
  { name: 'Bruno Lima', phone: '+5511954321098' },
  { name: 'Thiago Martins', phone: '+5511943210987' },
  { name: 'Gabriel Rocha', phone: '+5511932109876' },
  { name: 'Felipe Cardoso', phone: '+5511921098765' },
  { name: 'Mateus Ribeiro', phone: '+5511910987654' },
  { name: 'André Souza', phone: '+5511998765432' },
  { name: 'Carlos Mendes', phone: '+5511987654321' },
];

const PAYMENT_METHODS = ['pix', 'dinheiro', 'cartao_debito', 'cartao_credito'];

function generateWeekAppointments() {
  const appointments = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0=Sun

  // Generate for the past 6 days + today
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);

    // Skip Sunday (except today)
    if (date.getDay() === 0 && daysAgo !== 0) continue;

    // 5-8 appointments per day
    const count = 5 + Math.floor(Math.random() * 4);
    let hour = 9;
    let minute = 0;

    for (let i = 0; i < count; i++) {
      const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
      const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
      const paymentMethod = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];

      const startTime = new Date(date);
      startTime.setHours(hour, minute, 0, 0);
      const endTime = new Date(startTime.getTime() + service.duration * 60 * 1000);

      // Today: mix of completed and scheduled. Past days: all completed.
      const isToday = daysAgo === 0;
      let status;
      if (isToday) {
        if (startTime.getTime() < Date.now()) {
          status = i === 0 ? 'cancelled' : 'completed';
        } else {
          status = 'scheduled';
        }
      } else {
        status = Math.random() > 0.1 ? 'completed' : 'cancelled';
      }

      appointments.push({
        appointmentId: uuidv4(),
        barberId: BARBER_ID,
        customerName: customer.name,
        customerPhone: customer.phone,
        service: service.id,
        startTime: startTime.getTime(),
        endTime: endTime.getTime(),
        status,
        paymentMethod: status === 'completed' ? paymentMethod : undefined,
        paidAmount: status === 'completed' ? service.price : undefined,
        notes: '',
        createdAt: Date.now(),
      });

      // Advance time
      minute += service.duration + 10;
      if (minute >= 60) {
        hour += Math.floor(minute / 60);
        minute = minute % 60;
      }
      if (hour === 13) { hour = 14; minute = 0; }
      if (hour >= 20) break;
    }
  }

  return appointments;
}

function generateWeekTransactions(appointments) {
  const SERVICE_NAMES = {
    '5d0791eb-06e6-4dab-8918-7aef0dacfb4b': 'Corte',
    'da18da28-4af3-4571-9c82-11c953e6d0c4': 'Barba',
    '6ff97218-4ef0-4ff6-92d0-e19c3a4789b8': 'Corte + Barba',
    '0d969102-ddf1-4256-b890-68536c0b581a': 'Progressiva',
    'ec53b00a-4fbe-4c62-94e7-99deb5377801': 'Corte + Barba + Sobrancelha',
    '0f7fa71e-cf1f-48ca-95f0-a3e4c09c9c2b': 'Sobrancelha',
  };

  return appointments
    .filter(a => a.status === 'completed' && a.paidAmount)
    .map(a => ({
      transactionId: uuidv4(),
      date: new Date(a.startTime).toISOString().split('T')[0],
      type: 'revenue',
      amount: a.paidAmount,
      category: 'servico',
      description: a.customerName,
      serviceName: SERVICE_NAMES[a.service] || 'Serviço',
      barberName: 'Miguel Castilho',
      barberId: a.barberId,
      appointmentId: a.appointmentId,
      paymentMethod: a.paymentMethod || 'dinheiro',
      createdAt: new Date().toISOString(),
    }));
}

// Generate once and export both
const weekAppointments = generateWeekAppointments();
const weekTransactions = generateWeekTransactions(weekAppointments);

module.exports = {
  generateTodayAppointments: () => weekAppointments,
  generateTodayTransactions: () => weekTransactions,
};
