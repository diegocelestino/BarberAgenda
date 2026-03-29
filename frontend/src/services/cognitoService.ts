import { awsConfig, isProductionAuth, MOCK_CREDENTIALS } from '../config/aws-config';

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export interface CognitoUser {
  username: string;
  email?: string;
  attributes?: Record<string, string>;
}

// Mock authentication for development
const mockAuth = {
  login: async (username: string, password: string): Promise<{ user: CognitoUser; tokens: AuthTokens }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (username === MOCK_CREDENTIALS.username && password === MOCK_CREDENTIALS.password) {
      return {
        user: {
          username: 'admin',
          email: 'admin@barbershop.com',
          attributes: {
            email: 'admin@barbershop.com',
            email_verified: 'true',
          },
        },
        tokens: {
          accessToken: 'mock-access-token',
          idToken: 'mock-id-token',
          refreshToken: 'mock-refresh-token',
        },
      };
    }
    
    throw new Error('Invalid credentials');
  },
  
  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
  },
  
  getCurrentUser: async (): Promise<CognitoUser | null> => {
    const tokens = localStorage.getItem('authTokens');
    if (tokens) {
      return {
        username: 'admin',
        email: 'admin@barbershop.com',
      };
    }
    return null;
  },
  
  refreshSession: async (): Promise<AuthTokens> => {
    const tokens = localStorage.getItem('authTokens');
    if (tokens) {
      return JSON.parse(tokens);
    }
    throw new Error('No refresh token available');
  },
};

// Real Cognito authentication
const cognitoAuth = {
  login: async (username: string, password: string): Promise<{ user: CognitoUser; tokens: AuthTokens }> => {
    // We'll use fetch API to call Cognito directly
    const response = await fetch(`https://cognito-idp.${awsConfig.region}.amazonaws.com/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
      },
      body: JSON.stringify({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: awsConfig.userPoolClientId,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Authentication failed');
    }

    const data = await response.json();
    
    // Handle NEW_PASSWORD_REQUIRED challenge
    if (data.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      const error: any = new Error('NEW_PASSWORD_REQUIRED');
      error.session = data.Session;
      error.challengeParameters = data.ChallengeParameters;
      throw error;
    }

    // Handle other challenges
    if (data.ChallengeName) {
      throw new Error(`Challenge required: ${data.ChallengeName}`);
    }

    const tokens: AuthTokens = {
      accessToken: data.AuthenticationResult.AccessToken,
      idToken: data.AuthenticationResult.IdToken,
      refreshToken: data.AuthenticationResult.RefreshToken,
    };

    // Decode ID token to get user info (simple base64 decode)
    const idTokenPayload = JSON.parse(atob(tokens.idToken.split('.')[1]));
    
    const user: CognitoUser = {
      username: idTokenPayload['cognito:username'],
      email: idTokenPayload.email,
      attributes: idTokenPayload,
    };

    return { user, tokens };
  },

  changePassword: async (
    username: string,
    oldPassword: string,
    newPassword: string,
    session: string
  ): Promise<{ user: CognitoUser; tokens: AuthTokens }> => {
    const response = await fetch(`https://cognito-idp.${awsConfig.region}.amazonaws.com/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.RespondToAuthChallenge',
      },
      body: JSON.stringify({
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        ClientId: awsConfig.userPoolClientId,
        ChallengeResponses: {
          USERNAME: username,
          PASSWORD: oldPassword,
          NEW_PASSWORD: newPassword,
        },
        Session: session,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password change failed');
    }

    const data = await response.json();

    const tokens: AuthTokens = {
      accessToken: data.AuthenticationResult.AccessToken,
      idToken: data.AuthenticationResult.IdToken,
      refreshToken: data.AuthenticationResult.RefreshToken,
    };

    // Decode ID token to get user info
    const idTokenPayload = JSON.parse(atob(tokens.idToken.split('.')[1]));
    
    const user: CognitoUser = {
      username: idTokenPayload['cognito:username'],
      email: idTokenPayload.email,
      attributes: idTokenPayload,
    };

    return { user, tokens };
  },

  logout: async (): Promise<void> => {
    const tokens = localStorage.getItem('authTokens');
    if (!tokens) return;

    const { accessToken } = JSON.parse(tokens);

    try {
      await fetch(`https://cognito-idp.${awsConfig.region}.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.GlobalSignOut',
        },
        body: JSON.stringify({
          AccessToken: accessToken,
        }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  getCurrentUser: async (): Promise<CognitoUser | null> => {
    const tokens = localStorage.getItem('authTokens');
    if (!tokens) return null;

    const { accessToken } = JSON.parse(tokens);

    try {
      const response = await fetch(`https://cognito-idp.${awsConfig.region}.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.GetUser',
        },
        body: JSON.stringify({
          AccessToken: accessToken,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      
      const attributes: Record<string, string> = {};
      data.UserAttributes.forEach((attr: any) => {
        attributes[attr.Name] = attr.Value;
      });

      return {
        username: data.Username,
        email: attributes.email,
        attributes,
      };
    } catch (error) {
      return null;
    }
  },

  refreshSession: async (): Promise<AuthTokens> => {
    const tokens = localStorage.getItem('authTokens');
    if (!tokens) throw new Error('No refresh token available');

    const { refreshToken } = JSON.parse(tokens);

    const response = await fetch(`https://cognito-idp.${awsConfig.region}.amazonaws.com/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
      },
      body: JSON.stringify({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: awsConfig.userPoolClientId,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh session');
    }

    const data = await response.json();

    return {
      accessToken: data.AuthenticationResult.AccessToken,
      idToken: data.AuthenticationResult.IdToken,
      refreshToken: refreshToken, // Refresh token doesn't change
    };
  },
};

// Export the appropriate auth service based on environment
export const cognitoService = isProductionAuth() ? cognitoAuth : mockAuth;

// Helper to check if using mock auth
export const isMockAuth = () => !isProductionAuth();

// Export changePassword for production (mock doesn't need it)
export const changePassword = isProductionAuth() 
  ? cognitoAuth.changePassword 
  : async () => { throw new Error('Password change not available in mock mode'); };
