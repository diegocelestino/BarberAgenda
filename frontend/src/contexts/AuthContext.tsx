import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { auth, CognitoUser } from '../services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: CognitoUser | null;
  accessToken: string | null;
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
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const logout = useCallback(async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }, []);

  const refreshTokenIfNeeded = useCallback(async (refreshToken: string) => {
    try {
      const { accessToken: newAccessToken, idToken: newIdToken } = await auth.refreshSession(refreshToken);
      
      setAccessToken(newAccessToken);
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('idToken', newIdToken);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // If refresh fails, log out the user
      logout();
    }
  }, [logout]);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedIdToken = localStorage.getItem('idToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedAccessToken && storedIdToken && storedRefreshToken && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
      setAccessToken(storedAccessToken);

      // Try to refresh the token on mount
      refreshTokenIfNeeded(storedRefreshToken);
    }
  }, [refreshTokenIfNeeded]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await auth.signIn(username, password);

      setIsAuthenticated(true);
      setUser(response.user);
      setAccessToken(response.accessToken);

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('idToken', response.idToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
