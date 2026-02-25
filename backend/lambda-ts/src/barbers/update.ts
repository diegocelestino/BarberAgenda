import { APIGatewayProxyHandler } from 'aws-lambda';
import { GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
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

    const existing = unmarshall(result.Item);
    const updates = JSON.parse(event.body ?? '{}');

    const updatedBarber = {
      ...existing,
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.serviceIds !== undefined && { serviceIds: updates.serviceIds }),
      ...(updates.rating !== undefined && { rating: updates.rating }),
      ...(updates.photoUrl !== undefined && { photoUrl: updates.photoUrl }),
      ...(updates.schedule !== undefined && { schedule: updates.schedule }),
    };

    await dynamo.send(new PutItemCommand({ TableName: TABLE, Item: marshall(updatedBarber) }));

    return ok({ message: 'Barber updated successfully', barber: updatedBarber });
  } catch (e: any) {
    return error(500, `Failed to update barber: ${e.message}`);
  }
};
