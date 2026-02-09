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

import java.util.*;

public class CreateBarberHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private static final Gson gson = new Gson();
    private final DynamoDbTable<Barber> barbersTable = DynamoDbHelper.getBarbersTable();

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        try {
            Map<String, Object> body = gson.fromJson(request.getBody(), Map.class);
            
            String name = (String) body.get("name");
            if (name == null || name.isEmpty()) {
                return ResponseHelper.createErrorResponse(400, "Name is required");
            }

            Barber barber = new Barber();
            barber.setBarberId(UUID.randomUUID().toString());
            barber.setName(name);
            barber.setServiceIds(body.get("serviceIds") != null ? 
                (List<String>) body.get("serviceIds") : new ArrayList<>());
            barber.setRating(body.get("rating") != null ? 
                ((Number) body.get("rating")).doubleValue() : 0.0);
            barber.setPhotoUrl(body.get("photoUrl") != null ? 
                (String) body.get("photoUrl") : "");
            barber.setCreatedAt(System.currentTimeMillis());

            barbersTable.putItem(barber);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Barber created successfully");
            response.put("barber", barber);

            return ResponseHelper.createResponse(201, response);
        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return ResponseHelper.createErrorResponse(500, "Failed to create barber: " + e.getMessage());
        }
    }
}
