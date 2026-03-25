import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const tableName = process.env.APPOINTMENTS_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const barberId = event.pathParameters?.barberId;
    const appointmentId = event.pathParameters?.appointmentId;
    
    if (!barberId || !appointmentId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'barberId and appointmentId are required' }),
      };
    }

    await client.send(new DeleteItemCommand({
      TableName: tableName,
      Key: { 
        barberId: { S: barberId },
        appointmentId: { S: appointmentId }
      },
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Appointment deleted successfully' }),
    };
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
