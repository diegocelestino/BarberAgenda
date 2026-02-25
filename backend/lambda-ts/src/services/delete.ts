import { APIGatewayProxyHandler } from 'aws-lambda';
import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const TABLE = process.env.SERVICES_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const serviceId = event.pathParameters?.serviceId;
    if (!serviceId) return error(400, 'serviceId is required');

    await dynamo.send(new DeleteItemCommand({ TableName: TABLE, Key: marshall({ serviceId }) }));

    return ok({ message: 'Service deleted successfully' });
  } catch (e: any) {
    return error(500, `Failed to delete service: ${e.message}`);
  }
};
