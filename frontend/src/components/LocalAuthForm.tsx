import { useState, FormEvent } from 'react';
import { useRouter } from './Router';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, User, Mail, Lock, Eye, EyeOff, Phone, X } from 'lucide-react';

interface LocalAuthFormProps {
  onClose?: () => void;
}

export default function LocalAuthForm({ onClose }: LocalAuthFormProps) {
  const { navigate } = useRouter();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Read role selected in hospital portal flow; default to 'local'
    const selectedRole = (localStorage.getItem('selectedRole') as 'doctor' | 'patient' | 'pharmacy' | 'local') || 'local';

    const getDashboardRoute = (role: string) => {
      switch (role) {
        case 'doctor': return '/doctor/dashboard';
        case 'patient': return '/patient/dashboard';
        case 'pharmacy': return '/pharmacy/dashboard';
        default: return '/local-dashboard';
      }
    };

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        // After login, read the user's actual role from the response stored in localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          navigate(getDashboardRoute(user.role));
        } else {
          navigate(getDashboardRoute(selectedRole));
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await register({
          email: formData.email,
          password: formData.password,
          role: selectedRole,
          phone: formData.phone,
          fullName: formData.fullName,
        });
        navigate(getDashboardRoute(selectedRole));
      }
    } catch (err: any) {
      setError(err.message || `${isLogin ? 'Login' : 'Registration'} failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const close = onClose || (() => navigate('/access'));

  return (
    <div className="card-clean p-8 w-[600px] min-h-[450px] flex flex-col">
      {/* Close button */}
      <div className="flex justify-end mb-2">
        <button onClick={close} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => { setIsLogin(true); setError(''); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setIsLogin(false); setError(''); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          Create Account
        </button>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-1 font-display">
        {isLogin ? 'Welcome Back' : 'Create Your Account'}
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        {isLogin ? 'Sign in as a Local User' : 'Register as a Local User'}
      </p>

      {/* Error */}
      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name (register only) */}
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <div className="input-icon-wrapper">
              <User className="w-4 h-4 icon-left" />
              <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="input-healthcare" placeholder="John Doe" />
            </div>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
          <div className="input-icon-wrapper">
            <Mail className="w-4 h-4 icon-left" />
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="input-healthcare" placeholder="you@example.com" />
          </div>
        </div>

        {/* Phone (register only) */}
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
            <div className="input-icon-wrapper">
              <Phone className="w-4 h-4 icon-left" />
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="input-healthcare" placeholder="+91 98765 43210" />
            </div>
          </div>
        )}

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
          <div className="input-icon-wrapper">
            <Lock className="w-4 h-4 icon-left" />
            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} required className="input-healthcare pr-10" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="icon-right">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password (register only) */}
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
            <div className="input-icon-wrapper">
              <Lock className="w-4 h-4 icon-left" />
              <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required className="input-healthcare pr-10" placeholder="••••••••" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="icon-right">
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading} className="w-full btn-healthcare py-3 text-[15px] flex items-center justify-center gap-2 mt-2">
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            isLogin ? 'Sign In' : 'Create Account'
          )}
        </button>
      </form>
    </div>
  );
}