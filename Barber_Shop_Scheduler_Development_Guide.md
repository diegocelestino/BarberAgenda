# Barber Shop Scheduler - Backend Development Guide

## Phase 2: Backend Development (AWS CDK)

### Step 4: Initialize CDK Project

Navigate to your backend directory and initialize the CDK project:
cd backend
cdk init app --language typescript
npm install

This creates the basic CDK project structure with TypeScript configuration.

### Step 5: Create CDK Stack

Install required CDK libraries:

npm install @aws-cdk/aws-apigateway @aws-cdk/aws-lambda @aws-cdk/aws-dynamodb

Create your infrastructure stack in `lib/barber-scheduler-stack.ts`:

#### CREATE

**DynamoDB Tables:**
- Barbers table (partition key: barberId)

**Lambda Functions:**
- complete CRUD for Barber

**API Gateway:**
- REST API with Lambda integration
- CORS configuration for Vercel domain
- Resource paths: /barbers
- Methods: GET, POST, PUT, DELETE

**CORS Configuration:**

defaultCorsPreflightOptions: {
  allowOrigins: ['https://your-app.vercel.app', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}

### Step 6: Write Lambda Functions

Create Lambda handlers in `backend/lambda/` directory:

**Directory Structure:**

**Lambda Function Guidelines:**
- Use AWS SDK v3 for DynamoDB operations
- Implement proper error handling and validation
- Return consistent response format (statusCode, body, headers)
- Add CORS headers to all responses
- Use environment variables for table names
- Keep functions under 15 seconds execution time

**Example Response Format:**

### Step 7: Bootstrap AWS Environment

Bootstrap your AWS account for CDK (one-time setup):

cdk bootstrap aws://818932889676/sa-east-1 

Replace ACCOUNT-ID with your AWS account ID and REGION with your preferred region (e.g., us-east-1).

**Verification:**
- Check AWS CloudFormation console for CDKToolkit stack
- Verify S3 bucket created for CDK assets

### Step 8: Deploy Backend

**Synthesize CloudFormation Template:**

This generates the CloudFormation template and validates your CDK code.

**Deploy to AWS:**

**During Deployment:**
- Review the changes and confirm
- Wait for stack creation (5-10 minutes)
- Note the API Gateway URL in the output

**Save Important Outputs:**
- API Gateway endpoint URL
- DynamoDB table names
- Lambda function ARNs

**Verify Deployment:**
- Check AWS Console for created resources
- Test API endpoints using Postman or curl
- Verify DynamoDB tables are created

## Phase 3: Frontend Development (React + Vercel)

### Step 9: Create React Application

Navigate to frontend directory:

cd frontend
npx create-react-app . --template typescript
npm install axios react-router-dom

**Project Structure:**
Project Structure:

frontend/
├── src/
│   ├── components/
│   │   ├── AppointmentForm.tsx
│   │   ├── AppointmentList.tsx
│   │   ├── BarberCard.tsx
│   │   └── Calendar.tsx
│   ├── services/
│   │   └── api.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Booking.tsx
│   │   └── MyAppointments.tsx
│   ├── App.tsx
│   └── index.tsx
└── .env

### Step 10: Configure API Integration

Create `.env` file in frontend directory:

**Create API Service (`src/services/api.ts`):**
- Configure axios with base URL from environment variable
- Implement functions for all API endpoints
- Add error handling and request/response interceptors
- Handle loading states and error messages

**API Functions to Implement:**
- getAvailability(barberId, date)
- createAppointment(appointmentData)
- getAppointments(customerId)
- updateAppointment(appointmentId, data)
- cancelAppointment(appointmentId)

**Test Locally:**

Access at http://localhost:3000

### Step 11: Connect to Vercel

**Setup Steps:**
1. Go to vercel.com and sign in with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: Create React App
   - Root Directory: frontend/
   - Build Command: npm run build
   - Output Directory: build
5. Add Environment Variables:
   - Key: REACTAPPAPI_URL
   - Value: Your API Gateway URL from Step 8
6. Click "Deploy"

### Step 12: Deploy Frontend

**Automatic Deployment:**
- Push code to GitHub main branch
- Vercel automatically detects changes
- Builds and deploys your app
- Provides deployment URL

**Get Your App URL:**
- Check Vercel dashboard for deployment URL
- Format: https://your-app-name.vercel.app
- Custom domain can be added later

**Verify Deployment:**
- Visit your Vercel URL
- Test appointment booking flow
- Check browser console for errors
- Verify API calls are successful

## Phase 4: CORS Configuration

### Step 13: Update Backend CORS

Update your CDK stack with the actual Vercel URL:

**Redeploy Backend:**

**Test CORS:**
- Make API calls from Vercel app
- Check browser network tab for CORS errors
- Verify OPTIONS preflight requests succeed

## Phase 5: CI/CD Automation

### Step 14: Set Up Backend CI/CD (GitHub Actions)

Create `.github/workflows/deploy-backend.yml` in repository root:

**Configure GitHub Secrets:**
1. Go to repository Settings → Secrets and variables → Actions
2. Add secrets:
   - AWSACCESSKEY_ID
   - AWSSECRETACCESS_KEY

**Security Best Practice:**
- Create IAM user specifically for GitHub Actions
- Grant minimum required permissions
- Use temporary credentials when possible

### Step 15: Frontend CI/CD (Vercel)

Already Configured! Vercel automatically:
- Deploys on every push to main branch
- Creates preview deployments for pull requests
- Provides deployment status in GitHub
- Rolls back on deployment failures

**Vercel Features:**
- Instant rollbacks to previous deployments
- Environment variables per branch
- Custom domains and SSL certificates
- Analytics and performance monitoring

## Phase 6: Testing & Iteration

### Step 16: End-to-End Testing

**Backend Testing:**
- Test each Lambda function individually
- Verify DynamoDB data persistence
- Check API Gateway responses
- Monitor CloudWatch logs for errors

**Frontend Testing:**
- Test appointment booking flow
- Verify data displays correctly
- Check responsive design on mobile
- Test error handling scenarios

**Integration Testing:**
- Book appointment from Vercel app
- Verify data saved in DynamoDB
- Test update and cancel operations
- Check availability updates in real-time

### Step 17: Monitor & Optimize

**AWS Monitoring:**
- CloudWatch Logs for Lambda functions
- API Gateway metrics (latency, errors)
- DynamoDB capacity and throttling
- Set up CloudWatch alarms for errors

**Vercel Monitoring:**
- Deployment logs and build times
- Web Vitals and performance metrics
- Error tracking and debugging
- Bandwidth and function usage

**Optimization Opportunities:**
- Add DynamoDB indexes for common queries
- Implement Lambda function caching
- Optimize React bundle size
- Add loading states and error boundaries

## Quick Reference Commands

**Backend (CDK):**

**Frontend (Local Development):**

**Git Workflow:**

## Database Schema Design

**Appointments Table:**
- appointmentId (String, Primary Key)
- customerId (String)
- barberId (String)
- date (String, ISO format)
- time (String)
- service (String)
- status (String: pending, confirmed, completed, cancelled)
- createdAt (Number, timestamp)

**Customers Table:**
- customerId (String, Primary Key)
- name (String)
- email (String)
- phone (String)
- createdAt (Number, timestamp)

**Barbers Table:**
- barberId (String, Primary Key)
- name (String)
- specialties (List)
- rating (Number)
- photoUrl (String)

**Availability Table:**
- barberId (String, Primary Key)
- date (String, Sort Key)
- availableSlots (List of time strings)
- bookedSlots (List of time strings)

## Cost Estimation (Monthly)

**AWS Free Tier Coverage:**
- Lambda: 1M requests, 400,000 GB-seconds
- DynamoDB: 25GB storage, 25 read/write units
- API Gateway: 1M API calls
- Data Transfer: 1GB out

**Vercel Free Tier:**
- Unlimited deployments
- 100GB bandwidth
- Serverless function executions

**Expected Costs for Small App:**
- AWS: $0-5/month (within free tier)
- Vercel: $0/month (free tier)
- Total: ~$0-5/month

## Next Steps

- Implement Authentication: Add AWS Cognito or Auth0
- Add Notifications: Email/SMS confirmations using SNS
- Payment Integration: Stripe or PayPal for deposits
- Admin Dashboard: Manage barbers and view analytics
- Mobile App: React Native version
- Advanced Features: Recurring appointments, waitlist, reviews

## Troubleshooting Common Issues

**CDK Deploy Fails:**
- Verify AWS credentials are configured
- Check IAM permissions
- Ensure unique stack name

**CORS Errors:**
- Verify Vercel URL in CORS configuration
- Check API Gateway CORS settings
- Ensure OPTIONS method is enabled

**Lambda Timeout:**
- Increase timeout in CDK (default 3s, max 15min)
- Optimize DynamoDB queries
- Check for infinite loops

**Vercel Build Fails:**
- Check environment variables are set
- Verify build command is correct
- Review build logs for errors

## Resources

- AWS CDK Documentation
- React Documentation
- Vercel Documentation
- DynamoDB Best Practices
- API Gateway CORS
