import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';
import * as path from 'path';

export class BarbershopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
      BARBERSHOP_EMAIL: process.env.BARBERSHOP_EMAIL || ''
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

    // /barbers
    const barbers = api.root.addResource('barbers');
    barbers.addMethod('GET',  int(listBarbersFn));
    barbers.addMethod('POST', int(createBarberFn));

    // /barbers/{barberId}
    const barber = barbers.addResource('{barberId}');
    barber.addMethod('GET',    int(getBarberFn));
    barber.addMethod('PUT',    int(updateBarberFn));
    barber.addMethod('DELETE', int(deleteBarberFn));

    // /barbers/{barberId}/appointments
    const appointments = barber.addResource('appointments');
    appointments.addMethod('GET',  int(listAppointmentsFn));
    appointments.addMethod('POST', int(createAppointmentFn));

    // /barbers/{barberId}/appointments/{appointmentId}
    const appointment = appointments.addResource('{appointmentId}');
    appointment.addMethod('GET',    int(getAppointmentFn));
    appointment.addMethod('PUT',    int(updateAppointmentFn));
    appointment.addMethod('DELETE', int(deleteAppointmentFn));

    // /services
    const services = api.root.addResource('services');
    services.addMethod('GET',  int(listServicesFn));
    services.addMethod('POST', int(createServiceFn));

    // /services/{serviceId}
    const service = services.addResource('{serviceId}');
    service.addMethod('GET',    int(getServiceFn));
    service.addMethod('PUT',    int(updateServiceFn));
    service.addMethod('DELETE', int(deleteServiceFn));

    // /auth/login
    const auth = api.root.addResource('auth');
    auth.addResource('login').addMethod('POST', int(loginFn));

    // /notifications/email
    const notifications = api.root.addResource('notifications');
    notifications.addResource('email').addMethod('POST', int(sendEmailFn));

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
      exportName: 'BarbershopApiUrl',
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
