import { APIGatewayProxyHandler } from 'aws-lambda';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';
import { dynamo } from '../utils/dynamodb';
import { created, error } from '../utils/response';

const TABLE = process.env.SERVICES_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body ?? '{}');

    const service = {
      serviceId: `service-${randomUUID()}`,
      title: body.title,
      name: body.name,
      ...(body.description !== undefined && { description: body.description }),
      price: body.price,
      duration: body.duration,
      durationMinutes: body.durationMinutes,
      createdAt: Date.now(),
    };

    await dynamo.send(new PutItemCommand({ TableName: TABLE, Item: marshall(service) }));

    return created(service);
  } catch (e: any) {
    return error(500, `Failed to create service: ${e.message}`);
  }
};
