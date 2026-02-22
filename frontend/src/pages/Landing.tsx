import { ArrowRight, PlayCircle, FileX, MapPinOff, XCircle, Clock, Mic, Scan, Map, Zap, FileCheck, ShieldCheck, Stethoscope, User, Building, Heart, RefreshCw, Sparkles, Smartphone, Hospital, Filter, Bell, CheckCircle2, Cpu, Package, FileText } from 'lucide-react';
import { useRouter } from '../components/Router';
import { useRef, useState } from 'react';
import Background3D from '../components/Background3D';

export default function Landing() {
  const { navigate } = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'local' | 'hospital'>('local');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1) translateZ(0);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1) translateZ(20px);
          }
        }

        @keyframes pulse-glow-3d {
          0% { 
            box-shadow: 0 0 50px rgba(96, 165, 250, 0.3), 0 0 100px rgba(167, 139, 250, 0.2);
            transform: translateZ(50px) scale(1);
          }
          50% { 
            box-shadow: 0 0 100px rgba(96, 165, 250, 0.6), 0 0 200px rgba(167, 139, 250, 0.4);
            transform: translateZ(70px) scale(1.1);
          }
          100% { 
            box-shadow: 0 0 50px rgba(96, 165, 250, 0.3), 0 0 100px rgba(167, 139, 250, 0.2);
            transform: translateZ(50px) scale(1);
          }
        }

        @keyframes float-3d {
          0%   { transform: translateZ(0px)  rotateX(0deg) rotateY(0deg); }
          25%  { transform: translateZ(20px) rotateX(2deg) rotateY(2deg); }
          50%  { transform: translateZ(40px) rotateX(4deg) rotateY(4deg); }
          75%  { transform: translateZ(20px) rotateX(2deg) rotateY(2deg); }
          100% { transform: translateZ(0px)  rotateX(0deg) rotateY(0deg); }
        }

        @keyframes rotate-3d {
          0%   { transform: rotateX(0deg)   rotateY(0deg)   rotateZ(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-pulse-glow-3d {
          animation: pulse-glow-3d 3s ease-in-out infinite;
        }

        .animate-float-3d {
          animation: float-3d 8s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        .animate-rotate-3d {
          animation: rotate-3d 20s linear infinite;
          transform-style: preserve-3d;
        }

        .glass-effect-3d {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transform-style: preserve-3d;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
        }

        .text-gradient-3d {
          background: linear-gradient(
            135deg,
            #60a5fa 0%,
            #a78bfa 50%,
            #ec4899 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.4));
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }

        @keyframes flow-pulse {
          0% { stroke-opacity: 0.3; stroke-width: 2; }
          50% { stroke-opacity: 1; stroke-width: 3; }
          100% { stroke-opacity: 0.3; stroke-width: 2; }
        }

        .step-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
        }

        .step-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 40px -10px rgba(96, 165, 250, 0.3);
        }

        .step-badge {
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(167, 139, 250, 0.2));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

      `}</style>

      {/* 3D Background */}
      <Background3D />

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
      <section className="relative py-32 px-4">
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
      <section className="relative py-32 px-4">
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

      {/* 3D Key Innovation */}
      <section className="relative py-32 px-4">
        <div className="max-w-6xl mx-auto perspective-3000">
          <div
            className="glass-effect-3d-strong rounded-3xl overflow-hidden preserve-3d transform-gpu hover:translateZ(50px) transition-transform duration-500"
            style={{ transform: `rotateY(${mousePosition.x * 5}deg) rotateX(${mousePosition.y * 5}deg)` }}
          >
            <div className="grid md:grid-cols-2">
              {/* Left side - Content */}
              <div className="p-12 relative">
                <div className="absolute top-0 right-0 w-64 h-64 animate-rotate-3d opacity-10">
                  <Mic className="w-full h-full text-amber-500" />
                </div>

                <div className="relative preserve-3d">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 rounded-full text-white font-semibold mb-8 transform-gpu hover:translateZ(20px) transition-transform duration-300">
                    <Sparkles className="w-5 h-5" />
                    Key Innovation
                  </div>

                  <h3 className="text-5xl font-bold text-white mb-6 leading-tight">
                    Voice-to-Text
                    <br />
                    <span className="text-gradient-3d">Prescriptions</span>
                  </h3>

                  <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                    Doctors speak naturally. AI converts instantly.
                    <span className="text-gradient-3d block mt-2">No handwriting. No errors. No delays.</span>
                  </p>

                  {/* 3D Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: '10x', label: 'Faster Entry' },
                      { value: '100%', label: 'Accuracy' },
                      { value: '50+', label: 'Languages' },
                      { value: '0', label: 'Handwriting' }
                    ].map((stat, i) => (
                      <div key={i} className="glass-effect-3d p-4 rounded-xl text-center transform-gpu hover:translateZ(20px) transition-transform duration-300">
                        <div className="text-2xl font-bold text-gradient-3d">{stat.value}</div>
                        <div className="text-sm text-slate-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right side - 3D Visualizer */}
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-12 flex items-center justify-center min-h-[400px]">
                <div className="relative preserve-3d animate-float-3d">
                  {/* 3D Voice Waveform */}
                  <div className="relative w-64 h-64">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute bottom-0 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full animate-pulse"
                        style={{
                          left: `${i * 12}%`,
                          width: '8%',
                          height: `${Math.sin(Date.now() * 0.01 + i) * 50 + 50}%`,
                          opacity: 0.3 + i * 0.1,
                          transform: `translateZ(${i * 10}px)`,
                          animation: `pulse 1s ease-in-out infinite`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}

                    {/* Central Mic Icon */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center animate-pulse-glow-3d" style={{ transform: 'translateZ(50px)' }}>
                      <Mic className="w-12 h-12 text-white" />
                    </div>
                  </div>

                  {/* Floating Text */}
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 glass-effect-3d px-6 py-3 rounded-full whitespace-nowrap" style={{ transform: 'translateZ(30px)' }}>
                    <span className="text-gradient-3d">"Amoxicillin 500mg twice daily"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Dual-Mode Platform */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              One Platform, <span className="text-gradient">Two Powerful Modes</span>
            </h2>
            <p className="text-xl text-slate-400">Designed for both independent users and healthcare institutions</p>
          </div>

          {/* Mode Tabs */}
          <div className="flex justify-center mb-12">
            <div className="glass-effect-strong p-1 rounded-2xl inline-flex">
              <button
                onClick={() => setActiveTab('local')}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 ${
                  activeTab === 'local' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                Local User Mode
              </button>
              <button
                onClick={() => setActiveTab('hospital')}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 ${
                  activeTab === 'hospital' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Hospital className="w-5 h-5" />
                Hospital Portal Mode
              </button>
            </div>
          </div>

          {/* Local Mode Content */}
          {activeTab === 'local' && (
            <div className="animate-slide-up">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-block px-4 py-2 bg-blue-500/20 rounded-full text-blue-400 font-semibold mb-6">
                    For Independent Patients
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Complete Prescription Management
                  </h3>
                  <p className="text-lg text-slate-400 mb-8">
                    No hospital connection? No problem. Use MediSync independently to manage all your prescriptions.
                  </p>
                  
                  <div className="space-y-6">
                    {[
                      { icon: Scan, text: 'Upload handwritten prescriptions, convert to digital instantly' },
                      { icon: Map, text: 'Find nearby pharmacies with real-time medicine availability' },
                      { icon: Filter, text: 'Compare prices and distance across all pharmacies' },
                      { icon: Bell, text: 'Track order status and get notifications when ready' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-3xl opacity-20" />
                  <div className="relative glass-effect-strong p-8 rounded-3xl border border-blue-500/40 hover:border-blue-500/70 transition-colors duration-300">
                    <div className="flex items-center gap-4 mb-6 border-b border-slate-700 pb-6">
                      <Smartphone className="w-8 h-8 text-blue-400" />
                      <div>
                        <h4 className="text-white font-bold">Local User Dashboard</h4>
                        <p className="text-slate-400 text-sm">Everything at your fingertips</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { label: 'Recent Prescription', status: 'Ready for pickup', time: '5 min ago' },
                        { label: 'Medicine Search', status: '3 pharmacies in stock', time: 'Nearby' },
                        { label: 'Next Refill', status: 'Amoxicillin, in 5 days', time: 'Reminder' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <div>
                            <p className="text-white font-medium">{item.label}</p>
                            <p className="text-sm text-slate-400">{item.status}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hospital Mode Content */}
          {activeTab === 'hospital' && (
            <div className="animate-slide-up">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Doctor Portal */}
                <div className="group">
                  <div className="relative glass-effect-strong p-8 rounded-3xl h-full hover-lift border border-blue-500/40 hover:border-blue-500/70 hover:bg-white/10 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-20 rounded-3xl blur-2xl transition-opacity duration-500" />
                    
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <Stethoscope className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-gradient transition-colors duration-300">Doctor Portal</h3>
                      <p className="text-sm text-blue-400 mb-4">For healthcare providers</p>
                      
                      <div className="space-y-4">
                        {[
                          'Voice-to-text prescription creation',
                          'Manual entry with AI assistance',
                          'Handwritten prescription OCR',
                          'Patient history & alerts',
                          'Direct pharmacy routing'
                        ].map((feature, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                            <span className="text-slate-400 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-slate-700">
                        <div className="flex items-center gap-2">
                          <Mic className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-blue-400">Save 10+ minutes per patient</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pharmacy Portal */}
                <div className="group">
                  <div className="relative glass-effect-strong p-8 rounded-3xl h-full hover-lift border border-green-500/40 hover:border-green-500/70 hover:bg-white/10 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-20 rounded-3xl blur-2xl transition-opacity duration-500" />
                    
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <Building className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-gradient transition-colors duration-300">Pharmacy Portal</h3>
                      <p className="text-sm text-green-400 mb-4">For pharmacy staff</p>
                      
                      <div className="space-y-4">
                        {[
                          'Instant prescription receipt',
                          'Real-time inventory sync',
                          'Automated preparation queue',
                          'Patient notification system',
                          'Billing integration'
                        ].map((feature, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                            <span className="text-slate-400 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-slate-700">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400">Prepare before patient arrives</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Portal */}
                <div className="group">
                  <div className="relative glass-effect-strong p-8 rounded-3xl h-full hover-lift border border-purple-500/40 hover:border-purple-500/70 hover:bg-white/10 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 rounded-3xl blur-2xl transition-opacity duration-500" />
                    
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-gradient transition-colors duration-300">Patient Portal</h3>
                      <p className="text-sm text-purple-400 mb-4">For patients & families</p>
                      
                      <div className="space-y-4">
                        {[
                          'View digital prescriptions',
                          'Real-time status tracking',
                          'Pharmacy location & pricing',
                          'Refill reminders',
                          'Family account linking'
                        ].map((feature, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" />
                            <span className="text-slate-400 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-slate-700">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-purple-400">Never miss an update</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works - Workflow Diagram */}
      <section className="relative py-32 px-4">
        <div className="w-full max-w-6xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              How MediSync <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Works</span>
            </h2>
            <p className="text-slate-400 text-lg">From prescription to pickup in 4 simple steps</p>
          </div>

          {/* Workflow Cards */}
          <div className="relative flex flex-col lg:flex-row items-start justify-between gap-8">

            {/* Step 1: Doctor */}
            <div className="relative flex-1 w-full group">
              <div className="step-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
                <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-xl">1</div>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-3">Doctor</h3>
                <div className="space-y-2">
                  {[
                    { icon: Mic, text: 'Voice-to-text prescription', color: 'text-blue-400' },
                    { icon: Scan, text: 'OCR handwritten scripts', color: 'text-purple-400' },
                    { icon: FileText, text: 'Digital formatting', color: 'text-green-400' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded-lg">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" /><span>30 seconds</span>
                </div>
              </div>
              <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="w-6 h-6 text-blue-400 animate-pulse" />
              </div>
            </div>

            {/* Step 2: AI Engine */}
            <div className="relative flex-1 w-full group">
              <div className="step-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-xl">2</div>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-3">AI Engine</h3>
                <div className="space-y-2">
                  {[
                    { icon: Sparkles, text: 'Real-time processing', color: 'text-yellow-400' },
                    { icon: CheckCircle2, text: 'Dosage validation', color: 'text-green-400' },
                    { icon: Zap, text: 'Instant structuring', color: 'text-purple-400' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded-lg">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" /><span>2 seconds</span>
                </div>
              </div>
              <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="w-6 h-6 text-purple-400 animate-pulse" />
              </div>
            </div>

            {/* Step 3: Pharmacy */}
            <div className="relative flex-1 w-full group">
              <div className="step-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
                <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-xl">3</div>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-3">Pharmacy</h3>
                <div className="space-y-2">
                  {[
                    { icon: Package, text: 'Instant receipt', color: 'text-green-400' },
                    { icon: Map, text: 'Inventory check', color: 'text-blue-400' },
                    { icon: Bell, text: 'Prep notification', color: 'text-yellow-400' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded-lg">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" /><span>Prepped before arrival</span>
                </div>
              </div>
              <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="w-6 h-6 text-green-400 animate-pulse" />
              </div>
            </div>

            {/* Step 4: Patient */}
            <div className="relative flex-1 w-full group">
              <div className="step-card bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
                <div className="absolute -top-4 -left-2 w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-xl">4</div>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-3">Patient</h3>
                <div className="space-y-2">
                  {[
                    { icon: Bell, text: 'Ready notification', color: 'text-orange-400' },
                    { icon: FileText, text: 'Digital prescription', color: 'text-blue-400' },
                    { icon: CheckCircle2, text: 'Zero wait pickup', color: 'text-green-400' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded-lg">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" /><span>Ready immediately</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connecting SVG line (desktop) */}
          <svg className="absolute top-1/2 left-0 w-full h-32 pointer-events-none hidden lg:block" style={{ transform: 'translateY(-50%)' }}>
            <defs>
              <linearGradient id="wf-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="50%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <filter id="wf-glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <path d="M 15% 50% L 85% 50%" stroke="url(#wf-gradient)" strokeWidth="2" strokeDasharray="8 8" filter="url(#wf-glow)" className="animate-pulse" />
            <circle cx="25%" cy="50%" r="4" fill="#60a5fa" filter="url(#wf-glow)">
              <animate attributeName="cx" values="15%;85%;15%" dur="8s" repeatCount="indefinite" />
            </circle>
          </svg>

          {/* Bottom Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Time', value: '< 5 min', icon: Clock, color: 'text-blue-400' },
              { label: 'Accuracy', value: '99.9%', icon: CheckCircle2, color: 'text-green-400' },
              { label: 'Steps', value: '4', icon: Cpu, color: 'text-purple-400' },
              { label: 'Wait Time', value: '0 min', icon: Zap, color: 'text-orange-400' },
            ].map((stat, i) => (
              <div key={i} className="step-badge rounded-xl p-4 text-center">
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Mobile Timeline */}
          <div className="mt-8 lg:hidden">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-orange-500" />
              {[
                { step: 1, title: 'Doctor creates prescription', time: '30s', color: 'from-blue-500 to-blue-600' },
                { step: 2, title: 'AI processes & validates', time: '2s', color: 'from-purple-500 to-purple-600' },
                { step: 3, title: 'Pharmacy prepares medicine', time: 'Before arrival', color: 'from-green-500 to-green-600' },
                { step: 4, title: 'Patient picks up', time: 'Zero wait', color: 'from-orange-500 to-orange-600' },
              ].map((item, i) => (
                <div key={i} className="relative flex items-start gap-4 mb-6 pl-8">
                  <div className={`absolute left-0 w-8 h-8 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                    {item.step}
                  </div>
                  <div className="flex-1 glass-effect-3d p-3 rounded-lg">
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Metrics with 3D cards */}
      <section className="relative py-32 px-4">
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
      <section className="relative py-32 px-4 overflow-hidden">
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