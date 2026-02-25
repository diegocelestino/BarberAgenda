import { APIGatewayProxyHandler } from 'aws-lambda';
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const TABLE = process.env.SERVICES_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const serviceId = event.pathParameters?.serviceId;
    if (!serviceId) return error(400, 'serviceId is required');

    const body = JSON.parse(event.body ?? '{}');
    const fields: Record<string, string> = {
      title: 'title', description: 'description',
      price: 'price', duration: 'duration', durationMinutes: 'durationMinutes',
    };

    const setParts: string[] = [];
    const exprNames: Record<string, string> = { '#n': 'name' };
    const exprValues: Record<string, unknown> = {};

    if (body.name !== undefined) {
      setParts.push('#n = :name');
      exprValues[':name'] = body.name;
    }
    for (const [key, attr] of Object.entries(fields)) {
      if (body[key] !== undefined) {
        setParts.push(`${attr} = :${key}`);
        exprValues[`:${key}`] = body[key];
      }
    }

    if (setParts.length === 0) return error(400, 'No valid fields to update');

    const result = await dynamo.send(new UpdateItemCommand({
      TableName: TABLE,
      Key: marshall({ serviceId }),
      UpdateExpression: `SET ${setParts.join(', ')}`,
      ExpressionAttributeNames: exprNames,
      ExpressionAttributeValues: marshall(exprValues),
      ReturnValues: 'ALL_NEW',
    }));

    return ok(unmarshall(result.Attributes!));
  } catch (e: any) {
    return error(500, `Failed to update service: ${e.message}`);
  }
};
