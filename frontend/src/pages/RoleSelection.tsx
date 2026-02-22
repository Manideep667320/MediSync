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
      color: 'from-blue-500 to-blue-600',
      route: '/doctor/dashboard',
    },
    {
      id: 'patient',
      title: 'Patient',
      icon: User,
      description: 'View your prescriptions and orders',
      color: 'from-green-500 to-green-600',
      route: '/patient/dashboard',
    },
    {
      id: 'pharmacy',
      title: 'Pharmacy',
      icon: Building,
      description: 'Receive and fulfill prescriptions',
      color: 'from-orange-500 to-orange-600',
      route: '/pharmacy/dashboard',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/hospital')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Hospital Selection
        </button>

        <div className="text-center mb-12">
          {hospital && (
            <div className="mb-6">
              <div className="inline-block bg-white px-6 py-2 rounded-full shadow-md mb-2">
                <span className="text-sm text-gray-600">Selected Hospital:</span>
                <span className="font-semibold text-gray-900 ml-2">{hospital.name}</span>
              </div>
            </div>
          )}
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Select Your Role</h1>
          <p className="text-lg text-gray-600">Choose how you want to access the system</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => selectRole(role.id, role.route)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 cursor-pointer border-2 border-gray-100 hover:border-blue-300 group"
            >
              <div
                className={`w-20 h-20 bg-gradient-to-br ${role.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
              >
                <role.icon className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold mb-6 text-gray-900 group-hover:text-blue-600 transition-colors">
                {role.title}
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">{role.description}</p>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Continue as {role.title}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}