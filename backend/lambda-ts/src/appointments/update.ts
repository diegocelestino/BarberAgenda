import { APIGatewayProxyHandler } from 'aws-lambda';
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const TABLE = process.env.APPOINTMENTS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { barberId, appointmentId } = event.pathParameters ?? {};
    if (!barberId || !appointmentId) return error(400, 'barberId and appointmentId are required');

    const body = JSON.parse(event.body ?? '{}');
    const updatableFields = ['customerName', 'customerPhone', 'startTime', 'endTime', 'service', 'notes'];
    const exprNames: Record<string, string> = { '#status': 'status' };
    const exprValues: Record<string, unknown> = {};
    const setParts: string[] = [];

    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        setParts.push(`${field} = :${field}`);
        exprValues[`:${field}`] = body[field];
      }
    }
    if (body.status !== undefined) {
      setParts.push('#status = :status');
      exprValues[':status'] = body.status;
    }

    if (setParts.length === 0) return error(400, 'No valid fields to update');

    const result = await dynamo.send(new UpdateItemCommand({
      TableName: TABLE,
      Key: marshall({ barberId, appointmentId }),
      UpdateExpression: `SET ${setParts.join(', ')}`,
      ExpressionAttributeNames: exprNames,
      ExpressionAttributeValues: marshall(exprValues),
      ReturnValues: 'ALL_NEW',
    }));

    return ok({ appointment: unmarshall(result.Attributes!) });
  } catch (e: any) {
    return error(500, `Failed to update appointment: ${e.message}`);
  }
};
