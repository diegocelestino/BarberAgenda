# BarberAgenda

A modern, serverless web application that enables customers to easily book appointments with barber shops. Built with React on the frontend and powered by AWS serverless architecture (API Gateway, Lambda, DynamoDB) on the backend, this app provides a seamless scheduling experience for both customers and barbers.

## Project Structure

```
├── backend/              # Backend Lambda functions (Java)
│   └── lambda/          # Java Lambda handlers
├── frontend/            # React frontend application
├── infrastructure/      # AWS CDK infrastructure code
└── mock-server/         # Local development mock API server
```

## Getting Started

### Prerequisites

- Node.js 18+
- Java 21
- Maven
- AWS CLI configured (for deployment)

### Local Development

1. **Start the mock server:**
```bash
cd mock-server
npm install
npm start
```

2. **Run the frontend:**
```bash
cd frontend
npm install
npm start
```

The frontend will use the mock server at `http://localhost:3001` (configured in `frontend/.env`).

### Deployment

The project uses GitHub Actions for CI/CD. Deployments are triggered automatically when pushing to `main`:

- **Infrastructure**: Deploys when `backend/lambda/**` or `infrastructure/**` changes
- **Frontend**: Deploys when `frontend/**` changes
- **Mock Server**: Changes don't trigger deployments (local only)

Manual deployment:

1. **Build Lambda:**
```bash
cd backend/lambda
mvn clean package
```

2. **Deploy infrastructure:**
```bash
cd infrastructure
npm install
npm run deploy
```

3. **Deploy frontend:**
```bash
cd frontend
npm run build
# Upload to S3 (automated in CI/CD)
```

## Architecture

- **Frontend**: React app hosted on S3 + CloudFront
- **Backend**: Java 21 Lambda functions with API Gateway
- **Database**: DynamoDB
- **Infrastructure**: AWS CDK (TypeScript)
