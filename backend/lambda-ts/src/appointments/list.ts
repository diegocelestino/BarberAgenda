import { APIGatewayProxyHandler } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const TABLE = process.env.APPOINTMENTS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const barberId = event.pathParameters?.barberId;
    if (!barberId) return error(400, 'barberId is required');

    const { startDate, endDate } = event.queryStringParameters ?? {};

    const exprValues: Record<string, unknown> = { ':barberId': barberId };
    let filterExpression: string | undefined;

    if (startDate && endDate) {
      filterExpression = 'startTime BETWEEN :startDate AND :endDate';
      exprValues[':startDate'] = Number(startDate);
      exprValues[':endDate'] = Number(endDate);
    }

    const result = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'barberId = :barberId',
      ExpressionAttributeValues: marshall(exprValues),
      ...(filterExpression && { FilterExpression: filterExpression }),
    }));

    const appointments = (result.Items ?? []).map(item => unmarshall(item));
    return ok({ appointments });
  } catch (e: any) {
    return error(500, `Failed to retrieve appointments: ${e.message}`);
  }
};
