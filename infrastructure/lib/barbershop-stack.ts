import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';
import * as path from 'path';

export interface BarbershopStackProps extends cdk.StackProps {
  environment?: string;
}

export class BarbershopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: BarbershopStackProps) {
    super(scope, id, props);

    const environment = props?.environment || 'dev';

    // Get email from context or environment
    const barbershopEmail = this.node.tryGetContext('barbershopEmail') || process.env.BARBERSHOP_EMAIL;

    // Cognito User Pool
    // ========================================

    const userPool = new cognito.UserPool(this, 'BarbershopUserPool', {
      userPoolName: 'barbershop-users',
      selfSignUpEnabled: false, // Only admins can create users
      signInAliases: {
        username: true,
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'BarbershopUserPoolClient', {
      userPool,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      generateSecret: false,
      preventUserExistenceErrors: true,
    });

    // Create Cognito Authorizer for API Gateway
    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [userPool],
      authorizerName: 'BarbershopAuthorizer',
      identitySource: 'method.request.header.Authorization',
    });

    // ========================================
    // DynamoDB Tables
    // ========================================

    const barbersTable = new dynamodb.Table(this, 'BarbersTable', {
      partitionKey: { name: 'barberId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const servicesTable = new dynamodb.Table(this, 'ServicesTable', {
      partitionKey: { name: 'serviceId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const appointmentsTable = new dynamodb.Table(this, 'AppointmentsTable', {
      partitionKey: { name: 'barberId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'appointmentId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    appointmentsTable.addGlobalSecondaryIndex({
      indexName: 'DateIndex',
      partitionKey: { name: 'barberId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'startTime', type: dynamodb.AttributeType.NUMBER },
    });

    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      partitionKey: { name: 'username', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ========================================
    // Lambda helper
    // ========================================

    const lambdaDir = path.join(__dirname, '../../backend/lambda-ts');

    const makeFn = (id: string, handler: string, env: Record<string, string>) =>
      new lambda.Function(this, id, {
        runtime: lambda.Runtime.NODEJS_22_X,
        handler,
        code: lambda.Code.fromAsset(lambdaDir, {
          bundling: {
            image: lambda.Runtime.NODEJS_22_X.bundlingImage,
            command: [
              'bash', '-c',
              'export npm_config_cache=/tmp/.npm && npm ci && npm run build && cp -r dist /asset-output && cp -r node_modules /asset-output',
            ],
          },
        }),
        environment: env,
        timeout: cdk.Duration.seconds(10),
        memorySize: 256,
      });

    // ========================================
    // Barber functions
    // ========================================

    const barberEnv = { BARBERS_TABLE: barbersTable.tableName };

    const listBarbersFn    = makeFn('ListBarbersFunction',   'dist/barbers/list.handler',   barberEnv);
    const getBarberFn      = makeFn('GetBarberFunction',     'dist/barbers/get.handler',    barberEnv);
    const createBarberFn   = makeFn('CreateBarberFunction',  'dist/barbers/create.handler', barberEnv);
    const updateBarberFn   = makeFn('UpdateBarberFunction',  'dist/barbers/update.handler', barberEnv);
    const deleteBarberFn   = makeFn('DeleteBarberFunction',  'dist/barbers/delete.handler', barberEnv);

    barbersTable.grantReadData(listBarbersFn);
    barbersTable.grantReadData(getBarberFn);
    barbersTable.grantReadWriteData(createBarberFn);
    barbersTable.grantReadWriteData(updateBarberFn);
    barbersTable.grantReadWriteData(deleteBarberFn);

    // ========================================
    // Service functions
    // ========================================

    const serviceEnv = { SERVICES_TABLE: servicesTable.tableName };

    const listServicesFn   = makeFn('ListServicesFunction',   'dist/services/list.handler',   serviceEnv);
    const getServiceFn     = makeFn('GetServiceFunction',     'dist/services/get.handler',    serviceEnv);
    const createServiceFn  = makeFn('CreateServiceFunction',  'dist/services/create.handler', serviceEnv);
    const updateServiceFn  = makeFn('UpdateServiceFunction',  'dist/services/update.handler', serviceEnv);
    const deleteServiceFn  = makeFn('DeleteServiceFunction',  'dist/services/delete.handler', serviceEnv);

    servicesTable.grantReadData(listServicesFn);
    servicesTable.grantReadData(getServiceFn);
    servicesTable.grantReadWriteData(createServiceFn);
    servicesTable.grantReadWriteData(updateServiceFn);
    servicesTable.grantReadWriteData(deleteServiceFn);

    // ========================================
    // Appointment functions
    // ========================================

    const apptEnv = { APPOINTMENTS_TABLE: appointmentsTable.tableName };

    const listAppointmentsFn   = makeFn('ListAppointmentsFunction',   'dist/appointments/list.handler',   apptEnv);
    const getAppointmentFn     = makeFn('GetAppointmentFunction',     'dist/appointments/get.handler',    apptEnv);
    const createAppointmentFn  = makeFn('CreateAppointmentFunction',  'dist/appointments/create.handler', apptEnv);
    const updateAppointmentFn  = makeFn('UpdateAppointmentFunction',  'dist/appointments/update.handler', apptEnv);
    const deleteAppointmentFn  = makeFn('DeleteAppointmentFunction',  'dist/appointments/delete.handler', apptEnv);

    appointmentsTable.grantReadData(listAppointmentsFn);
    appointmentsTable.grantReadData(getAppointmentFn);
    appointmentsTable.grantReadWriteData(createAppointmentFn);
    appointmentsTable.grantReadWriteData(updateAppointmentFn);
    appointmentsTable.grantReadWriteData(deleteAppointmentFn);

    // ========================================
    // Auth functions
    // ========================================

    const loginFn = makeFn('LoginFunction', 'dist/auth/login.handler', { USERS_TABLE: usersTable.tableName });
    usersTable.grantReadData(loginFn);

    // ========================================
    // Notification functions
    // ========================================

    const sendEmailFn = makeFn('SendEmailFunction', 'dist/notifications/sendEmail.handler', { 
      BARBERSHOP_EMAIL: barbershopEmail
    });
    
    // Grant SES permissions
    sendEmailFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
    }));

    // ========================================
    // API Gateway
    // ========================================

    const api = new apigateway.RestApi(this, 'BarberSchedulerApi', {
      restApiName: 'Barber Scheduler API',
      description: 'API for Barber Shop Scheduler',
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    const int = (fn: lambda.Function) => new apigateway.LambdaIntegration(fn);

    // Method options for protected endpoints
    const protectedMethodOptions: apigateway.MethodOptions = {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    // /barbers
    const barbers = api.root.addResource('barbers');
    barbers.addMethod('GET',  int(listBarbersFn)); // Public - anyone can view barbers
    barbers.addMethod('POST', int(createBarberFn), protectedMethodOptions); // Protected

    // /barbers/{barberId}
    const barber = barbers.addResource('{barberId}');
    barber.addMethod('GET',    int(getBarberFn)); // Public
    barber.addMethod('PUT',    int(updateBarberFn), protectedMethodOptions); // Protected
    barber.addMethod('DELETE', int(deleteBarberFn), protectedMethodOptions); // Protected

    // /barbers/{barberId}/appointments
    const appointments = barber.addResource('appointments');
    appointments.addMethod('GET',  int(listAppointmentsFn)); // Public - view availability
    appointments.addMethod('POST', int(createAppointmentFn)); // Public - anyone can book

    // /barbers/{barberId}/appointments/{appointmentId}
    const appointment = appointments.addResource('{appointmentId}');
    appointment.addMethod('GET',    int(getAppointmentFn)); // Public
    appointment.addMethod('PUT',    int(updateAppointmentFn), protectedMethodOptions); // Protected
    appointment.addMethod('DELETE', int(deleteAppointmentFn), protectedMethodOptions); // Protected

    // /services
    const services = api.root.addResource('services');
    services.addMethod('GET',  int(listServicesFn)); // Public
    services.addMethod('POST', int(createServiceFn), protectedMethodOptions); // Protected

    // /services/{serviceId}
    const service = services.addResource('{serviceId}');
    service.addMethod('GET',    int(getServiceFn)); // Public
    service.addMethod('PUT',    int(updateServiceFn), protectedMethodOptions); // Protected
    service.addMethod('DELETE', int(deleteServiceFn), protectedMethodOptions); // Protected

    // /auth/login - No longer needed, Cognito handles this
    // Keep for backward compatibility but can be removed later
    const auth = api.root.addResource('auth');
    auth.addResource('login').addMethod('POST', int(loginFn));

    // /notifications/email
    const notifications = api.root.addResource('notifications');
    notifications.addResource('email').addMethod('POST', int(sendEmailFn), protectedMethodOptions); // Protected

    // ========================================
    // Frontend - S3 + CloudFront
    // ========================================

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

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
      exportName: `BarbershopApiUrl-${environment}`,
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `BarbershopUserPoolId-${environment}`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `BarbershopUserPoolClientId-${environment}`,
    });

    new cdk.CfnOutput(this, 'BarbersTableName', { value: barbersTable.tableName });
    new cdk.CfnOutput(this, 'AppointmentsTableName', { value: appointmentsTable.tableName });
    new cdk.CfnOutput(this, 'ServicesTableName', { value: servicesTable.tableName });
    new cdk.CfnOutput(this, 'UsersTableName', { value: usersTable.tableName });
    new cdk.CfnOutput(this, 'BucketName', { value: websiteBucket.bucketName });
    new cdk.CfnOutput(this, 'BucketWebsiteURL', { value: websiteBucket.bucketWebsiteUrl });
    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    new cdk.CfnOutput(this, 'DistributionDomainName', { value: distribution.distributionDomainName });
    new cdk.CfnOutput(this, 'DistributionURL', { value: `https://${distribution.distributionDomainName}` });
  }
}
