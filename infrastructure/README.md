# Barbershop Infrastructure

AWS CDK infrastructure for the Barbershop application, deploying both backend and frontend resources.

## Architecture

### Backend
- **DynamoDB**: Barbers table
- **Lambda**: Java 21 functions for CRUD operations
- **API Gateway**: REST API endpoints

### Frontend
- **S3**: Static website hosting
- **CloudFront**: CDN distribution

## Prerequisites

- Node.js 18+
- AWS CLI configured
- AWS CDK CLI: `npm install -g aws-cdk`
- Backend Lambda built: `cd ../backend/lambda && mvn clean package`

## Setup

```bash
npm install
```

## Deploy

```bash
npm run deploy
```

This will:
1. Deploy the CDK stack to AWS
2. Update the frontend `.env` file with the API URL

## Useful Commands

- `npm run build` - Compile TypeScript
- `npm run watch` - Watch for changes
- `npm run test` - Run tests
- `cdk diff` - Compare deployed stack with current state
- `cdk synth` - Emit the synthesized CloudFormation template
- `cdk deploy` - Deploy this stack to your default AWS account/region
- `cdk destroy` - Remove the stack from AWS
