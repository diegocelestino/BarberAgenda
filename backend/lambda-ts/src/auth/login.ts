import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamo } from '../utils/dynamodb';
import { ok, error } from '../utils/response';

const tableName = process.env.USERS_TABLE!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { username, password } = body;

    if (!username || !password) {
      return error(400, 'username and password are required');
    }

    const result = await dynamo.send(new GetItemCommand({
      TableName: tableName,
      Key: { username: { S: username } },
    }));

    if (!result.Item) {
      return error(401, 'Invalid credentials');
    }

    const user = unmarshall(result.Item);
    
    // Simple password check (in production, use proper hashing)
    if (user.password !== password) {
      return error(401, 'Invalid credentials');
    }

    return ok({ 
      message: 'Login successful',
      user: { username: user.username, role: user.role }
    });
  } catch (err) {
    console.error('Error during login:', err);
    return error(500, 'Internal server error');
  }
};
