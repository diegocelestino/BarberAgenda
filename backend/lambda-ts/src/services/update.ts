import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const tableName = process.env.SERVICES_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const serviceId = event.pathParameters?.serviceId;
    if (!serviceId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'serviceId is required' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { name, description, duration, price } = body;

    const updates: string[] = [];
    const values: Record<string, any> = {};
    const names: Record<string, string> = {};

    if (name) {
      updates.push('#name = :name');
      values[':name'] = { S: name };
      names['#name'] = 'name';
    }
    if (description !== undefined) {
      updates.push('description = :description');
      values[':description'] = { S: description };
    }
    if (duration) {
      updates.push('duration = :duration');
      values[':duration'] = { N: duration.toString() };
    }
    if (price) {
      updates.push('price = :price');
      values[':price'] = { N: price.toString() };
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
      Key: { serviceId: { S: serviceId } },
      UpdateExpression: `SET ${updates.join(', ')}`,
      ExpressionAttributeValues: values,
      ExpressionAttributeNames: Object.keys(names).length > 0 ? names : undefined,
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Service updated successfully' }),
    };
  } catch (error) {
    console.error('Error updating service:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
