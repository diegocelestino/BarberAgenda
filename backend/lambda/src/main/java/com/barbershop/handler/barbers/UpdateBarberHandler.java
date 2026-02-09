package com.barbershop.handler.barbers;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.barbershop.model.Barber;
import com.barbershop.util.DynamoDbHelper;
import com.barbershop.util.ResponseHelper;
import com.google.gson.Gson;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;

import java.util.*;

public class UpdateBarberHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private static final Gson gson = new Gson();
    private final DynamoDbTable<Barber> barbersTable = DynamoDbHelper.getBarbersTable();

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        try {
            Map<String, String> pathParams = request.getPathParameters();
            if (pathParams == null || !pathParams.containsKey("barberId")) {
                return ResponseHelper.createErrorResponse(400, "barberId is required");
            }

            String barberId = pathParams.get("barberId");
            Key key = Key.builder().partitionValue(barberId).build();
            Barber existingBarber = barbersTable.getItem(key);

            if (existingBarber == null) {
                return ResponseHelper.createErrorResponse(404, "Barber not found");
            }

            Map<String, Object> updates = gson.fromJson(request.getBody(), Map.class);
            boolean hasUpdates = false;

            if (updates.containsKey("name")) {
                existingBarber.setName((String) updates.get("name"));
                hasUpdates = true;
            }
            if (updates.containsKey("specialties")) {
                existingBarber.setSpecialties((List<String>) updates.get("specialties"));
                hasUpdates = true;
            }
            if (updates.containsKey("rating")) {
                existingBarber.setRating(((Number) updates.get("rating")).doubleValue());
                hasUpdates = true;
            }
            if (updates.containsKey("photoUrl")) {
                existingBarber.setPhotoUrl((String) updates.get("photoUrl"));
                hasUpdates = true;
            }

            if (!hasUpdates) {
                return ResponseHelper.createErrorResponse(400, "No valid fields to update");
            }

            barbersTable.putItem(existingBarber);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Barber updated successfully");
            response.put("barber", existingBarber);

            return ResponseHelper.createResponse(200, response);
        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return ResponseHelper.createErrorResponse(500, "Failed to update barber: " + e.getMessage());
        }
    }
}
