import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const tableName = process.env.SERVICES_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const serviceId = event.pathParameters?.serviceId;
    if (!serviceId) {
      return error(400, 'serviceId is required');
    }

    const body = JSON.parse(event.body || '{}');
    const { title, name, description, duration, durationMinutes, price } = body;

    const updates: string[] = [];
    const values: Record<string, any> = {};
    const names: Record<string, string> = {};

    const serviceName = title || name;
    if (serviceName) {
      updates.push('#title = :title, #name = :name');
      values[':title'] = { S: serviceName };
      values[':name'] = { S: serviceName };
      names['#title'] = 'title';
      names['#name'] = 'name';
    }
    if (description !== undefined) {
      updates.push('description = :description');
      values[':description'] = { S: description };
    }
    const serviceDuration = durationMinutes || duration;
    if (serviceDuration) {
      updates.push('duration = :duration, durationMinutes = :durationMinutes');
      values[':duration'] = { N: serviceDuration.toString() };
      values[':durationMinutes'] = { N: serviceDuration.toString() };
    }
    if (price) {
      updates.push('price = :price');
      values[':price'] = { N: price.toString() };
    }

    if (updates.length === 0) {
      return error(400, 'No fields to update');
    }

    await dynamo.send(new UpdateItemCommand({
      TableName: tableName,
      Key: { serviceId: { S: serviceId } },
      UpdateExpression: `SET ${updates.join(', ')}`,
      ExpressionAttributeValues: values,
      ExpressionAttributeNames: Object.keys(names).length > 0 ? names : undefined,
    }));

    return ok({ message: 'Service updated successfully' });
  } catch (err) {
    console.error('Error updating service:', err);
    return error(500, 'Internal server error');
  }
};
