import { useState, useEffect } from 'react';
import { Stethoscope, User, Building, ArrowLeft } from 'lucide-react';
import { useRouter } from '../components/Router';
import hospitalService from '../services/hospitalService';
import LocalAuthForm from '../components/LocalAuthForm';
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
  const [authOpen, setAuthOpen] = useState(false);

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

  const selectRole = (roleId: string) => {
    localStorage.setItem('selectedRole', roleId);
    setAuthOpen(true);
  };

  const roles = [
    {
      id: 'doctor',
      title: 'Doctor',
      icon: Stethoscope,
      description: 'Create and manage prescriptions',
      gradient: 'from-brand-500 to-brand-300',
      glowColor: 'hover:border-brand-500/40 hover:shadow-md',
      route: '/doctor/dashboard',
    },
    {
      id: 'patient',
      title: 'Patient',
      icon: User,
      description: 'View your prescriptions and orders',
      gradient: 'from-purple-500 to-pink-500',
      glowColor: 'hover:border-purple-500/40 hover:shadow-md',
      route: '/patient/dashboard',
    },
    {
      id: 'pharmacy',
      title: 'Pharmacy',
      icon: Building,
      description: 'Receive and fulfill prescriptions',
      gradient: 'from-emerald-500 to-green-500',
      glowColor: 'hover:border-green-500/40 hover:shadow-md',
      route: '/pharmacy/dashboard',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-brand-500/30 border-t-brand-300 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 relative overflow-hidden">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <button
            onClick={() => navigate('/hospital')}
            className="flex items-center gap-2 text-brand-700 hover:text-brand-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Hospital Selection
          </button>

          <div className="text-center mb-12">
            {hospital && (
              <div className="mb-6">
                <div className="inline-block glass-card px-6 py-2 rounded-full mb-2">
                  <span className="text-sm text-brand-700">Selected Hospital:</span>
                  <span className="font-semibold text-brand-900 ml-2">{hospital.name}</span>
                </div>
              </div>
            )}
            <h1 className="text-4xl font-bold mb-4 font-display">
              <span className="text-brand-900">Select Your </span>
              <span className="text-gradient">Role</span>
            </h1>
            <p className="text-lg text-brand-700">Choose how you want to access the system</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => selectRole(role.id)}
                className={`glass-card glass-card-hover p-8 cursor-pointer group transition-all duration-500 flex flex-col ${role.glowColor}`}
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}
                >
                  <role.icon className="w-10 h-10 text-brand-900" />
                </div>

                <h2 className="text-2xl font-bold mb-2 text-brand-900 group-hover:text-gradient transition-colors font-display">
                  {role.title}
                </h2>
                <p className="text-brand-700 mb-6 leading-relaxed flex-1">{role.description}</p>

                <button className={`w-full bg-gradient-to-r ${role.gradient} text-brand-900 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 mt-auto`}>
                  Continue as {role.title}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {authOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={() => setAuthOpen(false)}
        >
          <div onClick={e => e.stopPropagation()}>
            <LocalAuthForm onClose={() => setAuthOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}