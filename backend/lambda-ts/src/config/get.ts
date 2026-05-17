import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../shared/db/client';
import { ok, error } from '../utils/response';

const tableName = process.env.CONFIG_TABLE!;

const DEFAULTS = {
  shop: {
    name: 'Barbearia',
    address: '',
    phone: '',
    whatsapp: '',
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
    reminderHoursBefore: 24,
    cancellationHoursBefore: 2,
  },
  system: {
    timezone: 'America/Sao_Paulo',
    locale: 'pt-BR',
    currency: 'BRL',
  },
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Try to load from DynamoDB
    const result = await docClient.send(new GetCommand({
      TableName: tableName,
      Key: { configId: 'main' },
    }));

    const stored = result.Item || {};
    // Merge stored over defaults
    const config = Object.keys(DEFAULTS).reduce((acc, key) => {
      acc[key] = { ...(DEFAULTS as any)[key], ...(stored[key] || {}) };
      return acc;
    }, {} as any);

    return ok(config);
  } catch (err) {
    // If table doesn't exist yet or any error, return defaults
    console.error('Error reading config, returning defaults:', err);
    return ok(DEFAULTS);
  }
};
