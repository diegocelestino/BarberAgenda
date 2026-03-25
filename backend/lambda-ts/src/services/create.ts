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
    const { name, description, duration, price } = body;

    if (!name || !duration || !price) {
      return error(400, 'name, duration, and price are required');
    }

    const service = {
      serviceId: randomUUID(),
      name,
      description: description || '',
      duration,
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
