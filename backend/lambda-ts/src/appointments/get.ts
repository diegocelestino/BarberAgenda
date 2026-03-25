import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const tableName = process.env.APPOINTMENTS_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const barberId = event.pathParameters?.barberId;
    const appointmentId = event.pathParameters?.appointmentId;
    
    if (!barberId || !appointmentId) {
      return error(400, 'barberId and appointmentId are required');
    }

    const result = await dynamo.send(new GetItemCommand({
      TableName: tableName,
      Key: { 
        barberId: { S: barberId },
        appointmentId: { S: appointmentId }
      },
    }));

    if (!result.Item) {
      return error(404, 'Appointment not found');
    }

    return ok(unmarshall(result.Item));
  } catch (err) {
    console.error('Error getting appointment:', err);
    return error(500, 'Internal server error');
  }
};
