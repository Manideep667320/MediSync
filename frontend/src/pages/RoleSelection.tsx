import { useState, useEffect } from 'react';
import { Stethoscope, User, Building, ArrowLeft } from 'lucide-react';
import { useRouter } from '../components/Router';
import hospitalService from '../services/hospitalService';

interface Hospital {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
}

export default function RoleSelection() {
  const { navigate, currentPath } = useRouter();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  const hospitalId = currentPath.split('/')[2];

  useEffect(() => {
    fetchHospital();
  }, [hospitalId]);

  const fetchHospital = async () => {
    if (!hospitalId) {
      navigate('/hospital');
      return;
    }

    setLoading(true);
    try {
      const response = await hospitalService.getHospitalById(hospitalId);
      setHospital(response);
    } catch (error) {
      console.error('Error fetching hospital:', error);
      navigate('/hospital');
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (roleId: string, route: string) => {
    localStorage.setItem('selectedRole', roleId);
    navigate('/login');
  };

  const roles = [
    {
      id: 'doctor',
      title: 'Doctor',
      icon: Stethoscope,
      description: 'Create and manage prescriptions',
      gradient: 'from-blue-500 to-cyan-500',
      glowColor: 'hover:border-blue-500/50 hover:shadow-glow-blue',
      route: '/doctor/dashboard',
    },
    {
      id: 'patient',
      title: 'Patient',
      icon: User,
      description: 'View your prescriptions and orders',
      gradient: 'from-purple-500 to-pink-500',
      glowColor: 'hover:border-purple-500/50 hover:shadow-glow-purple',
      route: '/patient/dashboard',
    },
    {
      id: 'pharmacy',
      title: 'Pharmacy',
      icon: Building,
      description: 'Receive and fulfill prescriptions',
      gradient: 'from-emerald-500 to-green-500',
      glowColor: 'hover:border-green-500/50 hover:shadow-glow-green',
      route: '/pharmacy/dashboard',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <button
          onClick={() => navigate('/hospital')}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Hospital Selection
        </button>

        <div className="text-center mb-12">
          {hospital && (
            <div className="mb-6">
              <div className="inline-block glass-card px-6 py-2 rounded-full mb-2">
                <span className="text-sm text-slate-400">Selected Hospital:</span>
                <span className="font-semibold text-white ml-2">{hospital.name}</span>
              </div>
            </div>
          )}
          <h1 className="text-4xl font-bold mb-4 font-display">
            <span className="text-white">Select Your </span>
            <span className="text-gradient">Role</span>
          </h1>
          <p className="text-lg text-slate-400">Choose how you want to access the system</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => selectRole(role.id, role.route)}
              className={`glass-card glass-card-hover p-8 cursor-pointer group transition-all duration-500 ${role.glowColor}`}
            >
              <div
                className={`w-20 h-20 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}
              >
                <role.icon className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold mb-2 text-white group-hover:text-gradient transition-colors font-display">
                {role.title}
              </h2>
              <p className="text-slate-400 mb-6 leading-relaxed">{role.description}</p>

              <button className={`w-full bg-gradient-to-r ${role.gradient} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300`}>
                Continue as {role.title}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}