import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService';

interface User {
  _id: string;
  email: string;
  role: 'doctor' | 'patient' | 'pharmacy' | 'admin' | 'local';
  phone?: string;
}

interface RegisterData {
  email: string;
  password: string;
  role: 'doctor' | 'patient' | 'pharmacy' | 'admin' | 'local';
  phone?: string;
  fullName?: string;
  doctorData?: any;
  patientData?: any;
  pharmacyData?: any;
}

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: RegisterData) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getCurrentUser();
          setUser(userData);
          
          // Fetch fresh profile data
          const profileData = await authService.getProfile();
          setProfile(profileData.profile);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.data.user);
      setProfile(response.data.profile);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      setUser(response.data.user);
      setProfile(response.data.profile);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setProfile(null);
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
