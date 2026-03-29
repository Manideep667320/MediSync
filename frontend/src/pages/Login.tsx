import { useState, FormEvent } from 'react';
import { useRouter } from '../components/Router';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Mail, Lock, Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';

export default function Login() {
  const { navigate } = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        switch (user.role) {
          case 'doctor': navigate('/doctor/dashboard'); break;
          case 'patient': navigate('/patient/dashboard'); break;
          case 'pharmacy': navigate('/pharmacy/dashboard'); break;
          case 'local': navigate('/local-dashboard'); break;
          default: navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        {/* Back link */}
        <button
          onClick={() => navigate('/access')}
          className="flex items-center gap-2 text-slate-500 hover:text-[#508991] mb-8 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Access Selection
        </button>

        {/* Login Card */}
        <div className="card-clean p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-[#508991] rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-slate-900 mb-1 font-display">
            Welcome Back
          </h1>
          <p className="text-center text-slate-500 mb-8 text-sm">
            Sign in to your MediSync account
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="input-icon-wrapper">
                <Mail className="w-4 h-4 icon-left" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-healthcare"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="input-icon-wrapper">
                <Lock className="w-4 h-4 icon-left" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-healthcare pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="icon-right"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-healthcare py-3 text-[15px] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Create Account */}
          <button
            onClick={() => navigate('/access')}
            className="w-full btn-outline py-3 text-[15px]"
          >
            Create Account
          </button>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-slate-500 text-center">
              <p><span className="font-medium text-slate-600">Doctor:</span> doctor@demo.com / demo123</p>
              <p><span className="font-medium text-slate-600">Patient:</span> patient@demo.com / demo123</p>
              <p><span className="font-medium text-slate-600">Pharmacy:</span> pharmacy@demo.com / demo123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
