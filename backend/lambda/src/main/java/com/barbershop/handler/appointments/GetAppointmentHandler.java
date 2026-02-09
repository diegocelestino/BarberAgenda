package com.barbershop.handler.appointments;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.barbershop.util.ResponseHelper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.HashMap;
import java.util.Map;

public class GetAppointmentHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String appointmentsTable = System.getenv("APPOINTMENTS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        try {
            String barberId = input.getPathParameters().get("barberId");
            String appointmentId = input.getPathParameters().get("appointmentId");

            GetItemRequest getItemRequest = GetItemRequest.builder()
                    .tableName(appointmentsTable)
                    .key(Map.of(
                            "barberId", AttributeValue.builder().s(barberId).build(),
                            "appointmentId", AttributeValue.builder().s(appointmentId).build()
                    ))
                    .build();

            GetItemResponse response = dynamoDb.getItem(getItemRequest);

            if (!response.hasItem()) {
                return ResponseHelper.createErrorResponse(404, "Appointment not found");
            }

            Map<String, AttributeValue> item = response.item();
            Map<String, Object> appointment = new HashMap<>();
            appointment.put("appointmentId", item.get("appointmentId").s());
            appointment.put("barberId", item.get("barberId").s());
            appointment.put("customerName", item.get("customerName").s());
            if (item.containsKey("customerPhone")) {
                appointment.put("customerPhone", item.get("customerPhone").s());
            }
            appointment.put("startTime", Long.parseLong(item.get("startTime").n()));
            appointment.put("endTime", Long.parseLong(item.get("endTime").n()));
            if (item.containsKey("service")) {
                appointment.put("service", item.get("service").s());
            }
            if (item.containsKey("notes")) {
                appointment.put("notes", item.get("notes").s());
            }
            appointment.put("status", item.get("status").s());
            appointment.put("createdAt", Long.parseLong(item.get("createdAt").n()));

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("appointment", appointment);

            return ResponseHelper.createResponse(200, responseBody);

        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return ResponseHelper.createErrorResponse(500, "Failed to retrieve appointment: " + e.getMessage());
        }
    }
}
