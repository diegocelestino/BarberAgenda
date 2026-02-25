import { APIGatewayProxyHandler } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const TABLE = process.env.BARBERS_TABLE!;

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const result = await dynamo.send(new ScanCommand({ TableName: TABLE }));
    const barbers = (result.Items ?? []).map(item => unmarshall(item));
    return ok({ barbers, count: barbers.length });
  } catch (e: any) {
    return error(500, `Failed to get barbers: ${e.message}`);
  }
};
