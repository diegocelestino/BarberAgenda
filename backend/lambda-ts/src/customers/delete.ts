import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../shared/db/client';
import { withErrorHandler } from '../shared/middleware/withErrorHandler';
import { ok, error } from '../utils/response';

const tableName = process.env.CUSTOMERS_TABLE!;

export const handler = withErrorHandler(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const customerId = event.pathParameters?.customerId;
  if (!customerId) return error(400, 'customerId is required');

  await docClient.send(new DeleteCommand({ TableName: tableName, Key: { customerId } }));
  return ok({ message: 'Customer deleted' });
});
