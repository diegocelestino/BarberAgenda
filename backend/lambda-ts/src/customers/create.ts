import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { docClient } from '../shared/db/client';
import { withValidation } from '../shared/middleware/withValidation';
import { withErrorHandler } from '../shared/middleware/withErrorHandler';
import { createCustomerSchema } from '../shared/validators/customer';
import { created } from '../utils/response';
import { Customer } from '../shared/types';

const tableName = process.env.CUSTOMERS_TABLE!;

export const handler = withErrorHandler(
  withValidation(createCustomerSchema, async (_event: APIGatewayProxyEvent, body) => {
    const customer: Customer = {
      customerId: randomUUID(),
      name: body.name,
      phone: body.phone,
      email: body.email,
      notes: body.notes,
      loyaltyPoints: 0,
      totalVisits: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({ TableName: tableName, Item: customer }));
    return created({ customer });
  })
);
