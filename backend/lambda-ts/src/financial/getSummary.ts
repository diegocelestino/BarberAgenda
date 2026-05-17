import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../shared/db/client';
import { withErrorHandler } from '../shared/middleware/withErrorHandler';
import { ok, error } from '../utils/response';

const tableName = process.env.TRANSACTIONS_TABLE!;

export const handler = withErrorHandler(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { startDate, endDate } = event.queryStringParameters || {};
  if (!startDate || !endDate) return error(400, 'startDate and endDate are required');

  const result = await docClient.send(new ScanCommand({
    TableName: tableName,
    FilterExpression: '#d BETWEEN :start AND :end',
    ExpressionAttributeNames: { '#d': 'date' },
    ExpressionAttributeValues: { ':start': startDate, ':end': endDate },
  }));

  const items = result.Items || [];
  const revenue = items.filter((t: any) => t.type === 'revenue').reduce((sum: number, t: any) => sum + t.amount, 0);
  const expenses = items.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + t.amount, 0);
  const commissionsPaid = items.filter((t: any) => t.type === 'commission_payment').reduce((sum: number, t: any) => sum + t.amount, 0);

  return ok({
    summary: {
      startDate,
      endDate,
      revenue,
      expenses,
      commissionsPaid,
      profit: revenue - expenses - commissionsPaid,
      transactionCount: items.length,
    },
  });
});
