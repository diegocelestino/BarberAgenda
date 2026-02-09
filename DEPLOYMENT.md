# Barbershop Deployment Guide

## Prerequisites
- AWS CLI configured with credentials
- Node.js and npm installed
- Java 21 and Maven installed
- AWS CDK installed globally: `npm install -g aws-cdk`

## Step 1: Build the Lambda Functions

```bash
cd backend/lambda
mvn clean package
```

This creates `target/barber-scheduler-lambda-1.0.0.jar`

## Step 2: Deploy Infrastructure

```bash
cd ../../infrastructure
npm install
npm run build
cdk bootstrap  # Only needed once per AWS account/region
cdk deploy
```

This will:
- Create DynamoDB tables (Barbers, Appointments, Services, Users)
- Deploy Lambda functions (Barbers CRUD + Auth)
- Create API Gateway with routes
- Create S3 bucket and CloudFront distribution
- Output the API URL and CloudFront URL

## Step 3: Seed Admin User

After deployment, get the Users table name from the stack outputs:

```bash
# Set the table name from CDK output
export USERS_TABLE_NAME=<YourUsersTableName>
export AWS_REGION=us-east-1  # or your region

# Run the seed script
npm run seed-admin
```

This creates an admin user:
- Username: `admin`
- Password: `admin`

## Step 4: Update Frontend Environment

The deployment automatically updates `frontend/.env.local` with the API URL.

Verify it:
```bash
cat ../frontend/.env.local
```

Should show:
```
REACT_APP_API_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/
REACT_APP_ENV=production
```

## Step 5: Build and Deploy Frontend

```bash
cd ../frontend
npm install
npm run build:prod

# Upload to S3 (replace with your bucket name from CDK output)
aws s3 sync build/ s3://<your-bucket-name>/ --delete

# Invalidate CloudFront cache (replace with your distribution ID)
aws cloudfront create-invalidation --distribution-id <your-distribution-id> --paths "/*"
```

## Step 6: Access the Application

- **Public Site**: `https://<cloudfront-domain>`
- **Admin Login**: `https://<cloudfront-domain>/login`
  - Username: `admin`
  - Password: `admin`

## API Endpoints

Your API Gateway will have these routes:

### Barbers
- `POST /barbers` - Create barber
- `GET /barbers` - List all barbers
- `GET /barbers/{barberId}` - Get barber details
- `PUT /barbers/{barberId}` - Update barber
- `DELETE /barbers/{barberId}` - Delete barber

### Auth
- `POST /auth/login` - Login (returns user + token)

## Troubleshooting

### "Missing Authentication Token" error
- Check that the API URL in `.env.local` ends with `/prod/`
- Verify the Lambda functions are deployed
- Check API Gateway routes in AWS Console

### Login fails
- Verify admin user was seeded: Check DynamoDB Users table
- Check Lambda logs in CloudWatch
- Verify USERS_TABLE environment variable in Lambda

### Frontend shows old content
- Invalidate CloudFront cache
- Clear browser cache
- Check S3 bucket has latest files

## Security Notes

⚠️ **For Production:**
1. Change admin password immediately
2. Implement password hashing (bcrypt)
3. Use proper JWT tokens instead of mock tokens
4. Add API authentication/authorization
5. Restrict CORS to your domain only
6. Enable CloudFront HTTPS only
7. Add rate limiting to API Gateway
8. Use AWS Secrets Manager for credentials
