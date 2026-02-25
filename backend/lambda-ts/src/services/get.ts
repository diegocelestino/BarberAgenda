import { APIGatewayProxyHandler } from 'aws-lambda';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const TABLE = process.env.SERVICES_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const serviceId = event.pathParameters?.serviceId;
    if (!serviceId) return error(400, 'serviceId is required');

    const result = await dynamo.send(new GetItemCommand({
      TableName: TABLE,
      Key: marshall({ serviceId }),
    }));

    if (!result.Item) return error(404, 'Service not found');

    return ok(unmarshall(result.Item));
  } catch (e: any) {
    return error(500, `Failed to retrieve service: ${e.message}`);
  }
};
