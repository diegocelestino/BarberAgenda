/**
 * Business Hours and Scheduling Configuration
 * 
 * Customize your barbershop's operating hours and appointment settings here.
 */

export const BUSINESS_HOURS = {
  /**
   * Opening hour (24-hour format)
   * Example: 9 = 9:00 AM, 8 = 8:00 AM
   */
  START_HOUR: 9,

  /**
   * Closing hour (24-hour format)
   * Example: 17 = 5:00 PM, 18 = 6:00 PM
   * Note: Last appointment slot will be 30 minutes before this time
   */
  END_HOUR: 17,

  /**
   * Appointment slot interval in minutes
   * Example: 30 = 30-minute slots, 15 = 15-minute slots, 60 = 1-hour slots
   */
  SLOT_INTERVAL_MINUTES: 30,

  /**
   * Days of the week the business is open (0 = Sunday, 6 = Saturday)
   * Example: [1, 2, 3, 4, 5] = Monday to Friday
   * Example: [0, 1, 2, 3, 4, 5, 6] = All week
   */
  OPEN_DAYS: [1, 2, 3, 4, 5, 6], // Monday to Saturday

  /**
   * How many days in advance customers can book
   * Example: 60 = 2 months, 30 = 1 month
   */
  MAX_BOOKING_DAYS_AHEAD: 60,
};

/**
 * Generate time slots based on configuration
 */
export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  const { START_HOUR, END_HOUR, SLOT_INTERVAL_MINUTES } = BUSINESS_HOURS;

  // Calculate total minutes in the day
  const startMinutes = START_HOUR * 60;
  const endMinutes = END_HOUR * 60;

  // Generate slots
  for (let minutes = startMinutes; minutes < endMinutes; minutes += SLOT_INTERVAL_MINUTES) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
  }

  return slots;
};

/**
 * Check if a date is within business days
 */
export const isBusinessDay = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  return BUSINESS_HOURS.OPEN_DAYS.includes(dayOfWeek);
};

/**
 * Get the maximum date that can be booked
 */
export const getMaxBookingDate = (): Date => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + BUSINESS_HOURS.MAX_BOOKING_DAYS_AHEAD);
  return maxDate;
};
