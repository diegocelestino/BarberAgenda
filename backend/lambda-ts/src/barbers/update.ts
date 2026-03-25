import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
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
    const { name, email, phone, specialties } = body;

    const updates: string[] = [];
    const values: Record<string, any> = {};
    const names: Record<string, string> = {};

    if (name) {
      updates.push('#name = :name');
      values[':name'] = { S: name };
      names['#name'] = 'name';
    }
    if (email !== undefined) {
      updates.push('email = :email');
      values[':email'] = { S: email };
    }
    if (phone !== undefined) {
      updates.push('phone = :phone');
      values[':phone'] = { S: phone };
    }
    if (specialties) {
      updates.push('specialties = :specialties');
      values[':specialties'] = { L: specialties.map((s: string) => ({ S: s })) };
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

    return ok({ message: 'Barber updated successfully' });
  } catch (err) {
    console.error('Error updating barber:', err);
    return error(500, 'Internal server error');
  }
};
