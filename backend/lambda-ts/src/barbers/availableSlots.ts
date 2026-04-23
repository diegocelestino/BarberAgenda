import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const barbersTable = process.env.BARBERS_TABLE!;
const appointmentsTable = process.env.APPOINTMENTS_TABLE!;

interface BarberSchedule {
  openTime: string;
  closeTime: string;
  lunchStart?: string;
  lunchEnd?: string;
  workDays: number[];
  slotInterval: number;
}

interface Appointment {
  appointmentId: string;
  barberId: string;
  startTime: number;
  endTime: number;
  status: string;
}

/**
 * Generate time slots from barber schedule
 */
const generateTimeSlots = (schedule: BarberSchedule): string[] => {
  const slots: string[] = [];

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
  } catch (err) {
    console.error('Error generating time slots:', err);
  }

  return slots;
};

/**
 * Get available time slots for a barber on a specific date
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const barberId = event.pathParameters?.barberId;
    const date = event.queryStringParameters?.date;
    const duration = event.queryStringParameters?.duration;

    console.log('GET /barbers/:barberId/available-slots', { barberId, date, duration });

    // Validate required parameters
    if (!barberId) {
      return error(400, 'barberId is required');
    }

    if (!date) {
      return error(400, 'date parameter is required (ISO date string YYYY-MM-DD)');
    }

    if (!duration) {
      return error(400, 'duration parameter is required (minutes)');
    }

    // Get barber from DynamoDB
    const barberResult = await dynamo.send(
      new QueryCommand({
        TableName: barbersTable,
        KeyConditionExpression: 'barberId = :barberId',
        ExpressionAttributeValues: {
          ':barberId': { S: barberId },
        },
        Limit: 1,
      })
    );

    if (!barberResult.Items || barberResult.Items.length === 0) {
      return error(404, 'Barber not found');
    }

    const barber = unmarshall(barberResult.Items[0]);

    // Get barber schedule with defaults
    const schedule: BarberSchedule = barber.schedule || {
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
      return ok({
        slots: [],
        date,
        barberId,
        message: 'Barber does not work on this day',
      });
    }

    // Generate all possible time slots
    const allSlots = generateTimeSlots(schedule);

    if (allSlots.length === 0) {
      return ok({
        slots: [],
        date,
        barberId,
        message: 'No time slots available - check barber schedule configuration',
      });
    }

    // Get appointments for this barber on this date
    const dayStart = requestedDate.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const appointmentsResult = await dynamo.send(
      new QueryCommand({
        TableName: appointmentsTable,
        KeyConditionExpression: 'barberId = :barberId',
        FilterExpression: 'startTime >= :dayStart AND startTime < :dayEnd AND #status <> :cancelled',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':barberId': { S: barberId },
          ':dayStart': { N: dayStart.toString() },
          ':dayEnd': { N: dayEnd.toString() },
          ':cancelled': { S: 'cancelled' },
        },
      })
    );

    const dayAppointments: Appointment[] = appointmentsResult.Items?.map((item) => unmarshall(item) as Appointment) || [];

    // Merge overlapping appointments
    const mergedAppointments: Appointment[] = [];
    dayAppointments.forEach((apt) => {
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

    const availableSlots = allSlots.filter((timeSlot) => {
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
      const hasConflict = mergedAppointments.some((apt) => {
        return slotStart < apt.endTime && slotEnd > apt.startTime;
      });

      return !hasConflict;
    });

    return ok({
      slots: availableSlots,
      date,
      barberId,
      totalSlots: allSlots.length,
      availableCount: availableSlots.length,
      bookedCount: allSlots.length - availableSlots.length,
    });
  } catch (err) {
    console.error('Error getting available slots:', err);
    return error(500, 'Internal server error');
  }
};
