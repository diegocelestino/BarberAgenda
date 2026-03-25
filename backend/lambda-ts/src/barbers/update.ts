import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const tableName = process.env.BARBERS_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const barberId = event.pathParameters?.barberId;
    if (!barberId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'barberId is required' }),
      };
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
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'No fields to update' }),
      };
    }

    await client.send(new UpdateItemCommand({
      TableName: tableName,
      Key: { barberId: { S: barberId } },
      UpdateExpression: `SET ${updates.join(', ')}`,
      ExpressionAttributeValues: values,
      ExpressionAttributeNames: Object.keys(names).length > 0 ? names : undefined,
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Barber updated successfully' }),
    };
  } catch (error) {
    console.error('Error updating barber:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
