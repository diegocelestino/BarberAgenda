import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { docClient } from '../shared/db/client';
import { withErrorHandler } from '../shared/middleware/withErrorHandler';
import { ok, error } from '../utils/response';
import { Transaction } from '../shared/types';

const tableName = process.env.TRANSACTIONS_TABLE!;

export const handler = withErrorHandler(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || '{}');
  const { barberId, amount, description } = body;

  if (!barberId || !amount) return error(400, 'barberId and amount are required');

  const transaction: Transaction = {
    transactionId: randomUUID(),
    date: new Date().toISOString().split('T')[0],
    type: 'commission_payment',
    amount,
    category: 'comissao',
    description: description || 'Pagamento de comissão',
    barberId,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({ TableName: tableName, Item: transaction }));
  return ok({ transaction });
});
