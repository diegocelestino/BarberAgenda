import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ZodSchema } from 'zod';
import { error } from '../../utils/response';

type ValidatedHandler<T> = (
  event: APIGatewayProxyEvent,
  body: T
) => Promise<APIGatewayProxyResult>;

export const withValidation = <T>(
  schema: ZodSchema<T>,
  handler: ValidatedHandler<T>
) => {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const parsed = schema.safeParse(JSON.parse(event.body || '{}'));
    if (!parsed.success) {
      const messages = parsed.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return error(400, messages);
    }
    return handler(event, parsed.data);
  };
};
