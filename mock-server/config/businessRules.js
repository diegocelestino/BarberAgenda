/**
 * Business rules configuration for the Barbershop application.
 * Mutable at runtime via PUT /config.
 */

let config = {
  shop: {
    name: 'Barbearia do Miguel',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    phone: '+5511949803682',
    whatsapp: '+5511949803682',
  },
  booking: {
    minAdvanceTimeMinutes: 60,
    maxBookingDaysAhead: 60,
    defaultSlotIntervalMinutes: 30,
    allowSameDayBooking: true,
    requirePhoneNumber: false,
  },
  defaultSchedule: {
    openTime: '09:00',
    closeTime: '20:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
    workDays: [1, 2, 3, 4, 5, 6],
    slotInterval: 30,
  },
  loyalty: {
    pointsPerReal: 1,
    pointsForReward: 500,
    rewardDescription: '1 serviço grátis (Barba)',
  },
  appointment: {
    allowWalkIns: true,
    autoCompleteAfterEndTime: false,
    reminderHoursBefore: 24,
    cancellationHoursBefore: 2,
  },
  system: {
    timezone: 'America/Sao_Paulo',
    locale: 'pt-BR',
    currency: 'BRL',
  },
};

const getConfig = () => config;

const updateConfig = (updates) => {
  config = { ...config, ...updates };
  // Merge nested objects
  Object.keys(updates).forEach((key) => {
    if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
      config[key] = { ...config[key], ...updates[key] };
    }
  });
  return config;
};

module.exports = { getConfig, updateConfig };
