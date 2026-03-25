import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const tableName = process.env.BARBERS_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const result = await dynamo.send(new ScanCommand({ TableName: tableName }));
    const items = result.Items?.map(item => unmarshall(item)) || [];
    
    return ok(items);
  } catch (err) {
    console.error('Error listing barbers:', err);
    return error(500, 'Internal server error');
  }
};
