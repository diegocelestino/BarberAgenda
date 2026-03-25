import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
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

    const body = JSON.parse(event.body || '{}');
    const { customerName, customerPhone, service, startTime, endTime, notes, status } = body;

    const updates: string[] = [];
    const values: Record<string, any> = {};
    const names: Record<string, string> = {};

    if (customerName) {
      updates.push('customerName = :customerName');
      values[':customerName'] = { S: customerName };
    }
    if (customerPhone) {
      updates.push('customerPhone = :customerPhone');
      values[':customerPhone'] = { S: customerPhone };
    }
    if (service) {
      updates.push('#service = :service');
      values[':service'] = { S: service };
      names['#service'] = 'service';
    }
    if (startTime) {
      updates.push('startTime = :startTime');
      values[':startTime'] = { N: startTime.toString() };
    }
    if (endTime) {
      updates.push('endTime = :endTime');
      values[':endTime'] = { N: endTime.toString() };
    }
    if (notes !== undefined) {
      updates.push('notes = :notes');
      values[':notes'] = { S: notes };
    }
    if (status) {
      updates.push('#status = :status');
      values[':status'] = { S: status };
      names['#status'] = 'status';
    }

    if (updates.length === 0) {
      return error(400, 'No fields to update');
    }

    await dynamo.send(new UpdateItemCommand({
      TableName: tableName,
      Key: { 
        barberId: { S: barberId },
        appointmentId: { S: appointmentId }
      },
      UpdateExpression: `SET ${updates.join(', ')}`,
      ExpressionAttributeValues: values,
      ExpressionAttributeNames: Object.keys(names).length > 0 ? names : undefined,
    }));

    return ok({ appointment: { barberId, appointmentId, ...body } });
  } catch (err) {
    console.error('Error updating appointment:', err);
    return error(500, 'Internal server error');
  }
};
