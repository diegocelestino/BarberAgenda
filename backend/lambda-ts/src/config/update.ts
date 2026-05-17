import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../shared/db/client';
import { withErrorHandler } from '../shared/middleware/withErrorHandler';
import { ok } from '../utils/response';

const tableName = process.env.CONFIG_TABLE!;

export const handler = withErrorHandler(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || '{}');

  // Get existing config
  const existing = await docClient.send(new GetCommand({
    TableName: tableName,
    Key: { configId: 'main' },
  }));

  // Merge updates over existing
  const current = existing.Item || { configId: 'main' };
  Object.keys(body).forEach((key) => {
    if (typeof body[key] === 'object' && !Array.isArray(body[key])) {
      current[key] = { ...(current[key] || {}), ...body[key] };
    } else {
      current[key] = body[key];
    }
  });

  await docClient.send(new PutCommand({ TableName: tableName, Item: current }));
  return ok(current);
});
