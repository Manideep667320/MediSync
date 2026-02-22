import api from './api';

export interface RegisterData {
  email: string;
  password: string;
  role: 'doctor' | 'patient' | 'pharmacy' | 'admin' | 'local';
  phone?: string;
  fullName?: string;
  doctorData?: {
    hospitalId: string;
    firstName: string;
    lastName: string;
    specialty: string;
    qualification: string;
    licenseNumber: string;
  };
  patientData?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    bloodGroup?: string;
    address?: string;
  };
  pharmacyData?: {
    hospitalId?: string;
    pharmacyName: string;
    licenseNumber: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: any;
    profile: any;
    token: string;
  };
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response: any = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response: any = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  }

  async getProfile(): Promise<any> {
    const response = await api.get('/auth/profile');
    return response.data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();
