import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  adminLogin: (email: string, password: string) => Promise<User>;
  register: (data: { fullName: string; email: string; mobile: string; password: string }) => Promise<string>;
  logout: () => void;
  isAdmin: boolean;
  isStudent: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('quizora_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Only fetch user on initial load (page refresh) when token exists but user is not set
  useEffect(() => {
    const storedToken = localStorage.getItem('quizora_token');
    if (storedToken && !user) {
      authService.getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('quizora_token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []); // Run only once on mount

  const login = async (identifier: string, password: string): Promise<User> => {
    const res = await authService.login({ identifier, password });
    localStorage.setItem('quizora_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const adminLogin = async (email: string, password: string): Promise<User> => {
    const res = await authService.adminLogin({ email, password });
    localStorage.setItem('quizora_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data: { fullName: string; email: string; mobile: string; password: string }) => {
    const res = await authService.register(data);
    return res.data.userId;
  };

  const logout = () => {
    localStorage.removeItem('quizora_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        adminLogin,
        register,
        logout,
        isAdmin: user?.role === 'ADMIN',
        isStudent: user?.role === 'STUDENT',
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
