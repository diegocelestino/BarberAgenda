import { APIGatewayProxyHandler } from 'aws-lambda';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';
import { dynamo } from '../utils/dynamodb';
import { created, error } from '../utils/response';

const TABLE = process.env.APPOINTMENTS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const barberId = event.pathParameters?.barberId;
    if (!barberId) return error(400, 'barberId is required');

    const body = JSON.parse(event.body ?? '{}');

    const appointment = {
      appointmentId: randomUUID(),
      barberId,
      customerName: body.customerName,
      ...(body.customerPhone !== undefined && { customerPhone: body.customerPhone }),
      startTime: body.startTime,
      endTime: body.endTime,
      ...(body.service !== undefined && { service: body.service }),
      ...(body.notes !== undefined && { notes: body.notes }),
      status: 'scheduled',
      createdAt: Date.now(),
    };

    await dynamo.send(new PutItemCommand({ TableName: TABLE, Item: marshall(appointment) }));

    return created({ appointment });
  } catch (e: any) {
    return error(500, `Failed to create appointment: ${e.message}`);
  }
};
