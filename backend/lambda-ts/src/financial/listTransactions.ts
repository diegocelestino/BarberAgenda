import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../shared/db/client';
import { withErrorHandler } from '../shared/middleware/withErrorHandler';
import { ok, error } from '../utils/response';

const tableName = process.env.TRANSACTIONS_TABLE!;

export const handler = withErrorHandler(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { startDate, endDate, type, barberId } = event.queryStringParameters || {};

  if (!startDate || !endDate) return error(400, 'startDate and endDate are required');

  // If filtering by barber, use GSI
  if (barberId) {
    const result = await docClient.send(new QueryCommand({
      TableName: tableName,
      IndexName: 'BarberIndex',
      KeyConditionExpression: 'barberId = :barberId AND #d BETWEEN :start AND :end',
      ExpressionAttributeNames: { '#d': 'date' },
      ExpressionAttributeValues: { ':barberId': barberId, ':start': startDate, ':end': endDate },
    }));
    let items = result.Items || [];
    if (type) items = items.filter((t: any) => t.type === type);
    return ok({ transactions: items });
  }

  // Otherwise scan with date filter
  const result = await docClient.send(new ScanCommand({
    TableName: tableName,
    FilterExpression: '#d BETWEEN :start AND :end',
    ExpressionAttributeNames: { '#d': 'date' },
    ExpressionAttributeValues: { ':start': startDate, ':end': endDate },
  }));
  let items = result.Items || [];
  if (type) items = items.filter((t: any) => t.type === type);

  return ok({ transactions: items });
});
