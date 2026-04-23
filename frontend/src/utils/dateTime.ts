/**
 * Centralized date/time utilities for the Barbershop application
 * All dates are handled in Brazil timezone (America/Sao_Paulo, UTC-3)
 */

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';
const BRAZIL_LOCALE = 'pt-BR';

/**
 * Get current timestamp
 */
export const now = (): number => Date.now();

/**
 * Parse a date string (YYYY-MM-DD) in Brazil timezone to timestamp
 */
export const parseDate = (dateStr: string): number => {
  const date = new Date(dateStr + 'T00:00:00-03:00');
  return date.getTime();
};

/**
 * Parse a date and time string in Brazil timezone to timestamp
 * @param dateStr - Date in format YYYY-MM-DD
 * @param timeStr - Time in format HH:mm
 */
export const parseDateTime = (dateStr: string, timeStr: string): number => {
  const dateTimeString = `${dateStr}T${timeStr}:00-03:00`;
  const date = new Date(dateTimeString);
  return date.getTime();
};

/**
 * Parse a datetime-local input value (YYYY-MM-DDTHH:mm) in Brazil timezone to timestamp
 */
export const parseDateTimeLocal = (dateTimeStr: string): number => {
  const dateTimeString = dateTimeStr + ':00-03:00';
  const date = new Date(dateTimeString);
  return date.getTime();
};

/**
 * Format timestamp to Brazil timezone date string (YYYY-MM-DD)
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format timestamp to datetime-local input value (YYYY-MM-DDTHH:mm) in Brazil timezone
 */
export const formatDateTimeLocal = (timestamp: number): string => {
  const date = new Date(timestamp);
  const brazilDate = new Date(date.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }));
  
  const year = brazilDate.getFullYear();
  const month = String(brazilDate.getMonth() + 1).padStart(2, '0');
  const day = String(brazilDate.getDate()).padStart(2, '0');
  const hours = String(brazilDate.getHours()).padStart(2, '0');
  const minutes = String(brazilDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Format timestamp for display in Brazil locale
 */
export const formatDateTimeDisplay = (timestamp: number, options?: Intl.DateTimeFormatOptions): string => {
  const date = new Date(timestamp);
  return date.toLocaleString(BRAZIL_LOCALE, options);
};

/**
 * Format timestamp to short date (e.g., "15 de abr")
 */
export const formatShortDate = (timestamp: number): string => {
  return formatDateTimeDisplay(timestamp, {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format timestamp to short date and time (e.g., "15 de abr, 14:30")
 */
export const formatShortDateTime = (timestamp: number): string => {
  return formatDateTimeDisplay(timestamp, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Format timestamp to full date (e.g., "15/04/2026")
 */
export const formatFullDate = (timestamp: number): string => {
  return formatDateTimeDisplay(timestamp, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Format timestamp to long date with weekday (e.g., "segunda-feira, 15 de abril")
 */
export const formatLongDate = (timestamp: number): string => {
  return formatDateTimeDisplay(timestamp, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
};

/**
 * Format timestamp to time only (e.g., "14:30")
 */
export const formatTime = (timestamp: number): string => {
  return formatDateTimeDisplay(timestamp, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate duration in minutes between two timestamps
 */
export const getDurationMinutes = (startTime: number, endTime: number): number => {
  return Math.round((endTime - startTime) / (1000 * 60));
};

/**
 * Format duration for display (e.g., "30 min")
 */
export const formatDuration = (startTime: number, endTime: number): string => {
  const minutes = getDurationMinutes(startTime, endTime);
  return `${minutes} min`;
};

/**
 * Add minutes to a timestamp
 */
export const addMinutes = (timestamp: number, minutes: number): number => {
  return timestamp + minutes * 60 * 1000;
};

/**
 * Add days to a timestamp
 */
export const addDays = (timestamp: number, days: number): number => {
  return timestamp + days * 24 * 60 * 60 * 1000;
};

/**
 * Get start of day (00:00:00) for a timestamp in Brazil timezone
 */
export const startOfDay = (timestamp: number): number => {
  const date = new Date(timestamp);
  const brazilDate = new Date(date.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }));
  brazilDate.setHours(0, 0, 0, 0);
  return brazilDate.getTime();
};

/**
 * Get end of day (23:59:59.999) for a timestamp in Brazil timezone
 */
export const endOfDay = (timestamp: number): number => {
  const date = new Date(timestamp);
  const brazilDate = new Date(date.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE }));
  brazilDate.setHours(23, 59, 59, 999);
  return brazilDate.getTime();
};

/**
 * Get week bounds (Sunday to Saturday) for a given date
 */
export const getWeekBounds = (timestamp: number): { startOfWeek: number; endOfWeek: number } => {
  const date = new Date(timestamp);
  const dayOfWeek = date.getDay();
  
  // Start of week (Sunday at 00:00:00)
  const startOfWeekDate = new Date(date);
  startOfWeekDate.setDate(date.getDate() - dayOfWeek);
  startOfWeekDate.setHours(0, 0, 0, 0);
  
  // End of week (Saturday at 23:59:59)
  const endOfWeekDate = new Date(startOfWeekDate);
  endOfWeekDate.setDate(startOfWeekDate.getDate() + 6);
  endOfWeekDate.setHours(23, 59, 59, 999);
  
  return {
    startOfWeek: startOfWeekDate.getTime(),
    endOfWeek: endOfWeekDate.getTime(),
  };
};

/**
 * Check if a timestamp is today
 */
export const isToday = (timestamp: number): boolean => {
  const nowTimestamp = now();
  return startOfDay(timestamp) === startOfDay(nowTimestamp);
};

/**
 * Check if a timestamp is in the past
 */
export const isPast = (timestamp: number): boolean => {
  return timestamp < now();
};

/**
 * Check if a timestamp is in the future
 */
export const isFuture = (timestamp: number): boolean => {
  return timestamp > now();
};

/**
 * Get today's date string (YYYY-MM-DD)
 */
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get current datetime-local string (YYYY-MM-DDTHH:mm) in Brazil timezone
 */
export const getCurrentDateTimeLocal = (): string => {
  return formatDateTimeLocal(now());
};

/**
 * Get max booking date (e.g., 60 days from now)
 */
export const getMaxBookingDate = (daysAhead: number = 60): Date => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + daysAhead);
  return maxDate;
};

/**
 * Check if should disable today for booking (within 1 hour of closing time)
 */
export const shouldDisableTodayForBooking = (closeTime: string): boolean => {
  const nowDate = new Date();
  const [closeH, closeM] = closeTime.split(':').map(Number);
  const closingTime = new Date(nowDate);
  closingTime.setHours(closeH, closeM, 0, 0);
  
  const oneHourBeforeClose = closingTime.getTime() - 60 * 60 * 1000;
  return nowDate.getTime() >= oneHourBeforeClose;
};
