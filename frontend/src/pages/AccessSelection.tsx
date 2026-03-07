import { useState } from 'react';
import { User, Building, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from '../components/Router';
import Modal from '../components/Modal';
import LocalAuthForm from '../components/LocalAuthForm';

export default function AccessSelection() {
  const { navigate } = useRouter();
  const [isLocalAuthOpen, setIsLocalAuthOpen] = useState(false);

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
      action: () => setIsLocalAuthOpen(true),
      badge: 'Login Required',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      gradient: 'from-blue-500 to-cyan-500',
      glowColor: 'hover:border-blue-500/50 hover:shadow-glow-blue',
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
      glowColor: 'hover:border-purple-500/50 hover:shadow-glow-purple',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-10 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
            <span className="text-white">How Would You Like to </span>
            <span className="text-gradient">Access MediSync?</span>
          </h1>
          <p className="text-lg text-slate-400">Choose your access method based on your needs</p>
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
                  <option.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-white font-display">{option.title}</h2>
                <p className="text-slate-400 leading-relaxed">{option.description}</p>
              </div>

              <div className="mb-8 flex-grow">
                <h3 className="font-semibold text-slate-300 mb-3">Features:</h3>
                <ul className="space-y-3">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 bg-gradient-to-r ${option.gradient} bg-clip-text text-blue-400`} />
                      <span className="text-slate-300">{feature}</span>
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

      <Modal
        isOpen={isLocalAuthOpen}
        onClose={() => setIsLocalAuthOpen(false)}
        title="Local User Login / Registration"
        size="sm"
      >
        <LocalAuthForm onClose={() => setIsLocalAuthOpen(false)} />
      </Modal>
    </div>
  );
}
