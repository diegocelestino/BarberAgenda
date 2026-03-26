# BarberAgenda - Architecture Documentation

## Overview

BarberAgenda is a modern, serverless barbershop appointment scheduling system built on AWS. The application follows a three-tier architecture with a React frontend, serverless API backend, and NoSQL database layer, all deployed using Infrastructure as Code (IaC) principles.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React SPA (TypeScript)                                   │   │
│  │  - Material-UI Components                                 │   │
│  │  - Redux Toolkit State Management                         │   │
│  │  - React Router (Client-side routing)                     │   │
│  │  - Axios HTTP Client                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONTENT DELIVERY                            │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │  CloudFront CDN  │────────▶│  S3 Static Site  │             │
│  │  (Global Edge)   │         │  (Website Bucket)│             │
│  └──────────────────┘         └──────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Gateway (REST API)                                   │   │
│  │  - CORS enabled                                           │   │
│  │  - Resource-based routing                                │   │
│  │  - Lambda proxy integration                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Invokes
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      COMPUTE LAYER                               │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  AWS Lambda Functions (Node.js 22.x)                   │     │
│  │                                                         │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │     │
│  │  │   Barbers    │  │ Appointments │  │  Services   │ │     │
│  │  │   (5 fns)    │  │   (5 fns)    │  │   (5 fns)   │ │     │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │     │
│  │                                                         │     │
│  │  ┌──────────────┐  ┌──────────────┐                   │     │
│  │  │     Auth     │  │Notifications │                   │     │
│  │  │   (1 fn)     │  │   (1 fn)     │                   │     │
│  │  └──────────────┘  └──────────────┘                   │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SDK Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  DynamoDB Tables (NoSQL)                                  │   │
│  │                                                           │   │
│  │  ┌─────────────────┐  ┌─────────────────┐              │   │
│  │  │  BarbersTable   │  │ ServicesTable   │              │   │
│  │  │  PK: barberId   │  │  PK: serviceId  │              │   │
│  │  └─────────────────┘  └─────────────────┘              │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────┐                   │   │
│  │  │    AppointmentsTable             │                   │   │
│  │  │    PK: barberId                  │                   │   │
│  │  │    SK: appointmentId             │                   │   │
│  │  │    GSI: DateIndex (startTime)    │                   │   │
│  │  └──────────────────────────────────┘                   │   │
│  │                                                           │   │
│  │  ┌─────────────────┐                                    │   │
│  │  │   UsersTable    │                                    │   │
│  │  │   PK: username  │                                    │   │
│  │  └─────────────────┘                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Amazon SES (Simple Email Service)                        │   │
│  │  - Appointment confirmation emails                        │   │
│  │  - Notification delivery                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18.2 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit with async thunks
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Date Handling**: date-fns, MUI X Date Pickers
- **Build Tool**: Create React App (Webpack)
- **Testing**: Jest, React Testing Library

### Backend
- **Runtime**: Node.js 22.x
- **Language**: TypeScript
- **Framework**: AWS Lambda (serverless functions)
- **API**: AWS API Gateway (REST)
- **Database SDK**: AWS SDK v3 (DynamoDB client)
- **Build**: TypeScript compiler with CDK bundling

### Infrastructure
- **IaC Tool**: AWS CDK (Cloud Development Kit) v2
- **Language**: TypeScript
- **Region**: sa-east-1 (São Paulo, Brazil)
- **Deployment**: GitHub Actions CI/CD

### AWS Services
- **Compute**: AWS Lambda
- **API**: Amazon API Gateway
- **Database**: Amazon DynamoDB
- **Storage**: Amazon S3
- **CDN**: Amazon CloudFront
- **Email**: Amazon SES
- **IAM**: AWS Identity and Access Management

## System Components

### 1. Frontend Application

