import axios from 'axios';

const COGNITO_DOMAIN = `https://cognito-idp.${process.env.REACT_APP_AWS_REGION}.amazonaws.com`;
const CLIENT_ID = process.env.REACT_APP_USER_POOL_CLIENT_ID;

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

export const cognitoAuth = {
  /**
   * Sign in with username and password using Cognito API
   */
  signIn: async (username: string, password: string): Promise<CognitoAuthResult> => {
    try {
      // Call Cognito InitiateAuth API
      const response = await axios.post(COGNITO_DOMAIN, {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      }, {
        headers: {
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
          'Content-Type': 'application/x-amz-json-1.1',
        },
      });

      const { AuthenticationResult } = response.data;

      if (!AuthenticationResult) {
        throw new Error('Authentication failed');
      }

      const { AccessToken, IdToken, RefreshToken } = AuthenticationResult;

      // Decode ID token to get user info (simple base64 decode)
      const idTokenPayload = JSON.parse(atob(IdToken.split('.')[1]));

      const user: CognitoUser = {
        username: idTokenPayload['cognito:username'] || username,
        email: idTokenPayload.email || '',
        attributes: idTokenPayload,
      };

      return {
        accessToken: AccessToken,
        idToken: IdToken,
        refreshToken: RefreshToken,
        user,
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Falha ao fazer login. Verifique suas credenciais.');
    }
  },

  /**
   * Sign out (just clear local storage, Cognito doesn't need server call for basic logout)
   */
  signOut: async (): Promise<void> => {
    // For a simple logout, we just clear tokens
    // For a global sign out, we'd need to call GlobalSignOut API
    return Promise.resolve();
  },

  /**
   * Refresh access token
   */
  refreshSession: async (refreshToken: string): Promise<{ accessToken: string; idToken: string }> => {
    try {
      const response = await axios.post(COGNITO_DOMAIN, {
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: CLIENT_ID,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      }, {
        headers: {
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
          'Content-Type': 'application/x-amz-json-1.1',
        },
      });

      const { AuthenticationResult } = response.data;

      if (!AuthenticationResult?.AccessToken || !AuthenticationResult?.IdToken) {
        throw new Error('Failed to refresh token');
      }

      return {
        accessToken: AuthenticationResult.AccessToken,
        idToken: AuthenticationResult.IdToken,
      };
    } catch (error: any) {
      console.error('Refresh token error:', error);
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }
  },
};
