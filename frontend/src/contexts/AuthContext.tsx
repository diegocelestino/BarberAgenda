import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cognitoService, CognitoUser, isMockAuth } from '../services/cognitoService';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string, newPassword?: string) => Promise<boolean>;
  logout: () => void;
  user: CognitoUser | null;
  getAccessToken: () => string | null;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<CognitoUser | null>(null);
  const isMockMode = isMockAuth();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const tokens = localStorage.getItem('authTokens');
      const storedUser = localStorage.getItem('user');
      
      if (tokens && storedUser) {
        try {
          // Verify token is still valid by getting current user
          const currentUser = await cognitoService.getCurrentUser();
          if (currentUser) {
            setIsAuthenticated(true);
            setUser(currentUser);
          } else {
            // Token expired, clear storage
            localStorage.removeItem('authTokens');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authTokens');
          localStorage.removeItem('user');
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string, newPassword?: string): Promise<boolean> => {
    try {
      let result;
      
      if (newPassword) {
        // Handle password change challenge
        const { changePassword } = await import('../services/cognitoService');
        const session = localStorage.getItem('cognitoSession') || '';
        result = await changePassword(username, password, newPassword, session);
        localStorage.removeItem('cognitoSession');
      } else {
        // Normal login
        result = await cognitoService.login(username, password);
      }
      
      const { user: cognitoUser, tokens } = result;
      
      setIsAuthenticated(true);
      setUser(cognitoUser);
      localStorage.setItem('authTokens', JSON.stringify(tokens));
      localStorage.setItem('user', JSON.stringify(cognitoUser));
      
      console.log(`✅ Logged in successfully (${isMockMode ? 'MOCK' : 'COGNITO'} mode)`);
      
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Store session for password change challenge
      if (error.message === 'NEW_PASSWORD_REQUIRED' && error.session) {
        localStorage.setItem('cognitoSession', error.session);
      }
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      await cognitoService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('authTokens');
    localStorage.removeItem('user');
    
    console.log('✅ Logged out successfully');
  };

  const getAccessToken = (): string | null => {
    const tokens = localStorage.getItem('authTokens');
    if (!tokens) return null;
    
    try {
      const { accessToken } = JSON.parse(tokens);
      return accessToken;
    } catch (error) {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      user, 
      getAccessToken,
      isMockMode 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

