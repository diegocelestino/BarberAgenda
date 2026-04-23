import api from './api';

export interface BookingRules {
  minAdvanceTimeMinutes: number;
  maxBookingDaysAhead: number;
  defaultSlotIntervalMinutes: number;
  allowSameDayBooking: boolean;
  requirePhoneNumber: boolean;
}

export interface DefaultSchedule {
  openTime: string;
  closeTime: string;
  lunchStart: string;
  lunchEnd: string;
  workDays: number[];
  slotInterval: number;
}

export interface AppointmentRules {
  allowWalkIns: boolean;
  autoCompleteAfterEndTime: boolean;
  reminderHoursBefore: number;
  cancellationHoursBefore: number;
}

export interface ServiceRules {
  minDurationMinutes: number;
  maxDurationMinutes: number;
  defaultDurationMinutes: number;
}

export interface ExtractRules {
  maxDateRangeDays: number;
  defaultDateRangeDays: number;
}

export interface SystemSettings {
  timezone: string;
  locale: string;
  currency: string;
}

export interface BusinessRules {
  booking: BookingRules;
  defaultSchedule: DefaultSchedule;
  appointment: AppointmentRules;
  service: ServiceRules;
  extract: ExtractRules;
  system: SystemSettings;
}

// In-memory cache for business rules
let cachedRules: BusinessRules | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Config API functions
export const configApi = {
  // Get all business rules (with caching)
  getBusinessRules: async (forceRefresh: boolean = false): Promise<BusinessRules> => {
    const now = Date.now();
    
    // Return cached rules if available and not expired
    if (!forceRefresh && cachedRules && (now - cacheTimestamp) < CACHE_DURATION_MS) {
      return cachedRules;
    }
    
    const response = await api.get('/config/business-rules');
    const rules: BusinessRules = response.data.config;
    cachedRules = rules;
    cacheTimestamp = now;
    
    return rules;
  },

  // Get specific rule category
  getRuleCategory: async <K extends keyof BusinessRules>(category: K): Promise<BusinessRules[K]> => {
    const response = await api.get(`/config/business-rules/${category}`);
    return response.data.config;
  },

  // Clear cache (useful for testing or after config updates)
  clearCache: () => {
    cachedRules = null;
    cacheTimestamp = 0;
  },
};

// Helper functions to get specific rules
export const getBookingRules = async (): Promise<BookingRules> => {
  const rules = await configApi.getBusinessRules();
  return rules.booking;
};

export const getDefaultSchedule = async (): Promise<DefaultSchedule> => {
  const rules = await configApi.getBusinessRules();
  return rules.defaultSchedule;
};

export const getAppointmentRules = async (): Promise<AppointmentRules> => {
  const rules = await configApi.getBusinessRules();
  return rules.appointment;
};

export const getServiceRules = async (): Promise<ServiceRules> => {
  const rules = await configApi.getBusinessRules();
  return rules.service;
};

export const getExtractRules = async (): Promise<ExtractRules> => {
  const rules = await configApi.getBusinessRules();
  return rules.extract;
};

export const getSystemSettings = async (): Promise<SystemSettings> => {
  const rules = await configApi.getBusinessRules();
  return rules.system;
};
