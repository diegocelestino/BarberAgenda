import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../shared/db/client';
import { withValidation } from '../shared/middleware/withValidation';
import { withErrorHandler } from '../shared/middleware/withErrorHandler';
import { updateCustomerSchema } from '../shared/validators/customer';
import { ok, error } from '../utils/response';

const tableName = process.env.CUSTOMERS_TABLE!;

export const handler = withErrorHandler(
  withValidation(updateCustomerSchema, async (event: APIGatewayProxyEvent, body) => {
    const customerId = event.pathParameters?.customerId;
    if (!customerId) return error(400, 'customerId is required');

    const entries = Object.entries(body).filter(([_, v]) => v !== undefined);
    if (entries.length === 0) return error(400, 'No fields to update');

    const expression = entries.map(([k], i) => `#k${i} = :v${i}`).join(', ');
    const names: Record<string, string> = {};
    const values: Record<string, any> = {};
    entries.forEach(([k, v], i) => { names[`#k${i}`] = k; values[`:v${i}`] = v; });

    const result = await docClient.send(new UpdateCommand({
      TableName: tableName,
      Key: { customerId },
      UpdateExpression: `SET ${expression}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: 'ALL_NEW',
    }));

    return ok({ customer: result.Attributes });
  })
);
