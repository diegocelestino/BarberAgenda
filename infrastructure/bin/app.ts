#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BarbershopStack } from '../lib/barbershop-stack';

const app = new cdk.App();

// Get environment from context or default to 'dev'
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'dev';

new BarbershopStack(app, `BarbershopStack-${environment}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'sa-east-1',
  },
  environment,
});
