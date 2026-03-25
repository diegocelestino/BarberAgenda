import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
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

    await dynamo.send(new DeleteItemCommand({
      TableName: tableName,
      Key: { barberId: { S: barberId } },
    }));

    return ok({ message: 'Barber deleted successfully' });
  } catch (err) {
    console.error('Error deleting barber:', err);
    return error(500, 'Internal server error');
  }
};
