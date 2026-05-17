import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { docClient } from '../shared/db/client';
import { withValidation } from '../shared/middleware/withValidation';
import { withErrorHandler } from '../shared/middleware/withErrorHandler';
import { createTransactionSchema } from '../shared/validators/transaction';
import { created } from '../utils/response';
import { Transaction } from '../shared/types';

const tableName = process.env.TRANSACTIONS_TABLE!;

export const handler = withErrorHandler(
  withValidation(createTransactionSchema, async (_event: APIGatewayProxyEvent, body) => {
    const transaction: Transaction = {
      transactionId: randomUUID(),
      date: body.date || new Date().toISOString().split('T')[0],
      type: body.type,
      amount: body.amount,
      category: body.category,
      description: body.description,
      barberId: body.barberId,
      appointmentId: body.appointmentId,
      paymentMethod: body.paymentMethod,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({ TableName: tableName, Item: transaction }));
    return created({ transaction });
  })
);
