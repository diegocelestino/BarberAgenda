import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
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

    const body = JSON.parse(event.body || '{}');
    const { name, serviceIds, rating, photoUrl, schedule } = body;

    const updates: string[] = [];
    const values: Record<string, any> = {};
    const names: Record<string, string> = {};

    if (name) {
      updates.push('#name = :name');
      values[':name'] = { S: name };
      names['#name'] = 'name';
    }
    if (serviceIds) {
      updates.push('serviceIds = :serviceIds');
      values[':serviceIds'] = { L: serviceIds.map((s: string) => ({ S: s })) };
    }
    if (rating !== undefined) {
      updates.push('rating = :rating');
      values[':rating'] = { N: rating.toString() };
    }
    if (photoUrl !== undefined) {
      updates.push('photoUrl = :photoUrl');
      values[':photoUrl'] = { S: photoUrl };
    }
    if (schedule !== undefined) {
      updates.push('schedule = :schedule');
      values[':schedule'] = schedule ? { M: marshall(schedule) } : { NULL: true };
    }

    if (updates.length === 0) {
      return error(400, 'No fields to update');
    }

    await dynamo.send(new UpdateItemCommand({
      TableName: tableName,
      Key: { barberId: { S: barberId } },
      UpdateExpression: `SET ${updates.join(', ')}`,
      ExpressionAttributeValues: values,
      ExpressionAttributeNames: Object.keys(names).length > 0 ? names : undefined,
    }));

    return ok({ barber: { barberId, ...body } });
  } catch (err) {
    console.error('Error updating barber:', err);
    return error(500, 'Internal server error');
  }
};
