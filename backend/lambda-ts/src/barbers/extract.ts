import { QueryCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const barbersTable = process.env.BARBERS_TABLE!;
const appointmentsTable = process.env.APPOINTMENTS_TABLE!;
const servicesTable = process.env.SERVICES_TABLE!;

interface Service {
  serviceId: string;
  title: string;
  price: number;
}

interface Appointment {
  appointmentId: string;
  barberId: string;
  customerName: string;
  customerPhone?: string;
  service: string;
  startTime: number;
  endTime: number;
  status: string;
  notes?: string;
}

interface ServiceSummary {
  serviceId: string;
  serviceName: string;
  count: number;
  revenue: number;
}

/**
 * Get barber extract/report with completed appointments and revenue calculations
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const barberId = event.pathParameters?.barberId;
    const startDate = event.queryStringParameters?.startDate;
    const endDate = event.queryStringParameters?.endDate;
    const format = event.queryStringParameters?.format || 'json';

    console.log('GET /barbers/:barberId/extract', { barberId, startDate, endDate, format });

    // Validate required parameters
    if (!barberId) {
      return error(400, 'barberId is required');
    }

    if (!startDate || !endDate) {
      return error(400, 'startDate and endDate parameters are required (timestamps)');
    }

    // Get barber from DynamoDB
    const barberResult = await dynamo.send(
      new QueryCommand({
        TableName: barbersTable,
        KeyConditionExpression: 'barberId = :barberId',
        ExpressionAttributeValues: {
          ':barberId': { S: barberId },
        },
        Limit: 1,
      })
    );

    if (!barberResult.Items || barberResult.Items.length === 0) {
      return error(404, 'Barber not found');
    }

    const barber = unmarshall(barberResult.Items[0]);

    // Get all services for price lookup
    const servicesResult = await dynamo.send(
      new ScanCommand({
        TableName: servicesTable,
      })
    );

    const services: Service[] = servicesResult.Items?.map((item) => unmarshall(item) as Service) || [];

    // Get completed appointments in date range
    const start = parseInt(startDate);
    const end = parseInt(endDate);

    const appointmentsResult = await dynamo.send(
      new QueryCommand({
        TableName: appointmentsTable,
        KeyConditionExpression: 'barberId = :barberId',
        FilterExpression: 'startTime >= :start AND startTime <= :end AND #status = :completed',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':barberId': { S: barberId },
          ':start': { N: start.toString() },
          ':end': { N: end.toString() },
          ':completed': { S: 'completed' },
        },
      })
    );

    const completedAppointments: Appointment[] = appointmentsResult.Items?.map((item) => unmarshall(item) as Appointment) || [];

    // Sort by most recent first
    completedAppointments.sort((a, b) => b.startTime - a.startTime);

    // Calculate totals and aggregations
    let totalRevenue = 0;
    const byServiceMap: { [key: string]: ServiceSummary } = {};

    completedAppointments.forEach((apt) => {
      const service = services.find((s) => s.serviceId === apt.service);
      const price = service ? service.price : 0;
      const serviceName = service ? service.title : apt.service;

      totalRevenue += price;

      if (!byServiceMap[apt.service]) {
        byServiceMap[apt.service] = {
          serviceId: apt.service,
          serviceName,
          count: 0,
          revenue: 0,
        };
      }

      byServiceMap[apt.service].count++;
      byServiceMap[apt.service].revenue += price;
    });

    const summary = {
      totalRevenue,
      totalAppointments: completedAppointments.length,
      byService: Object.values(byServiceMap),
    };

    // For now, only support JSON format in Lambda
    // PDF generation can be added later with a library like pdfkit or by using a separate service
    if (format === 'pdf') {
      return error(501, 'PDF format not yet implemented in Lambda. Use format=json for now.');
    }

    // Return JSON response
    return ok({
      barber: {
        barberId: barber.barberId,
        name: barber.name,
      },
      period: {
        startDate: start,
        endDate: end,
      },
      summary,
      appointments: completedAppointments.map((apt) => {
        const service = services.find((s) => s.serviceId === apt.service);
        return {
          ...apt,
          serviceName: service ? service.title : apt.service,
          servicePrice: service ? service.price : 0,
        };
      }),
    });
  } catch (err) {
    console.error('Error getting extract:', err);
    return error(500, 'Internal server error');
  }
};
