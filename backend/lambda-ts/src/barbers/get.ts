import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const tableName = process.env.BARBERS_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const barberId = event.pathParameters?.barberId;
    if (!barberId) {
      return error(400, 'barberId is required');
    }

    const result = await dynamo.send(new GetItemCommand({
      TableName: tableName,
      Key: { barberId: { S: barberId } },
    }));

    if (!result.Item) {
      return error(404, 'Barber not found');
    }

    return ok({ barber: unmarshall(result.Item) });
  } catch (err) {
    console.error('Error getting barber:', err);
    return error(500, 'Internal server error');
  }
};
