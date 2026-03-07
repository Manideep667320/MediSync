import { useState } from 'react';
import { useRouter } from './Router';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, AlertCircle, User, Upload } from 'lucide-react';

interface LocalAuthFormProps {
  onClose?: () => void;
}

export default function LocalAuthForm({ onClose }: LocalAuthFormProps) {
  const { navigate } = useRouter();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/local-dashboard');
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
          role: 'local',
          phone: formData.phone,
          fullName: formData.fullName
        });

        navigate('/local-dashboard');
      }
    } catch (err: any) {
      setError(err.message || `${isLogin ? 'Login' : 'Registration'} failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const close = onClose || (() => navigate('/access'));

  return (
    <>
      <div className="flex items-center justify-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Upload className="w-8 h-8 text-white" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-center text-white mb-2 font-display">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      <p className="text-center text-slate-400 mb-8">
        {isLogin ? 'Sign in as Local User' : 'Register as Local User'}
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-slate-300 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 glass-input"
              placeholder="John Doe"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 glass-input"
            placeholder="you@example.com"
          />
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-slate-300 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 glass-input"
              placeholder="+91 98765 43210"
            />
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 glass-input"
            placeholder="••••••••"
          />
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-300 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 glass-input"
              placeholder="••••••••"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-gradient py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center gap-2">
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                {isLogin ? 'Sign In' : 'Create Account'}
              </>
            )}
          </span>
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setFormData({
              email: '',
              password: '',
              confirmPassword: '',
              phone: '',
              fullName: ''
            });
          }}
          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
          <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            Local User Benefits:
          </h3>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Upload physical prescriptions</li>
            <li>• Find nearby pharmacies</li>
            <li>• Check medicine availability</li>
            <li>• Save prescription history</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button onClick={close} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
          Close
        </button>
      </div>
    </>
  );
}