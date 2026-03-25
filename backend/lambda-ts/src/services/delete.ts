import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
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

    await dynamo.send(new DeleteItemCommand({
      TableName: tableName,
      Key: { serviceId: { S: serviceId } },
    }));

    return ok({ message: 'Service deleted successfully' });
  } catch (err) {
    console.error('Error deleting service:', err);
    return error(500, 'Internal server error');
  }
};
