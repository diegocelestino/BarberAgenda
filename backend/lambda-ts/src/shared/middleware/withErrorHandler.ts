import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { error } from '../../utils/response';

type Handler = (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;

export const withErrorHandler = (handler: Handler): Handler => {
  return async (event) => {
    try {
      return await handler(event);
    } catch (err) {
      console.error('Unhandled error:', err);
      return error(500, 'Internal server error');
    }
  };
};
