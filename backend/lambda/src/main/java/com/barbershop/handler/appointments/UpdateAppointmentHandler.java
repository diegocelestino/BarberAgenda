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

public class UpdateAppointmentHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final Gson gson = new Gson();
    private final String appointmentsTable = System.getenv("APPOINTMENTS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        try {
            String barberId = input.getPathParameters().get("barberId");
            String appointmentId = input.getPathParameters().get("appointmentId");
            @SuppressWarnings("unchecked")
            Map<String, Object> body = gson.fromJson(input.getBody(), Map.class);

            // Build update expression
            StringBuilder updateExpression = new StringBuilder("SET ");
            Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();
            int count = 0;

            if (body.containsKey("customerName")) {
                updateExpression.append("customerName = :customerName");
                expressionAttributeValues.put(":customerName", AttributeValue.builder().s((String) body.get("customerName")).build());
                count++;
            }
            if (body.containsKey("customerPhone")) {
                if (count > 0) updateExpression.append(", ");
                updateExpression.append("customerPhone = :customerPhone");
                expressionAttributeValues.put(":customerPhone", AttributeValue.builder().s((String) body.get("customerPhone")).build());
                count++;
            }
            if (body.containsKey("startTime")) {
                if (count > 0) updateExpression.append(", ");
                updateExpression.append("startTime = :startTime");
                expressionAttributeValues.put(":startTime", AttributeValue.builder().n(body.get("startTime").toString()).build());
                count++;
            }
            if (body.containsKey("endTime")) {
                if (count > 0) updateExpression.append(", ");
                updateExpression.append("endTime = :endTime");
                expressionAttributeValues.put(":endTime", AttributeValue.builder().n(body.get("endTime").toString()).build());
                count++;
            }
            if (body.containsKey("service")) {
                if (count > 0) updateExpression.append(", ");
                updateExpression.append("service = :service");
                expressionAttributeValues.put(":service", AttributeValue.builder().s((String) body.get("service")).build());
                count++;
            }
            if (body.containsKey("notes")) {
                if (count > 0) updateExpression.append(", ");
                updateExpression.append("notes = :notes");
                expressionAttributeValues.put(":notes", AttributeValue.builder().s((String) body.get("notes")).build());
                count++;
            }
            if (body.containsKey("status")) {
                if (count > 0) updateExpression.append(", ");
                updateExpression.append("#status = :status");
                expressionAttributeValues.put(":status", AttributeValue.builder().s((String) body.get("status")).build());
            }

            Map<String, String> expressionAttributeNames = new HashMap<>();
            expressionAttributeNames.put("#status", "status");

            UpdateItemRequest updateItemRequest = UpdateItemRequest.builder()
                    .tableName(appointmentsTable)
                    .key(Map.of(
                            "barberId", AttributeValue.builder().s(barberId).build(),
                            "appointmentId", AttributeValue.builder().s(appointmentId).build()
                    ))
                    .updateExpression(updateExpression.toString())
                    .expressionAttributeValues(expressionAttributeValues)
                    .expressionAttributeNames(expressionAttributeNames)
                    .returnValues(ReturnValue.ALL_NEW)
                    .build();

            UpdateItemResponse response = dynamoDb.updateItem(updateItemRequest);
            Map<String, AttributeValue> item = response.attributes();

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
            return ResponseHelper.createErrorResponse(500, "Failed to update appointment: " + e.getMessage());
        }
    }
}
