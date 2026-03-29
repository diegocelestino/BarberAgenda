/**
 * Unified authentication service
 * Automatically switches between mock (local dev) and real Cognito (production)
 */

import { cognitoAuth } from './cognitoAuth';
import { mockAuth } from './mockAuth';

export interface CognitoUser {
  username: string;
  email: string;
  attributes: Record<string, string>;
}

export interface CognitoAuthResult {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  user: CognitoUser;
}

// Determine if we're in local development mode
const isLocalDev = () => {
  const env = process.env.REACT_APP_ENV || process.env.NODE_ENV;
  const apiUrl = process.env.REACT_APP_API_URL || '';
  
  // Use mock auth if:
  // 1. Explicitly set to local
  // 2. API URL points to localhost
  // 3. Cognito config is missing
  return (
    env === 'local' ||
    apiUrl.includes('localhost') ||
    !process.env.REACT_APP_USER_POOL_CLIENT_ID
  );
};

const USE_MOCK = isLocalDev();

// Log which auth system we're using
if (USE_MOCK) {
  console.log('🔧 Using MOCK authentication (local development)');
  console.log('   Available users:');
  console.log('   - admin / admin');
  console.log('   - demo / demo123');
} else {
  console.log('🔐 Using AWS Cognito authentication');
}

/**
 * Unified auth service that delegates to mock or real Cognito
 */
export const auth = {
  signIn: async (username: string, password: string): Promise<CognitoAuthResult> => {
    if (USE_MOCK) {
      return mockAuth.signIn(username, password);
    }
    return cognitoAuth.signIn(username, password);
  },

  signOut: async (): Promise<void> => {
    if (USE_MOCK) {
      return mockAuth.signOut();
    }
    return cognitoAuth.signOut();
  },

  refreshSession: async (refreshToken: string): Promise<{ accessToken: string; idToken: string }> => {
    if (USE_MOCK) {
      return mockAuth.refreshSession(refreshToken);
    }
    return cognitoAuth.refreshSession(refreshToken);
  },

  isMockMode: (): boolean => USE_MOCK,
};
