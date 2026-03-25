import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const tableName = process.env.APPOINTMENTS_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const barberId = event.pathParameters?.barberId;
    if (!barberId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'barberId is required' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { customerName, customerPhone, serviceId, startTime, endTime } = body;

    if (!customerName || !customerPhone || !serviceId || !startTime || !endTime) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'customerName, customerPhone, serviceId, startTime, and endTime are required' }),
      };
    }

    const appointment = {
      barberId,
      appointmentId: randomUUID(),
      customerName,
      customerPhone,
      serviceId,
      startTime,
      endTime,
      status: 'scheduled',
      createdAt: Date.now(),
    };

    await client.send(new PutItemCommand({
      TableName: tableName,
      Item: marshall(appointment),
    }));

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
