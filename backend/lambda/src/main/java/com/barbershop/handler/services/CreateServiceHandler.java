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
import java.util.UUID;

public class CreateServiceHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final Gson gson = new Gson();
    private final String servicesTable = System.getenv("SERVICES_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> body = gson.fromJson(input.getBody(), Map.class);

            String serviceId = "service-" + UUID.randomUUID().toString();
            long createdAt = System.currentTimeMillis();

            Map<String, AttributeValue> item = new HashMap<>();
            item.put("serviceId", AttributeValue.builder().s(serviceId).build());
            item.put("title", AttributeValue.builder().s((String) body.get("title")).build());
            item.put("name", AttributeValue.builder().s((String) body.get("name")).build());
            if (body.containsKey("description")) {
                item.put("description", AttributeValue.builder().s((String) body.get("description")).build());
            }
            item.put("price", AttributeValue.builder().n(body.get("price").toString()).build());
            item.put("duration", AttributeValue.builder().n(body.get("duration").toString()).build());
            item.put("durationMinutes", AttributeValue.builder().n(body.get("durationMinutes").toString()).build());
            item.put("createdAt", AttributeValue.builder().n(String.valueOf(createdAt)).build());

            PutItemRequest putItemRequest = PutItemRequest.builder()
                    .tableName(servicesTable)
                    .item(item)
                    .build();

            dynamoDb.putItem(putItemRequest);

            Map<String, Object> service = new HashMap<>();
            service.put("serviceId", serviceId);
            service.put("title", body.get("title"));
            service.put("name", body.get("name"));
            if (body.containsKey("description")) {
                service.put("description", body.get("description"));
            }
            service.put("price", body.get("price"));
            service.put("duration", body.get("duration"));
            service.put("durationMinutes", body.get("durationMinutes"));
            service.put("createdAt", createdAt);

            return ResponseHelper.createResponse(201, service);

        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return ResponseHelper.createErrorResponse(500, "Failed to create service: " + e.getMessage());
        }
    }
}
