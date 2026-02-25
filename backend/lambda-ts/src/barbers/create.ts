import { APIGatewayProxyHandler } from 'aws-lambda';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';
import { dynamo } from '../utils/dynamodb';
import { created, error } from '../utils/response';

const TABLE = process.env.BARBERS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body ?? '{}');
    if (!body.name) return error(400, 'Name is required');

    const barber = {
      barberId: randomUUID(),
      name: body.name,
      serviceIds: body.serviceIds ?? [],
      rating: body.rating ?? 0,
      photoUrl: body.photoUrl ?? '',
      createdAt: Date.now(),
    };

    await dynamo.send(new PutItemCommand({ TableName: TABLE, Item: marshall(barber) }));

    return created({ message: 'Barber created successfully', barber });
  } catch (e: any) {
    return error(500, `Failed to create barber: ${e.message}`);
  }
};