#### Structure
```
frontend/src/
├── components/          # Reusable React components
│   ├── appointments/    # Appointment management UI
│   ├── auth/           # Authentication components
│   ├── barbers/        # Barber management UI
│   ├── scheduling/     # Multi-step booking wizard
│   └── services/       # Service management UI
├── pages/              # Route-level page components
├── store/              # Redux slices and thunks
│   ├── appointments/
│   ├── barbers/
│   └── services/
├── services/           # API client modules
├── contexts/           # React contexts (Auth)
└── config/             # Configuration files
```

#### Key Features
- **Public Booking Flow**: Multi-step wizard for customers to book appointments
- **Admin Panel**: Protected routes for managing barbers, services, and appointments
- **Real-time Availability**: Dynamic slot calculation based on barber schedules
- **Responsive Design**: Mobile-first approach with Material-UI
- **State Management**: Centralized Redux store with normalized data
- **Authentication**: Context-based auth with protected routes

#### State Management
- **Redux Toolkit**: Modern Redux with less boilerplate
- **Async Thunks**: Handle API calls with loading/error states
- **Normalized State**: Separate slices for barbers, appointments, services
- **Selectors**: Memoized selectors for derived data

### 2. Backend API

#### Lambda Functions (17 total)

**Barbers Domain** (5 functions)
- `list.handler` - GET /barbers - List all barbers
- `get.handler` - GET /barbers/{barberId} - Get barber details
- `create.handler` - POST /barbers - Create new barber
- `update.handler` - PUT /barbers/{barberId} - Update barber
- `delete.handler` - DELETE /barbers/{barberId} - Delete barber

**Appointments Domain** (5 functions)
- `list.handler` - GET /barbers/{barberId}/appointments - List appointments
- `get.handler` - GET /barbers/{barberId}/appointments/{appointmentId}
- `create.handler` - POST /barbers/{barberId}/appointments
- `update.handler` - PUT /barbers/{barberId}/appointments/{appointmentId}
- `delete.handler` - DELETE /barbers/{barberId}/appointments/{appointmentId}

**Services Domain** (5 functions)
- `list.handler` - GET /services - List all services
- `get.handler` - GET /services/{serviceId} - Get service details
- `create.handler` - POST /services - Create new service
- `update.handler` - PUT /services/{serviceId} - Update service
- `delete.handler` - DELETE /services/{serviceId} - Delete service

**Auth Domain** (1 function)
- `login.handler` - POST /auth/login - User authentication

**Notifications Domain** (1 function)
- `sendEmail.handler` - POST /notifications/email - Send email via SES

#### Lambda Configuration
- **Runtime**: Node.js 22.x
- **Memory**: 256 MB
- **Timeout**: 10 seconds
- **Bundling**: Automated via CDK with npm dependencies
- **Environment Variables**: Table names injected per function

#### Shared Utilities
- `utils/dynamodb.ts` - Shared DynamoDB client (connection reuse)
- `utils/response.ts` - Standardized HTTP response helpers

### 3. Database Schema

#### DynamoDB Tables

**BarbersTable**
```
Partition Key: barberId (String)
Attributes:
  - barberId: UUID
  - name: String
  - serviceIds: String[] (list of service IDs)
  - rating: Number (1-5)
  - photoUrl: String (optional)
  - schedule: Object (optional)
    - openTime: String (HH:MM)
    - closeTime: String (HH:MM)
    - lunchStart: String (HH:MM)
    - lunchEnd: String (HH:MM)
    - workDays: Number[] (0=Sun, 6=Sat)
    - slotInterval: Number (minutes)
  - createdAt: Number (timestamp)
```

**ServicesTable**
```
Partition Key: serviceId (String)
Attributes:
  - serviceId: UUID
  - name: String
  - description: String
  - duration: Number (minutes)
  - price: Number
  - createdAt: Number (timestamp)
```

**AppointmentsTable**
```
Partition Key: barberId (String)
Sort Key: appointmentId (String)
GSI: DateIndex
  - PK: barberId
  - SK: startTime (Number)
Attributes:
  - barberId: String
  - appointmentId: UUID
  - customerName: String
  - customerPhone: String
  - service: String (service ID)
  - startTime: Number (Unix timestamp)
  - endTime: Number (Unix timestamp)
  - notes: String (optional)
  - status: String (scheduled, completed, cancelled)
  - createdAt: Number (timestamp)
```

