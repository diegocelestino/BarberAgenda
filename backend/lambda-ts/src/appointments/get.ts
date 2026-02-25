import { APIGatewayProxyHandler } from 'aws-lambda';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const TABLE = process.env.APPOINTMENTS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { barberId, appointmentId } = event.pathParameters ?? {};
    if (!barberId || !appointmentId) return error(400, 'barberId and appointmentId are required');

    const result = await dynamo.send(new GetItemCommand({
      TableName: TABLE,
      Key: marshall({ barberId, appointmentId }),
    }));

    if (!result.Item) return error(404, 'Appointment not found');

    return ok({ appointment: unmarshall(result.Item) });
  } catch (e: any) {
    return error(500, `Failed to retrieve appointment: ${e.message}`);
  }
};
