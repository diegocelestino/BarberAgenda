/**
 * Business rules configuration for the Barbershop application
 * These rules can be modified without changing code
 */

module.exports = {
  // Booking rules
  booking: {
    // Minimum advance time required for booking (in minutes)
    minAdvanceTimeMinutes: 60,
    
    // Maximum days ahead that customers can book
    maxBookingDaysAhead: 60,
    
    // Default slot interval (in minutes)
    defaultSlotIntervalMinutes: 30,
    
    // Allow same-day bookings
    allowSameDayBooking: true,
    
    // Require phone number for bookings
    requirePhoneNumber: false,
  },
  
  // Default working hours (can be overridden per barber)
  defaultSchedule: {
    openTime: '09:00',
    closeTime: '18:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    workDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday (0=Sunday, 6=Saturday)
    slotInterval: 30,
  },
  
  // Appointment rules
  appointment: {
    // Allow walk-in appointments
    allowWalkIns: true,
    
    // Automatically mark appointments as completed after end time
    autoCompleteAfterEndTime: false,
    
    // Send reminder notifications (hours before appointment)
    reminderHoursBefore: 24,
    
    // Allow cancellation (hours before appointment)
    cancellationHoursBefore: 2,
  },
  
  // Service rules
  service: {
    // Minimum service duration (in minutes)
    minDurationMinutes: 15,
    
    // Maximum service duration (in minutes)
    maxDurationMinutes: 240,
    
    // Default service duration if not specified
    defaultDurationMinutes: 30,
  },
  
  // Extract/Report rules
  extract: {
    // Maximum date range for extracts (in days)
    maxDateRangeDays: 365,
    
    // Default date range (in days)
    defaultDateRangeDays: 30,
  },
  
  // System settings
  system: {
    // Timezone
    timezone: 'America/Sao_Paulo',
    
    // Locale
    locale: 'pt-BR',
    
    // Currency
    currency: 'BRL',
  },
};
