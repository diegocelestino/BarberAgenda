# BarberAgenda

A modern, serverless web application that enables customers to easily book appointments with barber shops. Built with React on the frontend and powered by AWS serverless architecture (API Gateway, Lambda, DynamoDB) on the backend, this app provides a seamless scheduling experience for both customers and barbers.

## Project Structure

```
├── backend/
│   └── lambda-ts/           # TypeScript Lambda functions
│       └── src/
│           ├── appointments/ # Appointment CRUD operations (create, delete, get, list, update)
│           ├── auth/        # Authentication handlers (login)
│           ├── barbers/     # Barber management (create, delete, get, list, update)
│           ├── services/    # Service management (create, delete, get, list, update)
│           └── utils/       # Shared utilities (DynamoDB client, API responses)
├── frontend/                # React frontend application
│   └── src/
│       ├── components/      # React components (scheduling, barbers, services, auth)
│       ├── pages/          # Page components
│       ├── store/          # Redux store (appointments, barbers, services)
│       ├── services/       # API client services
│       └── theme/          # Theme configuration
├── infrastructure/          # AWS CDK infrastructure code
└── .github/workflows/       # CI/CD pipelines
```

## Getting Started

### Prerequisites

- Node.js 18+
- AWS CLI configured (for deployment)

### Local Development

1. **Run the frontend:**
```bash
cd frontend
npm install
npm start
```

The frontend will use the local API URL configured in `frontend/.env.local`.

### Environment Variables

Create a `frontend/.env.local` file (gitignored) with:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=local
REACT_APP_WHATSAPP_NUMBER=5511949803682
```

For production, set these as GitHub Secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `WHATSAPP_NUMBER`

### Deployment

The project uses GitHub Actions for CI/CD. Deployments are triggered automatically when pushing to `main`:

- **Backend**: Deploys when `backend/**` or `infrastructure/**` changes
- **Frontend**: Deploys when `frontend/**` changes

Manual deployment:

1. **Deploy infrastructure:**
```bash
cd infrastructure
npm install
npm run deploy
```

2. **Deploy frontend:**
```bash
cd frontend
npm run build
# Automated upload to S3 via GitHub Actions
```

## Architecture

- **Frontend**: React app with Material-UI, hosted on S3 + CloudFront
- **Backend**: TypeScript Lambda functions with API Gateway
- **Database**: DynamoDB (appointments, barbers, services)
- **Infrastructure**: AWS CDK (TypeScript)
- **Region**: sa-east-1 (São Paulo)

## Features

- Public appointment scheduling with multi-step wizard
- Admin panel for managing barbers and services
- WhatsApp integration for appointment confirmations
- Real-time availability checking
- Responsive design for mobile and desktop
- Portuguese (Brazil) localization

