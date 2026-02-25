package com.barbershop.util;

import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;

import java.util.HashMap;
import java.util.Map;

public class ResponseHelper {
    private static final Gson gson = new Gson();

    public static APIGatewayProxyResponseEvent createResponse(int statusCode, Object body) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Content-Type", "application/json");

        return new APIGatewayProxyResponseEvent()
                .withStatusCode(statusCode)
                .withHeaders(headers)
                .withBody(gson.toJson(body));
    }

    public static APIGatewayProxyResponseEvent createErrorResponse(int statusCode, String message) {
        Map<String, String> errorBody = new HashMap<>();
        errorBody.put("message", message);
        return createResponse(statusCode, errorBody);
    }
}
