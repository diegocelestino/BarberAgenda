import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const tableName = process.env.APPOINTMENTS_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const barberId = event.pathParameters?.barberId;
    if (!barberId) {
      return error(400, 'barberId is required');
    }

    const result = await dynamo.send(new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: 'barberId = :barberId',
      ExpressionAttributeValues: {
        ':barberId': { S: barberId }
      },
    }));

    const items = result.Items?.map(item => unmarshall(item)) || [];
    
    return ok({ appointments: items });
  } catch (err) {
    console.error('Error listing appointments:', err);
    return error(500, 'Internal server error');
  }
};
