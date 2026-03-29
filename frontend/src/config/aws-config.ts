// AWS Cognito Configuration
export const awsConfig = {
  region: process.env.REACT_APP_AWS_REGION || 'sa-east-1',
  userPoolId: process.env.REACT_APP_USER_POOL_ID || '',
  userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || '',
};

// Check if we're in production mode with Cognito configured
export const isProductionAuth = () => {
  const env = process.env.REACT_APP_ENV || process.env.NODE_ENV;
  return env === 'production' && awsConfig.userPoolId && awsConfig.userPoolClientId;
};

// Mock credentials for development
export const MOCK_CREDENTIALS = {
  username: 'admin',
  password: 'admin',
};

