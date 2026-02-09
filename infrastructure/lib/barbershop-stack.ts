import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';
import * as path from 'path';

export class BarbershopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========================================
    // Backend - DynamoDB + Lambda + API Gateway
    // ========================================

    // DynamoDB Table - Barbers
    const barbersTable = new dynamodb.Table(this, 'BarbersTable', {
      partitionKey: { name: 'barberId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // DynamoDB Table - Appointments
    const appointmentsTable = new dynamodb.Table(this, 'AppointmentsTable', {
      partitionKey: { name: 'barberId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'appointmentId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // GSI for querying appointments by date
    appointmentsTable.addGlobalSecondaryIndex({
      indexName: 'DateIndex',
      partitionKey: { name: 'barberId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'startTime', type: dynamodb.AttributeType.NUMBER },
    });

    // DynamoDB Table - Services
    const servicesTable = new dynamodb.Table(this, 'ServicesTable', {
      partitionKey: { name: 'serviceId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda Functions for Barbers CRUD (Java 21)
    const createBarberFn = new lambda.Function(this, 'CreateBarberFunction', {
      runtime: lambda.Runtime.JAVA_21,
      handler: 'com.barbershop.handler.CreateBarberHandler::handleRequest',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambda/target/barber-scheduler-lambda-1.0.0.jar')),
      environment: {
        BARBERS_TABLE: barbersTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    const getBarbersListFn = new lambda.Function(this, 'GetBarbersListFunction', {
      runtime: lambda.Runtime.JAVA_21,
      handler: 'com.barbershop.handler.GetBarbersListHandler::handleRequest',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambda/target/barber-scheduler-lambda-1.0.0.jar')),
      environment: {
        BARBERS_TABLE: barbersTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    const getBarberFn = new lambda.Function(this, 'GetBarberFunction', {
      runtime: lambda.Runtime.JAVA_21,
      handler: 'com.barbershop.handler.GetBarberHandler::handleRequest',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambda/target/barber-scheduler-lambda-1.0.0.jar')),
      environment: {
        BARBERS_TABLE: barbersTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    const updateBarberFn = new lambda.Function(this, 'UpdateBarberFunction', {
      runtime: lambda.Runtime.JAVA_21,
      handler: 'com.barbershop.handler.UpdateBarberHandler::handleRequest',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambda/target/barber-scheduler-lambda-1.0.0.jar')),
      environment: {
        BARBERS_TABLE: barbersTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    const deleteBarberFn = new lambda.Function(this, 'DeleteBarberFunction', {
      runtime: lambda.Runtime.JAVA_21,
      handler: 'com.barbershop.handler.DeleteBarberHandler::handleRequest',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambda/target/barber-scheduler-lambda-1.0.0.jar')),
      environment: {
        BARBERS_TABLE: barbersTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
    });

    // Grant DynamoDB permissions
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
        allowOrigins: ['*'],
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

    // ========================================
    // Frontend - S3 + CloudFront
    // ========================================

    // S3 Bucket for hosting static website
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.HttpOrigin(websiteBucket.bucketWebsiteDomainName, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
    });

    // ========================================
    // Outputs
    // ========================================

    // Backend Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
      exportName: 'BarbershopApiUrl',
    });

    new cdk.CfnOutput(this, 'BarbersTableName', {
      value: barbersTable.tableName,
      description: 'Barbers DynamoDB Table',
    });

    new cdk.CfnOutput(this, 'AppointmentsTableName', {
      value: appointmentsTable.tableName,
      description: 'Appointments DynamoDB Table',
    });

    new cdk.CfnOutput(this, 'ServicesTableName', {
      value: servicesTable.tableName,
      description: 'Services DynamoDB Table',
    });

    // Frontend Outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 Bucket Name',
    });

    new cdk.CfnOutput(this, 'BucketWebsiteURL', {
      value: websiteBucket.bucketWebsiteUrl,
      description: 'S3 Website URL',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'CloudFront Distribution Domain',
    });

    new cdk.CfnOutput(this, 'DistributionURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront URL',
    });
  }
}
