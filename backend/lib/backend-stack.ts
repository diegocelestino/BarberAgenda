import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as path from 'path';

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table - Barbers
    const barbersTable = new dynamodb.Table(this, 'BarbersTable', {
      partitionKey: { name: 'barberId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda Functions for Barbers CRUD (Java 21)
    const createBarberFn = new lambda.Function(this, 'CreateBarberFunction', {
      runtime: lambda.Runtime.JAVA_21,
      handler: 'com.barbershop.handler.CreateBarberHandler::handleRequest',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/target/barber-scheduler-lambda-1.0.0.jar')),
      environment: {
        BARBERS_TABLE: barbersTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    const getBarbersListFn = new lambda.Function(this, 'GetBarbersListFunction', {
      runtime: lambda.Runtime.JAVA_21,
      handler: 'com.barbershop.handler.GetBarbersListHandler::handleRequest',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/target/barber-scheduler-lambda-1.0.0.jar')),
      environment: {
        BARBERS_TABLE: barbersTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    const getBarberFn = new lambda.Function(this, 'GetBarberFunction', {
      runtime: lambda.Runtime.JAVA_21,
      handler: 'com.barbershop.handler.GetBarberHandler::handleRequest',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/target/barber-scheduler-lambda-1.0.0.jar')),
      environment: {
        BARBERS_TABLE: barbersTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    const updateBarberFn = new lambda.Function(this, 'UpdateBarberFunction', {
      runtime: lambda.Runtime.JAVA_21,
      handler: 'com.barbershop.handler.UpdateBarberHandler::handleRequest',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/target/barber-scheduler-lambda-1.0.0.jar')),
      environment: {
        BARBERS_TABLE: barbersTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    const deleteBarberFn = new lambda.Function(this, 'DeleteBarberFunction', {
      runtime: lambda.Runtime.JAVA_21,
      handler: 'com.barbershop.handler.DeleteBarberHandler::handleRequest',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/target/barber-scheduler-lambda-1.0.0.jar')),
      environment: {
        BARBERS_TABLE: barbersTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    // Grant DynamoDB permissions explicitly
    barbersTable.grantReadWriteData(createBarberFn);
    barbersTable.grantReadWriteData(getBarbersListFn);
    barbersTable.grantReadWriteData(getBarberFn);
    barbersTable.grantReadWriteData(updateBarberFn);
    barbersTable.grantReadWriteData(deleteBarberFn);

    // API Gateway
    const api = new apigateway.RestApi(this, 'BarberSchedulerApi', {
      restApiName: 'Barber Scheduler API',
      description: 'API for Barber Shop Scheduler',
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'], // Allow all origins for development
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // /barbers resource
    const barbers = api.root.addResource('barbers');
    barbers.addMethod('POST', new apigateway.LambdaIntegration(createBarberFn));
    barbers.addMethod('GET', new apigateway.LambdaIntegration(getBarbersListFn));

    // /barbers/{barberId} resource
    const barber = barbers.addResource('{barberId}');
    barber.addMethod('GET', new apigateway.LambdaIntegration(getBarberFn));
    barber.addMethod('PUT', new apigateway.LambdaIntegration(updateBarberFn));
    barber.addMethod('DELETE', new apigateway.LambdaIntegration(deleteBarberFn));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
      exportName: 'BarberSchedulerApiUrl',
    });

    new cdk.CfnOutput(this, 'BarbersTableName', {
      value: barbersTable.tableName,
      description: 'Barbers DynamoDB Table',
    });
  }
}
