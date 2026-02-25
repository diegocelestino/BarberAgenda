# Barber Scheduler Lambda Functions (Java 21)

This directory contains the Java 21 Lambda functions for the Barber Scheduler application.

## Prerequisites

- Java 21 (JDK 21)
- Maven 3.8+

## Build

To build the Lambda functions:

```bash
cd backend/lambda-java
mvn clean package
```

This will create a JAR file at `target/barber-scheduler-lambda-1.0.0.jar` that contains all dependencies.

## Lambda Handlers

- **CreateBarberHandler**: `com.barbershop.handler.CreateBarberHandler::handleRequest`
- **GetBarbersListHandler**: `com.barbershop.handler.GetBarbersListHandler::handleRequest`
- **GetBarberHandler**: `com.barbershop.handler.GetBarberHandler::handleRequest`
- **UpdateBarberHandler**: `com.barbershop.handler.UpdateBarberHandler::handleRequest`
- **DeleteBarberHandler**: `com.barbershop.handler.DeleteBarberHandler::handleRequest`

## Environment Variables

All handlers require:
- `BARBERS_TABLE`: DynamoDB table name for barbers

## Deployment

The CDK stack has been updated to deploy these Java 21 Lambda functions. Run:

```bash
cd backend
npm run build
cdk deploy
```

## Migration Notes

- Migrated from Node.js 18 to Java 21
- Using AWS SDK v2 for Java with DynamoDB Enhanced Client
- Increased timeout to 30 seconds and memory to 512MB for Java cold starts
- All functionality remains the same as the Node.js version
