import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { dynamo } from '../utils/dynamodb';
import { created, error } from '../utils/response';

const tableName = process.env.APPOINTMENTS_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const barberId = event.pathParameters?.barberId;
    if (!barberId) {
      return error(400, 'barberId is required');
    }

    const body = JSON.parse(event.body || '{}');
    const { customerName, customerPhone, service, serviceId, startTime, endTime, notes } = body;

    const serviceValue = service || serviceId;
    if (!customerName || !customerPhone || !serviceValue || !startTime || !endTime) {
      return error(400, 'customerName, customerPhone, service, startTime, and endTime are required');
    }

    const appointment = {
      barberId,
      appointmentId: randomUUID(),
      customerName,
      customerPhone,
      service: serviceValue,
      startTime,
      endTime,
      notes: notes || '',
      status: 'scheduled',
      createdAt: Date.now(),
    };

    await dynamo.send(new PutItemCommand({
      TableName: tableName,
      Item: marshall(appointment),
    }));

    return created({ appointment });
  } catch (err) {
    console.error('Error creating appointment:', err);
    return error(500, 'Internal server error');
  }
};
