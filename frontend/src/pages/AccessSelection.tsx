import { useState } from 'react';
import { User, Building, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from '../components/Router';
import LocalAuthForm from '../components/LocalAuthForm';

export default function AccessSelection() {
  const { navigate } = useRouter();
  const [localOpen, setLocalOpen] = useState(false);

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
      action: () => setLocalOpen(true),
      badge: 'Login Required',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      gradient: 'from-brand-500 to-brand-300',
      glowColor: 'hover:border-brand-500/40 hover:shadow-md',
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
      badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      gradient: 'from-purple-500 to-pink-500',
      glowColor: 'hover:border-purple-500/40 hover:shadow-md',
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-slate-50 relative overflow-hidden">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-brand-700 hover:text-brand-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              <span className="text-brand-900">How Would You Like to </span>
              <span className="text-gradient">Access MediSync?</span>
            </h1>
            <p className="text-lg text-brand-700">Choose your access method based on your needs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {options.map((option) => (
              <div
                key={option.id}
                className={`glass-card glass-card-hover p-8 relative flex flex-col transition-all duration-500 ${option.glowColor}`}
              >
                <div className="absolute top-6 right-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${option.badgeColor}`}>
                    {option.badge}
                  </span>
                </div>

                <div className="mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${option.gradient} rounded-2xl flex items-center justify-center mb-4 transform hover:scale-110 hover:rotate-6 transition-all duration-500`}>
                    <option.icon className="w-8 h-8 text-brand-900" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-brand-900 font-display">{option.title}</h2>
                  <p className="text-brand-700 leading-relaxed">{option.description}</p>
                </div>

                <div className="mb-8 flex-grow">
                  <h3 className="font-semibold text-brand-800 mb-3">Features:</h3>
                  <ul className="space-y-3">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 bg-gradient-to-r ${option.gradient} bg-clip-text text-brand-700`} />
                        <span className="text-brand-800">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={option.action}
                  className="w-full btn-gradient py-4 rounded-xl font-semibold text-lg"
                >
                  <span className="relative z-10">{option.buttonText}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Local Auth Popup */}
      {localOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={() => setLocalOpen(false)}
        >
          <div onClick={e => e.stopPropagation()}>
            <LocalAuthForm onClose={() => setLocalOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