**UsersTable**
```
Partition Key: username (String)
Attributes:
  - username: String
  - password: String (plain text - needs hashing in production)
  - role: String (admin, barber)
  - createdAt: Number (timestamp)
```

#### Access Patterns
1. List all barbers → Scan BarbersTable
2. Get barber by ID → GetItem on BarbersTable
3. List appointments for barber → Query AppointmentsTable by barberId
4. List appointments by date range → Query DateIndex GSI
5. Get specific appointment → GetItem with barberId + appointmentId
6. Authenticate user → GetItem on UsersTable by username

### 4. Infrastructure as Code

#### CDK Stack Components
- **DynamoDB Tables**: 4 tables with pay-per-request billing
- **Lambda Functions**: 17 functions with automated bundling
- **API Gateway**: REST API with CORS configuration
- **S3 Bucket**: Static website hosting with public read access
- **CloudFront Distribution**: Global CDN with HTTPS redirect
- **IAM Roles**: Least-privilege permissions per Lambda
- **CloudFormation Outputs**: API URL, bucket name, distribution ID

#### Resource Configuration
- **Removal Policy**: DESTROY (for development)
- **Billing Mode**: PAY_PER_REQUEST (DynamoDB)
- **Auto Delete**: Enabled for S3 objects
- **CORS**: Wildcard origins (should be restricted in production)

### 5. CI/CD Pipeline

#### GitHub Actions Workflows

**Backend Deployment** (`.github/workflows/deploy-backend.yml`)
- Trigger: Push to `main` with changes in `backend/**` or `infrastructure/**`
- Steps:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Build Lambda TypeScript
  5. CDK deploy
  6. Update frontend environment variables

**Frontend Deployment** (`.github/workflows/deploy-frontend.yml`)
- Trigger: Push to `main` with changes in `frontend/**`
- Steps:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Build React app
  5. Sync to S3 bucket
  6. Invalidate CloudFront cache

## Data Flow

### Public Appointment Booking Flow
```
1. Customer visits CloudFront URL
2. React app loads from S3
3. User selects barber → GET /barbers
4. User selects service → GET /services
5. User selects date/time → GET /barbers/{id}/appointments (check availability)
6. User submits booking → POST /barbers/{id}/appointments
7. Lambda creates DynamoDB record
8. Lambda triggers SES email → POST /notifications/email
9. Confirmation shown to user
```

### Admin Management Flow
```
1. Admin logs in → POST /auth/login
2. Lambda queries UsersTable
3. Auth token stored in context
4. Admin views barbers → GET /barbers
5. Admin creates barber → POST /barbers
6. Lambda writes to BarbersTable
7. Redux state updated
8. UI refreshes with new data
```

## Security Considerations

### Current Implementation
- CORS enabled with wildcard origins
- No API authentication/authorization
- Plain text passwords in database
- Public S3 bucket access
- No rate limiting

### Production Recommendations
1. **Authentication**: Implement JWT tokens with Amazon Cognito
2. **Authorization**: Add API Gateway authorizers
3. **Password Security**: Use bcrypt for password hashing
4. **CORS**: Restrict to specific domain
5. **API Security**: Add API keys or OAuth 2.0
6. **Rate Limiting**: Enable API Gateway throttling
7. **HTTPS Only**: Enforce HTTPS on CloudFront
8. **Secrets Management**: Use AWS Secrets Manager
9. **Input Validation**: Add request validation at API Gateway
10. **DDoS Protection**: Enable AWS Shield
11. **Monitoring**: Set up CloudWatch alarms
12. **Audit Logging**: Enable CloudTrail

## Scalability

### Current Capacity
- **Lambda**: Auto-scales to 1000 concurrent executions (default)
- **DynamoDB**: On-demand scaling (unlimited throughput)
- **API Gateway**: 10,000 requests per second (default)
- **CloudFront**: Global edge network (unlimited)
- **S3**: Unlimited storage and requests

