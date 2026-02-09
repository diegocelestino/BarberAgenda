package com.barbershop.handler.barbers;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.barbershop.model.Barber;
import com.barbershop.util.DynamoDbHelper;
import com.barbershop.util.ResponseHelper;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

import java.util.*;
import java.util.stream.Collectors;

public class GetBarbersListHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final DynamoDbTable<Barber> barbersTable = DynamoDbHelper.getBarbersTable();

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        try {
            List<Barber> barbers = barbersTable.scan().items().stream()
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("barbers", barbers);
            response.put("count", barbers.size());

            return ResponseHelper.createResponse(200, response);
        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return ResponseHelper.createErrorResponse(500, "Failed to get barbers: " + e.getMessage());
        }
    }
}
