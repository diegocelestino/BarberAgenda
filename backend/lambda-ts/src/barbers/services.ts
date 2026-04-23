import { GetItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const barbersTable = process.env.BARBERS_TABLE!;
const servicesTable = process.env.SERVICES_TABLE!;

/**
 * Get services for a specific barber (filtered by barber's serviceIds)
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const barberId = event.pathParameters?.barberId;

    console.log('GET /barbers/:barberId/services', { barberId });

    // Validate required parameters
    if (!barberId) {
      return error(400, 'barberId is required');
    }

    // Get barber from DynamoDB
    const barberResult = await dynamo.send(
      new GetItemCommand({
        TableName: barbersTable,
        Key: { barberId: { S: barberId } },
      })
    );

    if (!barberResult.Item) {
      return error(404, 'Barber not found');
    }

    const barber = unmarshall(barberResult.Item);

    // Get all services
    const servicesResult = await dynamo.send(
      new ScanCommand({
        TableName: servicesTable,
      })
    );

    const allServices = servicesResult.Items?.map((item) => unmarshall(item)) || [];

    // Filter services by barber's serviceIds
    const barberServiceIds = barber.serviceIds || [];
    const barberServices = allServices.filter((service: any) =>
      barberServiceIds.includes(service.serviceId)
    );

    return ok({ services: barberServices });
  } catch (err) {
    console.error('Error getting barber services:', err);
    return error(500, 'Internal server error');
  }
};
