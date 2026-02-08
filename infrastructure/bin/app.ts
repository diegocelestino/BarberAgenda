#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BarbershopStack } from '../lib/barbershop-stack';

const app = new cdk.App();

new BarbershopStack(app, 'BarbershopStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
