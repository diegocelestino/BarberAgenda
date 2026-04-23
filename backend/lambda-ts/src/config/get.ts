import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok, error } from '../utils/response';

// Business rules configuration
// In production, this could be loaded from DynamoDB, S3, or Parameter Store
const businessRules = {
  booking: {
    minAdvanceTimeMinutes: 60,
    maxBookingDaysAhead: 60,
    defaultSlotIntervalMinutes: 30,
    allowSameDayBooking: true,
    requirePhoneNumber: false,
  },
  defaultSchedule: {
    openTime: '09:00',
    closeTime: '18:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    workDays: [1, 2, 3, 4, 5, 6],
    slotInterval: 30,
  },
  appointment: {
    allowWalkIns: true,
    autoCompleteAfterEndTime: false,
    reminderHoursBefore: 24,
    cancellationHoursBefore: 2,
  },
  service: {
    minDurationMinutes: 15,
    maxDurationMinutes: 240,
    defaultDurationMinutes: 30,
  },
  extract: {
    maxDateRangeDays: 365,
    defaultDateRangeDays: 30,
  },
  system: {
    timezone: 'America/Sao_Paulo',
    locale: 'pt-BR',
    currency: 'BRL',
  },
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const category = event.pathParameters?.category;
    
    if (category) {
      // Return specific category
      if (!(category in businessRules)) {
        return error(404, `Category '${category}' not found`);
      }
      return ok({ config: businessRules[category as keyof typeof businessRules] });
    }
    
    // Return all rules
    return ok({ config: businessRules });
  } catch (err) {
    console.error('Error getting business rules:', err);
    return error(500, 'Internal server error');
  }
};
