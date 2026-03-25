import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { dynamo } from '../utils/dynamodb';
import { created, error } from '../utils/response';

const tableName = process.env.SERVICES_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { title, name, description, duration, durationMinutes, price } = body;

    const serviceName = title || name;
    const serviceDuration = durationMinutes || duration;

    if (!serviceName || !serviceDuration || !price) {
      return error(400, 'title/name, duration/durationMinutes, and price are required');
    }

    const service = {
      serviceId: randomUUID(),
      title: serviceName,
      name: serviceName,
      description: description || '',
      duration: serviceDuration,
      durationMinutes: serviceDuration,
      price,
      createdAt: Date.now(),
    };

    await dynamo.send(new PutItemCommand({
      TableName: tableName,
      Item: marshall(service),
    }));

    return created(service);
  } catch (err) {
    console.error('Error creating service:', err);
    return error(500, 'Internal server error');
  }
};
