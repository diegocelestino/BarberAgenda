import { APIGatewayProxyHandler } from 'aws-lambda';
import { GetItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const TABLE = process.env.BARBERS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const barberId = event.pathParameters?.barberId;
    if (!barberId) return error(400, 'barberId is required');

    const result = await dynamo.send(new GetItemCommand({
      TableName: TABLE,
      Key: marshall({ barberId }),
    }));
    if (!result.Item) return error(404, 'Barber not found');

    await dynamo.send(new DeleteItemCommand({ TableName: TABLE, Key: marshall({ barberId }) }));

    return ok({ message: 'Barber deleted successfully' });
  } catch (e: any) {
    return error(500, `Failed to delete barber: ${e.message}`);
  }
};
