package com.barbershop.handler.barbers;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.barbershop.model.Barber;
import com.barbershop.util.DynamoDbHelper;
import com.barbershop.util.ResponseHelper;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;

import java.util.*;

public class GetBarberHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
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
            Barber barber = barbersTable.getItem(key);

            if (barber == null) {
                return ResponseHelper.createErrorResponse(404, "Barber not found");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("barber", barber);

            return ResponseHelper.createResponse(200, response);
        } catch (Exception e) {
            context.getLogger().log("Error: " + e.getMessage());
            return ResponseHelper.createErrorResponse(500, "Failed to get barber: " + e.getMessage());
        }
    }
}
