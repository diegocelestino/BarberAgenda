/**
 * Mock authentication service for local development
 * Simulates Cognito behavior without AWS
 */

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

// Mock users database
const MOCK_USERS = [
  {
    username: 'admin',
    password: 'admin',
    email: 'admin@barbershop.com',
  },
  {
    username: 'demo',
    password: 'demo123',
    email: 'demo@barbershop.com',
  },
];

// Generate a fake JWT-like token
const generateMockToken = (username: string, type: 'access' | 'id' | 'refresh'): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: username,
    'cognito:username': username,
    email: MOCK_USERS.find(u => u.username === username)?.email || '',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (type === 'refresh' ? 2592000 : 3600), // 30 days for refresh, 1 hour for others
    token_use: type,
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

export const mockAuth = {
  /**
   * Mock sign in - validates against mock users
   */
  signIn: async (username: string, password: string): Promise<CognitoAuthResult> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = MOCK_USERS.find(u => u.username === username && u.password === password);

    if (!user) {
      throw new Error('Usuário ou senha inválidos');
    }

    const accessToken = generateMockToken(username, 'access');
    const idToken = generateMockToken(username, 'id');
    const refreshToken = generateMockToken(username, 'refresh');

    return {
      accessToken,
      idToken,
      refreshToken,
      user: {
        username: user.username,
        email: user.email,
        attributes: {
          sub: username,
          email: user.email,
          email_verified: 'true',
        },
      },
    };
  },

  /**
   * Mock sign out
   */
  signOut: async (): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return Promise.resolve();
  },

  /**
   * Mock refresh session
   */
  refreshSession: async (refreshToken: string): Promise<{ accessToken: string; idToken: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // Decode the refresh token to get username
      const payload = JSON.parse(atob(refreshToken.split('.')[1]));
      const username = payload['cognito:username'];

      return {
        accessToken: generateMockToken(username, 'access'),
        idToken: generateMockToken(username, 'id'),
      };
    } catch (error) {
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }
  },
};
