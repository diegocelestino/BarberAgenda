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

public class DeleteAppointmentHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final DynamoDbClient dynamoDb = DynamoDbClient.create();
    private final String appointmentsTable = System.getenv("APPOINTMENTS_TABLE");

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        try {
            String barberId = input.getPathParameters().get("barberId");
            String appointmentId = input.getPathParameters().get("appointmentId");

            DeleteItemRequest deleteItemRequest = DeleteItemRequest.builder()
                    .tableName(appointmentsTable)
                    .key(Map.of(
                            "barberId", AttributeValue.builder().s(barberId).build(),
                            "appointmentId", AttributeValue.builder().s(appointmentId).build()
                    ))
                    .build();

            dynamoDb.deleteItem(deleteItemRequest);

            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "Appointment deleted successfully");

            return ResponseHelper.createResponse(200, responseBody);

        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return ResponseHelper.createErrorResponse(500, "Failed to delete appointment: " + e.getMessage());
        }
    }
}
