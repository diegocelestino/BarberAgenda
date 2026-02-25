package com.barbershop.util;

import com.barbershop.model.Barber;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

public class DynamoDbHelper {
    private static final DynamoDbEnhancedClient enhancedClient;
    private static final String TABLE_NAME = System.getenv("BARBERS_TABLE");

    static {
        DynamoDbClient ddbClient = DynamoDbClient.builder()
                .build(); // Use default region from Lambda environment
        enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(ddbClient)
                .build();
    }

    public static DynamoDbTable<Barber> getBarbersTable() {
        return enhancedClient.table(TABLE_NAME, TableSchema.fromBean(Barber.class));
    }
}
