import { APIGatewayProxyHandler } from 'aws-lambda';
import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const TABLE = process.env.APPOINTMENTS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { barberId, appointmentId } = event.pathParameters ?? {};
    if (!barberId || !appointmentId) return error(400, 'barberId and appointmentId are required');

    await dynamo.send(new DeleteItemCommand({
      TableName: TABLE,
      Key: marshall({ barberId, appointmentId }),
    }));

    return ok({ message: 'Appointment deleted successfully' });
  } catch (e: any) {
    return error(500, `Failed to delete appointment: ${e.message}`);
  }
};
