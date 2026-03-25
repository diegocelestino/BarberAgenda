import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { dynamo } from '../utils/dynamodb';
import { created, error } from '../utils/response';

const tableName = process.env.BARBERS_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { name, email, phone, specialties } = body;

    if (!name) {
      return error(400, 'name is required');
    }

    const barber = {
      barberId: randomUUID(),
      name,
      serviceIds: body.serviceIds || [],
      rating: body.rating || 5,
      photoUrl: body.photoUrl || '',
      schedule: body.schedule || null,
      createdAt: Date.now(),
    };

    await dynamo.send(new PutItemCommand({
      TableName: tableName,
      Item: marshall(barber),
    }));

    return created({ barber });
  } catch (err) {
    console.error('Error creating barber:', err);
    return error(500, 'Internal server error');
  }
};
