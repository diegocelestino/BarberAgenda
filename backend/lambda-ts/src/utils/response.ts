const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

export const ok = (body: any, statusCode = 200) => ({
  statusCode,
  headers: HEADERS,
  body: JSON.stringify(body),
});

export const created = (body: any) => ok(body, 201);

export const error = (statusCode: number, message: string) => ({
  statusCode,
  headers: HEADERS,
  body: JSON.stringify({ message }),
});
