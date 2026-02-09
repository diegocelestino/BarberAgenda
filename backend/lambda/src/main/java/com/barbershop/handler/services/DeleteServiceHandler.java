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

public class DeleteServiceHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String servicesTable = System.getenv("SERVICES_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        try {
            String serviceId = input.getPathParameters().get("serviceId");

            DeleteItemRequest deleteItemRequest = DeleteItemRequest.builder()
                    .tableName(servicesTable)
                    .key(Map.of("serviceId", AttributeValue.builder().s(serviceId).build()))
                    .build();

            dynamoDb.deleteItem(deleteItemRequest);

            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "Service deleted successfully");

            return ResponseHelper.createResponse(200, responseBody);

        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return ResponseHelper.createErrorResponse(500, "Failed to delete service: " + e.getMessage());
        }
    }
}
