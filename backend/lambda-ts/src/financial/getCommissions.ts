import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../shared/db/client';
import { withErrorHandler } from '../shared/middleware/withErrorHandler';
import { ok, error } from '../utils/response';

const transactionsTable = process.env.TRANSACTIONS_TABLE!;
const barbersTable = process.env.BARBERS_TABLE!;

export const handler = withErrorHandler(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { barberId, startDate, endDate } = event.queryStringParameters || {};
  if (!barberId || !startDate || !endDate) return error(400, 'barberId, startDate, and endDate are required');

  // Get barber's commission percentage
  const barberResult = await docClient.send(new GetCommand({ TableName: barbersTable, Key: { barberId } }));
  const commissionPercentage = barberResult.Item?.commissionPercentage || 0;

  // Get revenue transactions for this barber in period
  const result = await docClient.send(new QueryCommand({
    TableName: transactionsTable,
    IndexName: 'BarberIndex',
    KeyConditionExpression: 'barberId = :barberId AND #d BETWEEN :start AND :end',
    ExpressionAttributeNames: { '#d': 'date' },
    ExpressionAttributeValues: { ':barberId': barberId, ':start': startDate, ':end': endDate },
  }));

  const items = result.Items || [];
  const revenueItems = items.filter((t: any) => t.type === 'revenue');
  const totalRevenue = revenueItems.reduce((sum: number, t: any) => sum + t.amount, 0);
  const commissionAmount = totalRevenue * (commissionPercentage / 100);
  const paid = items.filter((t: any) => t.type === 'commission_payment').reduce((sum: number, t: any) => sum + t.amount, 0);

  return ok({
    barberId,
    commissionPercentage,
    totalRevenue,
    commissionAmount,
    paid,
    pending: commissionAmount - paid,
    transactions: revenueItems,
  });
});
