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

    // Get query parameters
    const startDate = event.queryStringParameters?.startDate;
    const endDate = event.queryStringParameters?.endDate;
    const status = event.queryStringParameters?.status;

    const result = await dynamo.send(new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: 'barberId = :barberId',
      ExpressionAttributeValues: {
        ':barberId': { S: barberId }
      },
    }));

    let items = result.Items?.map(item => unmarshall(item)) || [];
    
    // Apply filters
    if (startDate) {
      const startTimestamp = parseInt(startDate);
      items = items.filter(item => item.startTime >= startTimestamp);
    }
    
    if (endDate) {
      const endTimestamp = parseInt(endDate);
      items = items.filter(item => item.startTime <= endTimestamp);
    }
    
    if (status) {
      // Support comma-separated status values (e.g., "completed,cancelled")
      const statusList = status.split(',').map(s => s.trim());
      items = items.filter(item => statusList.includes(item.status));
    }
    
    // Sort by start time
    items.sort((a, b) => a.startTime - b.startTime);
    
    return ok({ appointments: items });
  } catch (err) {
    console.error('Error listing appointments:', err);
    return error(500, 'Internal server error');
  }
};
