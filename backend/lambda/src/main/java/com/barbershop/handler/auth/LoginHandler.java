package com.barbershop.handler.auth;

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

public class LoginHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final Gson gson = new Gson();
    private final String usersTable = System.getenv("USERS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        try {
            // Parse request body
            String body = input.getBody();
            @SuppressWarnings("unchecked")
            Map<String, String> requestBody = gson.fromJson(body, Map.class);
            
            String username = requestBody.get("username");
            String password = requestBody.get("password");

            if (username == null || username.isEmpty() || password == null || password.isEmpty()) {
                return ResponseHelper.createErrorResponse(400, "Username and password are required");
            }

            // Get user from DynamoDB
            GetItemRequest getItemRequest = GetItemRequest.builder()
                    .tableName(usersTable)
                    .key(Map.of("username", AttributeValue.builder().s(username).build()))
                    .build();

            GetItemResponse response = dynamoDb.getItem(getItemRequest);

            if (!response.hasItem()) {
                return ResponseHelper.createErrorResponse(401, "Invalid username or password");
            }

            Map<String, AttributeValue> item = response.item();
            String storedPassword = item.get("password").s();

            // Simple password comparison (in production, use bcrypt)
            if (!password.equals(storedPassword)) {
                return ResponseHelper.createErrorResponse(401, "Invalid username or password");
            }

            // Build user response (without password)
            Map<String, Object> user = new HashMap<>();
            user.put("username", item.get("username").s());
            user.put("email", item.get("email").s());
            user.put("role", item.get("role").s());
            user.put("createdAt", Long.parseLong(item.get("createdAt").n()));

            // Generate mock token (in production, use JWT)
            String token = "mock-token-" + System.currentTimeMillis();

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("user", user);
            responseBody.put("token", token);

            return ResponseHelper.createResponse(200, responseBody);

        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return ResponseHelper.createErrorResponse(500, "Internal server error: " + e.getMessage());
        }
    }
}
