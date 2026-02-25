package com.barbershop.handler.services;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.barbershop.util.ResponseHelper;
import com.google.gson.Gson;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.HashMap;
import java.util.Map;

public class UpdateServiceHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final Gson gson = new Gson();
    private final String servicesTable = System.getenv("SERVICES_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        try {
            String serviceId = input.getPathParameters().get("serviceId");
            @SuppressWarnings("unchecked")
            Map<String, Object> body = gson.fromJson(input.getBody(), Map.class);

            // Build update expression
            StringBuilder updateExpression = new StringBuilder("SET ");
            Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();
            int count = 0;

            if (body.containsKey("title")) {
                updateExpression.append("title = :title");
                expressionAttributeValues.put(":title", AttributeValue.builder().s((String) body.get("title")).build());
                count++;
            }
            if (body.containsKey("name")) {
                if (count > 0) updateExpression.append(", ");
                updateExpression.append("#n = :name");
                expressionAttributeValues.put(":name", AttributeValue.builder().s((String) body.get("name")).build());
                count++;
            }
            if (body.containsKey("description")) {
                if (count > 0) updateExpression.append(", ");
                updateExpression.append("description = :description");
                expressionAttributeValues.put(":description", AttributeValue.builder().s((String) body.get("description")).build());
                count++;
            }
            if (body.containsKey("price")) {
                if (count > 0) updateExpression.append(", ");
                updateExpression.append("price = :price");
                expressionAttributeValues.put(":price", AttributeValue.builder().n(body.get("price").toString()).build());
                count++;
            }
            if (body.containsKey("duration")) {
                if (count > 0) updateExpression.append(", ");
                updateExpression.append("duration = :duration");
                expressionAttributeValues.put(":duration", AttributeValue.builder().n(body.get("duration").toString()).build());
                count++;
            }
            if (body.containsKey("durationMinutes")) {
                if (count > 0) updateExpression.append(", ");
                updateExpression.append("durationMinutes = :durationMinutes");
                expressionAttributeValues.put(":durationMinutes", AttributeValue.builder().n(body.get("durationMinutes").toString()).build());
            }

            Map<String, String> expressionAttributeNames = new HashMap<>();
            expressionAttributeNames.put("#n", "name");

            UpdateItemRequest updateItemRequest = UpdateItemRequest.builder()
                    .tableName(servicesTable)
                    .key(Map.of("serviceId", AttributeValue.builder().s(serviceId).build()))
                    .updateExpression(updateExpression.toString())
                    .expressionAttributeValues(expressionAttributeValues)
                    .expressionAttributeNames(expressionAttributeNames)
                    .returnValues(ReturnValue.ALL_NEW)
                    .build();

            UpdateItemResponse response = dynamoDb.updateItem(updateItemRequest);
            Map<String, AttributeValue> item = response.attributes();

            Map<String, Object> service = new HashMap<>();
            service.put("serviceId", item.get("serviceId").s());
            service.put("title", item.get("title").s());
            service.put("name", item.get("name").s());
            if (item.containsKey("description")) {
                service.put("description", item.get("description").s());
            }
            service.put("price", Double.parseDouble(item.get("price").n()));
            service.put("duration", Integer.parseInt(item.get("duration").n()));
            service.put("durationMinutes", Integer.parseInt(item.get("durationMinutes").n()));
            service.put("createdAt", Long.parseLong(item.get("createdAt").n()));

            return ResponseHelper.createResponse(200, service);

        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return ResponseHelper.createErrorResponse(500, "Failed to update service: " + e.getMessage());
        }
    }
}
