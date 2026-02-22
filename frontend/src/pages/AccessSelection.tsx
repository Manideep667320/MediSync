import { User, Building, ArrowLeft } from 'lucide-react';
import { useRouter } from '../components/Router';

export default function AccessSelection() {
  const { navigate } = useRouter();

  const options = [
    {
      id: 'local_user',
      title: 'Local User',
      icon: User,
      description: 'I have a physical prescription I want to digitize and find nearby pharmacies',
      features: [
        'Upload prescription image',
        'View nearby pharmacies',
        'Check medicine availability',
        'Compare prices',
        'No hospital affiliation needed',
      ],
      buttonText: 'Login / Register',
      action: () => navigate('/local-auth'),
      badge: 'Login Required',
      badgeColor: 'bg-green-100 text-green-700',
    },
    {
      id: 'hospital_portal',
      title: 'Hospital Portal',
      icon: Building,
      description: "I'm affiliated with a hospital as a doctor, patient, or pharmacy",
      features: [
        'Full digital prescription system',
        'Role-based dashboards',
        'Hospital integration',
        'Complete workflow management',
        'Advanced analytics',
      ],
      buttonText: 'Login via Hospital Portal',
      action: () => navigate('/hospital'),
      badge: 'Login Required',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            How Would You Like to Access MediSync?
          </h1>
          <p className="text-lg text-gray-600">Choose your access method based on your needs</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {options.map((option) => (
            <div
              key={option.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 border-2 border-gray-100 hover:border-blue-300 relative flex flex-col"
            >
              <div className="absolute top-6 right-6">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${option.badgeColor}`}>
                  {option.badge}
                </span>
              </div>

              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <option.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">{option.title}</h2>
                <p className="text-gray-600 leading-relaxed">{option.description}</p>
              </div>

              <div className="mb-8 flex-grow">
                <h3 className="font-semibold text-gray-900 mb-3">Features:</h3>
                <ul className="space-y-2">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={option.action}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                {option.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
