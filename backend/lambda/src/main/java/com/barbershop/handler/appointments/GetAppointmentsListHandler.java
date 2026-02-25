package com.barbershop.handler.appointments;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.barbershop.util.ResponseHelper;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GetAppointmentsListHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String appointmentsTable = System.getenv("APPOINTMENTS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        try {
            String barberId = input.getPathParameters().get("barberId");
            Map<String, String> queryParams = input.getQueryStringParameters();

            // Build query request
            QueryRequest.Builder queryBuilder = QueryRequest.builder()
                    .tableName(appointmentsTable)
                    .keyConditionExpression("barberId = :barberId");

            Map<String, AttributeValue> expressionValues = new HashMap<>();
            expressionValues.put(":barberId", AttributeValue.builder().s(barberId).build());

            // Add date range filter if provided
            if (queryParams != null && queryParams.containsKey("startDate") && queryParams.containsKey("endDate")) {
                queryBuilder.filterExpression("startTime BETWEEN :startDate AND :endDate");
                expressionValues.put(":startDate", AttributeValue.builder().n(queryParams.get("startDate")).build());
                expressionValues.put(":endDate", AttributeValue.builder().n(queryParams.get("endDate")).build());
            }

            queryBuilder.expressionAttributeValues(expressionValues);
            QueryResponse response = dynamoDb.query(queryBuilder.build());

            List<Map<String, Object>> appointments = new ArrayList<>();
            for (Map<String, AttributeValue> item : response.items()) {
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
                appointments.add(appointment);
            }

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("appointments", appointments);

            return ResponseHelper.createResponse(200, responseBody);

        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return ResponseHelper.createErrorResponse(500, "Failed to retrieve appointments: " + e.getMessage());
        }
    }
}
