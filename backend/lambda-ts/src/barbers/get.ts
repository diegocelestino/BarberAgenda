import { APIGatewayProxyHandler } from 'aws-lambda';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
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

    return ok({ barber: unmarshall(result.Item) });
  } catch (e: any) {
    return error(500, `Failed to get barber: ${e.message}`);
  }
};
