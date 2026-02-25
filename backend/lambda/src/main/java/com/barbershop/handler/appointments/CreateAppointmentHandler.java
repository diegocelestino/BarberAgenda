package com.barbershop.handler.appointments;

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

public class CreateAppointmentHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final Gson gson = new Gson();
    private final String appointmentsTable = System.getenv("APPOINTMENTS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        try {
            String barberId = input.getPathParameters().get("barberId");
            @SuppressWarnings("unchecked")
            Map<String, Object> body = gson.fromJson(input.getBody(), Map.class);

            String appointmentId = UUID.randomUUID().toString();
            long createdAt = System.currentTimeMillis();

            Map<String, AttributeValue> item = new HashMap<>();
            item.put("barberId", AttributeValue.builder().s(barberId).build());
            item.put("appointmentId", AttributeValue.builder().s(appointmentId).build());
            item.put("customerName", AttributeValue.builder().s((String) body.get("customerName")).build());
            
            if (body.containsKey("customerPhone")) {
                item.put("customerPhone", AttributeValue.builder().s((String) body.get("customerPhone")).build());
            }
            
            item.put("startTime", AttributeValue.builder().n(body.get("startTime").toString()).build());
            item.put("endTime", AttributeValue.builder().n(body.get("endTime").toString()).build());
            
            if (body.containsKey("service")) {
                item.put("service", AttributeValue.builder().s((String) body.get("service")).build());
            }
            
            if (body.containsKey("notes")) {
                item.put("notes", AttributeValue.builder().s((String) body.get("notes")).build());
            }
            
            item.put("status", AttributeValue.builder().s("scheduled").build());
            item.put("createdAt", AttributeValue.builder().n(String.valueOf(createdAt)).build());

            PutItemRequest putItemRequest = PutItemRequest.builder()
                    .tableName(appointmentsTable)
                    .item(item)
                    .build();

            dynamoDb.putItem(putItemRequest);

            Map<String, Object> appointment = new HashMap<>();
            appointment.put("appointmentId", appointmentId);
            appointment.put("barberId", barberId);
            appointment.put("customerName", body.get("customerName"));
            if (body.containsKey("customerPhone")) {
                appointment.put("customerPhone", body.get("customerPhone"));
            }
            appointment.put("startTime", body.get("startTime"));
            appointment.put("endTime", body.get("endTime"));
            if (body.containsKey("service")) {
                appointment.put("service", body.get("service"));
            }
            if (body.containsKey("notes")) {
                appointment.put("notes", body.get("notes"));
            }
            appointment.put("status", "scheduled");
            appointment.put("createdAt", createdAt);

            Map<String, Object> response = new HashMap<>();
            response.put("appointment", appointment);

            return ResponseHelper.createResponse(201, response);

        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return ResponseHelper.createErrorResponse(500, "Failed to create appointment: " + e.getMessage());
        }
    }
}
