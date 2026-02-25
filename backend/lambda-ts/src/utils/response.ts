import { APIGatewayProxyResult } from 'aws-lambda';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

export const ok = (body: unknown, statusCode = 200): APIGatewayProxyResult => ({
  statusCode,
  headers: HEADERS,
  body: JSON.stringify(body),
});

export const created = (body: unknown): APIGatewayProxyResult => ok(body, 201);

export const error = (statusCode: number, message: string): APIGatewayProxyResult => ({
  statusCode,
  headers: HEADERS,
  body: JSON.stringify({ message }),
});
