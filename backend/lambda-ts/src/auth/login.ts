import { APIGatewayProxyHandler } from 'aws-lambda';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const TABLE = process.env.USERS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body ?? '{}');
    const { username, password } = body;

    if (!username || !password) return error(400, 'Username and password are required');

    const result = await dynamo.send(new GetItemCommand({
      TableName: TABLE,
      Key: marshall({ username }),
    }));

    if (!result.Item) return error(401, 'Invalid username or password');

    const user = unmarshall(result.Item);

    // Simple password comparison (plain text — same as original Java impl)
    if (user.password !== password) return error(401, 'Invalid username or password');

    const { password: _omit, ...safeUser } = user;

    // Mock token — same as original Java impl
    const token = `mock-token-${Date.now()}`;

    return ok({ user: safeUser, token });
  } catch (e: any) {
    return error(500, `Internal server error: ${e.message}`);
  }
};