### Optimization Opportunities
1. **Lambda Cold Starts**: Implement provisioned concurrency
2. **DynamoDB**: Add more GSIs for complex queries
3. **Caching**: Enable API Gateway caching
4. **CDN**: Configure CloudFront cache behaviors
5. **Connection Pooling**: Reuse DynamoDB connections (already implemented)
6. **Batch Operations**: Use DynamoDB batch APIs for bulk operations

## Monitoring and Observability

### Available Metrics
- **CloudWatch Logs**: Lambda execution logs
- **API Gateway Metrics**: Request count, latency, errors
- **DynamoDB Metrics**: Read/write capacity, throttles
- **CloudFront Metrics**: Cache hit ratio, requests
- **Lambda Metrics**: Duration, errors, concurrent executions

### Recommended Dashboards
1. API performance (latency, error rates)
2. Lambda health (invocations, errors, duration)
3. Database performance (read/write units, throttles)
4. Frontend delivery (CloudFront cache efficiency)

## Cost Optimization

### Current Cost Drivers
1. **Lambda**: Invocations + duration
2. **DynamoDB**: On-demand read/write requests
3. **API Gateway**: API calls
4. **CloudFront**: Data transfer out
5. **S3**: Storage + requests

### Optimization Strategies
1. Use DynamoDB provisioned capacity for predictable workloads
2. Enable CloudFront compression
3. Optimize Lambda memory allocation
4. Implement API response caching
5. Use S3 lifecycle policies for old data

## Development Workflow

### Local Development
```bash
# Frontend
cd frontend
npm install
npm start  # Runs on localhost:3000

# Backend (requires AWS credentials)
cd backend/lambda-ts
npm install
npm run build
```

### Deployment
```bash
# Infrastructure + Backend
cd backend
npm install
npm run deploy  # Deploys CDK stack + updates frontend env

# Frontend
cd frontend
npm run build
aws s3 sync build/ s3://<bucket-name>/ --delete
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
```

### Testing
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

## Environment Configuration

### Frontend Environment Variables
```env
REACT_APP_API_URL=<API Gateway URL>
REACT_APP_ENV=<local|production>
REACT_APP_WHATSAPP_NUMBER=<WhatsApp number>
```

### Backend Environment Variables (injected by CDK)
- `BARBERS_TABLE` - DynamoDB table name
- `SERVICES_TABLE` - DynamoDB table name
- `APPOINTMENTS_TABLE` - DynamoDB table name
- `USERS_TABLE` - DynamoDB table name
- `BARBERSHOP_EMAIL` - SES verified email address

## Future Enhancements

### Planned Features
1. **Real-time Updates**: WebSocket API for live appointment updates
2. **SMS Notifications**: Amazon SNS integration
3. **Payment Processing**: Stripe integration
4. **Multi-language**: i18n support
5. **Analytics**: Customer behavior tracking
6. **Reporting**: Admin dashboard with charts
7. **Calendar Integration**: Google Calendar sync
8. **Mobile App**: React Native version
9. **Barber Portal**: Separate interface for barbers
10. **Review System**: Customer ratings and reviews

### Technical Improvements
1. **GraphQL API**: Replace REST with AppSync
2. **Event-Driven**: EventBridge for decoupled services
3. **Caching Layer**: ElastiCache for frequently accessed data
4. **Search**: OpenSearch for advanced queries
5. **File Upload**: S3 presigned URLs for barber photos
6. **Backup**: Automated DynamoDB backups
7. **Multi-region**: Global deployment for HA
8. **Microservices**: Split into separate CDK stacks

## Conclusion

BarberAgenda demonstrates a modern serverless architecture leveraging AWS managed services for scalability, reliability, and cost-effectiveness. The application follows best practices for separation of concerns, with a clear distinction between frontend, API, and data layers. The use of Infrastructure as Code ensures reproducible deployments and version-controlled infrastructure changes.
