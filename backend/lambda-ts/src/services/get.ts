import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const tableName = process.env.SERVICES_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const serviceId = event.pathParameters?.serviceId;
    if (!serviceId) {
      return error(400, 'serviceId is required');
    }

    const result = await dynamo.send(new GetItemCommand({
      TableName: tableName,
      Key: { serviceId: { S: serviceId } },
    }));

    if (!result.Item) {
      return error(404, 'Service not found');
    }

    return ok(unmarshall(result.Item));
  } catch (err) {
    console.error('Error getting service:', err);
    return error(500, 'Internal server error');
  }
};
