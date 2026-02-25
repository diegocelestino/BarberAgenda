import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// Single shared client — initialized once per container, reused across warm invocations
export const dynamo = new DynamoDBClient({});
