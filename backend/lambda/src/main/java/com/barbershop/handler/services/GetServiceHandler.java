package com.barbershop.handler.services;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.barbershop.util.ResponseHelper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.HashMap;
import java.util.Map;

public class GetServiceHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String servicesTable = System.getenv("SERVICES_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        try {
            String serviceId = input.getPathParameters().get("serviceId");

            GetItemRequest getItemRequest = GetItemRequest.builder()
                    .tableName(servicesTable)
                    .key(Map.of("serviceId", AttributeValue.builder().s(serviceId).build()))
                    .build();

            GetItemResponse response = dynamoDb.getItem(getItemRequest);

            if (!response.hasItem()) {
                return ResponseHelper.createErrorResponse(404, "Service not found");
            }

            Map<String, AttributeValue> item = response.item();
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
            return ResponseHelper.createErrorResponse(500, "Failed to retrieve service: " + e.getMessage());
        }
    }
}
