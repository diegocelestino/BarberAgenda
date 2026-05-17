import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateCommand, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { docClient } from '../shared/db/client';
import { withErrorHandler } from '../shared/middleware/withErrorHandler';
import { ok, error } from '../utils/response';

const appointmentsTable = process.env.APPOINTMENTS_TABLE!;
const transactionsTable = process.env.TRANSACTIONS_TABLE!;
const customersTable = process.env.CUSTOMERS_TABLE!;

export const handler = withErrorHandler(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const barberId = event.pathParameters?.barberId;
  const appointmentId = event.pathParameters?.appointmentId;

  if (!barberId || !appointmentId) return error(400, 'barberId and appointmentId are required');

  const body = JSON.parse(event.body || '{}');
  const { customerName, customerPhone, service, startTime, endTime, notes, status, paymentMethod, paidAmount } = body;

  // Build update expression
  const entries = Object.entries({ customerName, customerPhone, service, startTime, endTime, notes, status, paymentMethod, paidAmount })
    .filter(([_, v]) => v !== undefined);

  if (entries.length === 0) return error(400, 'No fields to update');

  const expression = entries.map(([k], i) => `#k${i} = :v${i}`).join(', ');
  const names: Record<string, string> = {};
  const values: Record<string, any> = {};
  entries.forEach(([k, v], i) => { names[`#k${i}`] = k; values[`:v${i}`] = v; });

  const result = await docClient.send(new UpdateCommand({
    TableName: appointmentsTable,
    Key: { barberId, appointmentId },
    UpdateExpression: `SET ${expression}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ReturnValues: 'ALL_NEW',
  }));

  const updatedAppointment = result.Attributes;

  // Side-effects on completion
  if (status === 'completed' && paidAmount) {
    // 1. Create revenue transaction
    await docClient.send(new PutCommand({
      TableName: transactionsTable,
      Item: {
        transactionId: randomUUID(),
        date: new Date(updatedAppointment?.startTime || Date.now()).toISOString().split('T')[0],
        type: 'revenue',
        amount: paidAmount,
        category: 'servico',
        description: updatedAppointment?.customerName || customerName || '',
        barberId,
        appointmentId,
        paymentMethod: paymentMethod || 'dinheiro',
        createdAt: new Date().toISOString(),
      },
    }));

    // 2. Add loyalty points to customer (1 pt per R$ spent)
    const phone = updatedAppointment?.customerPhone || customerPhone;
    if (phone) {
      const customerResult = await docClient.send(new QueryCommand({
        TableName: customersTable,
        IndexName: 'PhoneIndex',
        KeyConditionExpression: 'phone = :phone',
        ExpressionAttributeValues: { ':phone': phone },
        Limit: 1,
      }));

      const customer = customerResult.Items?.[0];
      if (customer) {
        await docClient.send(new UpdateCommand({
          TableName: customersTable,
          Key: { customerId: customer.customerId },
          UpdateExpression: 'SET loyaltyPoints = loyaltyPoints + :pts, totalVisits = totalVisits + :one, totalSpent = totalSpent + :amt, lastVisit = :now',
          ExpressionAttributeValues: {
            ':pts': paidAmount,
            ':one': 1,
            ':amt': paidAmount,
            ':now': new Date().toISOString(),
          },
        }));
      }
    }
  }

  return ok({ appointment: updatedAppointment });
});
