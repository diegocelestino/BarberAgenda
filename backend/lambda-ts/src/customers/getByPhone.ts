import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../shared/db/client';
import { withErrorHandler } from '../shared/middleware/withErrorHandler';
import { ok, error } from '../utils/response';

const tableName = process.env.CUSTOMERS_TABLE!;

export const handler = withErrorHandler(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const phone = event.pathParameters?.phone;
  if (!phone) return error(400, 'phone is required');

  const result = await docClient.send(new QueryCommand({
    TableName: tableName,
    IndexName: 'PhoneIndex',
    KeyConditionExpression: 'phone = :phone',
    ExpressionAttributeValues: { ':phone': phone },
    Limit: 1,
  }));

  const customer = result.Items?.[0] || null;
  return ok({ customer });
});
