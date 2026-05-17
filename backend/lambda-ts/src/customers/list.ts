import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../shared/db/client';
import { withErrorHandler } from '../shared/middleware/withErrorHandler';
import { ok } from '../utils/response';

const tableName = process.env.CUSTOMERS_TABLE!;

export const handler = withErrorHandler(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const search = event.queryStringParameters?.search?.toLowerCase();

  const result = await docClient.send(new ScanCommand({ TableName: tableName }));
  let customers = result.Items || [];

  if (search) {
    customers = customers.filter((c: any) =>
      c.name?.toLowerCase().includes(search) || c.phone?.includes(search)
    );
  }

  return ok({ customers });
});
