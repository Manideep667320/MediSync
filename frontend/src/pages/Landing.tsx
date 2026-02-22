import { ArrowRight, PlayCircle, FileX, MapPinOff, XCircle, Clock, Mic, Scan, Map, Zap, FileCheck, ShieldCheck, Stethoscope, User, Building, Heart, RefreshCw, Sparkles } from 'lucide-react';
import { useRouter } from '../components/Router';
import { useEffect, useRef, useState } from 'react';

export default function Landing() {
  const { navigate } = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
        
        * {
          font-family: 'DM Sans', sans-serif;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: 'Sora', sans-serif;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(30px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from { 
            opacity: 0; 
            transform: scale(0.9);
          }
          to { 
            opacity: 1; 
            transform: scale(1);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }

        .animate-rotate-slow {
          animation: rotate-slow 30s linear infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.6s ease-out forwards;
        }

        .card-3d {
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }

        .card-3d:hover {
          transform: translateZ(20px) rotateX(5deg) rotateY(5deg);
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .text-gradient {
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #ec4899 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .glow {
          box-shadow: 0 0 40px rgba(96, 165, 250, 0.4);
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .blob {
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          background: linear-gradient(45deg, rgba(96, 165, 250, 0.3), rgba(167, 139, 250, 0.3));
          filter: blur(40px);
          animation: float 20s ease-in-out infinite;
        }
      `}</style>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute top-1/4 -left-20 w-96 h-96 blob opacity-30"
          style={{
            transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
            transition: 'transform 0.5s ease-out'
          }}
        />
        <div 
          className="absolute bottom-1/4 -right-20 w-96 h-96 blob opacity-30"
          style={{
            transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`,
            transition: 'transform 0.5s ease-out',
            animationDelay: '3s'
          }}
        />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(96, 165, 250, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(96, 165, 250, 0.5) 1px, transparent 1px)',
            backgroundSize: '100px 100px',
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 py-20">
        {/* 3D Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 animate-float opacity-20">
            <div className="w-full h-full rounded-3xl bg-gradient-to-br from-blue-400 to-purple-500 transform rotate-12" 
                 style={{ transform: `rotateX(45deg) rotateY(45deg)` }} />
          </div>
          <div className="absolute top-40 right-20 w-24 h-24 animate-float-delayed opacity-20">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-400 to-purple-500" 
                 style={{ transform: `rotateX(45deg) rotateY(-45deg)` }} />
          </div>
          <div className="absolute bottom-40 left-1/4 w-20 h-20 animate-pulse-slow opacity-20">
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 transform -rotate-12" 
                 style={{ transform: `rotateX(-45deg) rotateY(45deg)` }} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Logo with 3D effect */}
          <div className="flex items-center justify-center mb-8 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <div className="text-white font-bold text-3xl">M+</div>
              </div>
            </div>
          </div>

          {/* Main Headline with gradient text */}
          <h1 className="text-7xl md:text-8xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <span className="text-gradient">MediSync</span>
          </h1>
          
          <div className="relative inline-block mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
            <p className="relative text-3xl md:text-4xl text-slate-200 font-light tracking-wide">
              Where Doctors, Pharmacies, and Patients{' '}
              <span className="text-gradient font-semibold">Move as One</span>
            </p>
          </div>

          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.4s' }}>
            A unified digital prescription and pharmacy coordination platform that eliminates confusion,
            reduces delays, and modernizes healthcare workflows.
          </p>

          {/* CTA Buttons with 3D hover effects */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <button
              onClick={() => navigate('/access')}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 px-10 py-5 rounded-2xl font-semibold text-lg text-white overflow-hidden shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-3">
                Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button className="group relative inline-flex items-center gap-3 glass-effect px-10 py-5 rounded-2xl font-semibold text-lg text-white hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1">
              <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
              See How It Works
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm animate-slide-up" style={{ animationDelay: '0.6s' }}>
            {['HIPAA Compliant', 'SOC 2 Certified', '99.9% Uptime', 'Bank-Grade Encryption'].map((badge, index) => (
              <div key={index} className="flex items-center gap-2 glass-effect px-6 py-3 rounded-full hover:bg-white/10 transition-all duration-300">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span className="text-slate-300">{badge}</span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Problem Section with 3D Cards */}
      <section className="relative py-32 px-4 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Healthcare's <span className="text-gradient">Prescription Problem</span>
            </h2>
            <p className="text-xl text-slate-400">Traditional prescription workflows are broken</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 perspective-1000">
            {[
              {
                icon: FileX,
                title: 'Unreadable Prescriptions',
                description: 'Handwritten prescriptions lead to dangerous misinterpretation and medication errors',
                stat: '7,000+ deaths annually',
                color: 'from-red-500 to-pink-500',
                delay: '0.1s'
              },
              {
                icon: MapPinOff,
                title: 'Pharmacy Hopping',
                description: 'Patients waste hours visiting multiple pharmacies to find medicines in stock',
                stat: 'Average 2.3 visits',
                color: 'from-orange-500 to-red-500',
                delay: '0.2s'
              },
              {
                icon: XCircle,
                title: 'Zero Coordination',
                description: 'Doctors and pharmacies operate in silos with no real-time communication',
                stat: '40% face delays',
                color: 'from-purple-500 to-pink-500',
                delay: '0.3s'
              },
              {
                icon: Clock,
                title: 'Long Wait Times',
                description: 'Manual inventory checks and paper-based systems create bottlenecks',
                stat: '45-minute average wait',
                color: 'from-blue-500 to-purple-500',
                delay: '0.4s'
              },
            ].map((problem, index) => (
              <div 
                key={index} 
                className="card-3d group animate-slide-up"
                style={{ animationDelay: problem.delay }}
              >
                <div className="relative glass-effect p-8 rounded-3xl hover:bg-white/10 transition-all duration-500 h-full flex flex-col">
                  {/* Gradient border effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${problem.color} opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity duration-500 blur-xl`} />
                  
                  <div className="relative flex flex-col h-full">
                    <div className={`w-16 h-16 bg-gradient-to-br ${problem.color} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <problem.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-gradient transition-all duration-300">
                      {problem.title}
                    </h3>
                    
                    <p className="text-slate-400 mb-6 leading-relaxed flex-grow">
                      {problem.description}
                    </p>
                    
                    <div className={`inline-block px-4 py-2 bg-gradient-to-r ${problem.color} rounded-full self-start`}>
                      <p className="text-sm font-bold text-white">{problem.stat}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section with animated features */}
      <section className="relative py-32 px-4 bg-slate-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              One Platform. Three Stakeholders.{' '}
              <span className="text-gradient">Zero Confusion.</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              MediSync digitally connects doctors, patients, and pharmacies through intelligent coordination.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Mic,
                title: 'Voice-to-Text',
                description: 'Doctors speak naturally, AI converts to structured digital prescriptions',
                benefit: '10x faster than manual entry',
                color: 'from-blue-500 to-cyan-500',
                delay: '0.1s'
              },
              {
                icon: Scan,
                title: 'OCR Scanner',
                description: 'Convert handwritten prescriptions to digital format instantly',
                benefit: 'Works with existing prescriptions',
                color: 'from-purple-500 to-pink-500',
                delay: '0.2s'
              },
              {
                icon: Map,
                title: 'Pharmacy Network',
                description: 'See medicine availability, pricing, and distance across all nearby pharmacies',
                benefit: 'Find medicines in one click',
                color: 'from-green-500 to-emerald-500',
                delay: '0.3s'
              },
              {
                icon: Zap,
                title: 'Instant Coordination',
                description: 'Prescriptions sent directly to pharmacy, medicine prepared before arrival',
                benefit: 'Cut wait time by 80%',
                color: 'from-yellow-500 to-orange-500',
                delay: '0.4s'
              },
              {
                icon: FileCheck,
                title: 'Digital Records',
                description: 'Structured, searchable prescription history with AI-powered insights',
                benefit: 'Never lose a prescription',
                color: 'from-indigo-500 to-purple-500',
                delay: '0.5s'
              },
              {
                icon: ShieldCheck,
                title: 'Error Prevention',
                description: 'AI validates dosages, flags interactions, ensures clarity',
                benefit: 'Reduce errors by 95%',
                color: 'from-red-500 to-pink-500',
                delay: '0.6s'
              },
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group animate-slide-up"
                style={{ animationDelay: feature.delay }}
              >
                <div className="relative glass-effect p-8 rounded-3xl hover:bg-white/10 transition-all duration-500 h-full transform hover:-translate-y-2">
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20 rounded-3xl blur-xl`} />
                  </div>

                  <div className="relative">
                    <div className="mb-6 relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500`} />
                      <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-gradient transition-colors duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-slate-400 mb-4 leading-relaxed">
                      {feature.description}
                    </p>

                    <div className="flex items-center gap-2">
                      <Sparkles className={`w-4 h-4 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                      <p className={`text-sm font-semibold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                        {feature.benefit}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - 3D Flow Section */}
      <section className="relative py-32 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-20 text-white">
            Simple for <span className="text-gradient">Everyone</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                role: 'Doctor',
                icon: Stethoscope,
                color: 'from-blue-500 to-cyan-500',
                steps: [
                  'Speak or type prescription',
                  'AI structures into digital format',
                  'Review and approve',
                  'Send to preferred pharmacy',
                  'Track preparation status',
                ],
                delay: '0.1s'
              },
              {
                role: 'Patient',
                icon: User,
                color: 'from-purple-500 to-pink-500',
                steps: [
                  'Receive digital prescription',
                  'View medicine availability nearby',
                  'Choose pharmacy by price/distance',
                  'Get notified when ready',
                  'Pick up with zero wait',
                ],
                delay: '0.2s'
              },
              {
                role: 'Pharmacy',
                icon: Building,
                color: 'from-green-500 to-emerald-500',
                steps: [
                  'Receive prescription digitally',
                  'Update stock availability',
                  'Prepare medicine in advance',
                  'Notify patient when ready',
                  'Complete billing seamlessly',
                ],
                delay: '0.3s'
              },
            ].map((flow, index) => (
              <div 
                key={index} 
                className="group animate-slide-up"
                style={{ animationDelay: flow.delay }}
              >
                <div className="relative glass-effect p-10 rounded-3xl hover:bg-white/10 transition-all duration-500 h-full">
                  {/* Gradient glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${flow.color} opacity-0 group-hover:opacity-20 rounded-3xl blur-2xl transition-opacity duration-500`} />

                  <div className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`w-16 h-16 bg-gradient-to-br ${flow.color} rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                        <flow.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-white group-hover:text-gradient transition-colors duration-300">
                        {flow.role}
                      </h3>
                    </div>

                    <ol className="space-y-4">
                      {flow.steps.map((step, stepIndex) => (
                        <li 
                          key={stepIndex} 
                          className="flex gap-4 group/step"
                          style={{ 
                            animation: 'slide-up 0.6s ease-out forwards',
                            animationDelay: `${0.1 * (stepIndex + 1)}s`,
                            opacity: 0
                          }}
                        >
                          <span className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br ${flow.color} rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg group-hover/step:scale-110 transition-transform duration-300`}>
                            {stepIndex + 1}
                          </span>
                          <span className="pt-2 text-slate-300 leading-relaxed group-hover/step:text-white transition-colors duration-300">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Metrics with 3D cards */}
      <section className="relative py-32 px-4 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-20 text-white">
            Real Results, <span className="text-gradient">Real Impact</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { value: '95%', label: 'Reduction in prescription errors', icon: ShieldCheck, color: 'from-green-500 to-emerald-500', delay: '0.1s' },
              { value: '80%', label: 'Faster medicine fulfillment', icon: Zap, color: 'from-blue-500 to-cyan-500', delay: '0.2s' },
              { value: '3x', label: 'Improved patient satisfaction', icon: Heart, color: 'from-red-500 to-pink-500', delay: '0.3s' },
              { value: '60%', label: 'Less time on admin tasks', icon: Clock, color: 'from-amber-500 to-orange-500', delay: '0.4s' },
              { value: '100%', label: 'Digital prescription clarity', icon: FileCheck, color: 'from-indigo-500 to-purple-500', delay: '0.5s' },
              { value: '24/7', label: 'Pharmacy coordination', icon: RefreshCw, color: 'from-teal-500 to-cyan-500', delay: '0.6s' },
            ].map((metric, index) => (
              <div 
                key={index} 
                className="group animate-slide-up"
                style={{ animationDelay: metric.delay }}
              >
                <div className="relative glass-effect p-10 rounded-3xl text-center hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2 h-full">
                  {/* Gradient glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-30 rounded-3xl blur-2xl transition-opacity duration-500`} />

                  <div className="relative">
                    <div className="mb-6 flex justify-center">
                      <div className={`w-20 h-20 bg-gradient-to-br ${metric.color} rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl`}>
                        <metric.icon className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    <div className={`text-6xl font-bold mb-4 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block`}>
                      {metric.value}
                    </div>

                    <div className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                      {metric.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 px-4 bg-gradient-to-b from-slate-950 via-blue-950 to-purple-950 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white">
            Ready to Transform Your <span className="text-gradient">Healthcare Workflow?</span>
          </h2>
          
          <p className="text-xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Join hospitals, clinics, and pharmacies modernizing patient care with MediSync.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button
              onClick={() => navigate('/access')}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 px-12 py-6 rounded-2xl font-bold text-xl text-white overflow-hidden shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">Start Free Trial</span>
            </button>
            
            <button className="group relative inline-flex items-center gap-3 glass-effect px-12 py-6 rounded-2xl font-bold text-xl text-white hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 border-2 border-white/20">
              Schedule Demo
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {['HIPAA Compliant', 'SOC 2 Certified', '99.9% Uptime', 'Bank-Grade Encryption'].map((badge, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 glass-effect px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <span className="text-slate-300 font-medium">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-slate-950 text-slate-400 py-16 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6">
            <div className="inline-block">
              <div className="text-4xl font-bold text-gradient mb-2">MediSync</div>
              <p className="text-slate-500">Where Doctors, Pharmacies, and Patients Move as One.</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">&copy; 2026 MediSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}