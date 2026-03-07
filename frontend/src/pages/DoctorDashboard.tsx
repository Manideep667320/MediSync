import { useState } from 'react';
import { LayoutDashboard, PlusCircle, Users, History, BarChart, Settings, Mic, Edit, X, Send, LogOut } from 'lucide-react';
import { useRouter } from '../components/Router';
import { useAuth } from '../context/AuthContext';

interface Medicine {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

export default function DoctorDashboard() {
  const { navigate } = useRouter();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCreating, setIsCreating] = useState(false);
  const [mode, setMode] = useState<'voice' | 'manual'>('manual');
  const [prescription, setPrescription] = useState({
    patient_name: '',
    age: '',
    diagnosis: '',
    symptoms: '',
    medicines: [] as Medicine[],
    notes: '',
  });

  const [currentMedicine, setCurrentMedicine] = useState<Medicine>({
    medicine_name: '',
    dosage: '',
    frequency: 'Twice daily',
    duration: '',
    instructions: '',
    quantity: 1,
  });

  const addMedicine = () => {
    if (currentMedicine.medicine_name && currentMedicine.dosage && currentMedicine.duration) {
      setPrescription({
        ...prescription,
        medicines: [...prescription.medicines, currentMedicine],
      });
      setCurrentMedicine({
        medicine_name: '',
        dosage: '',
        frequency: 'Twice daily',
        duration: '',
        instructions: '',
        quantity: 1,
      });
    }
  };

  const removeMedicine = (index: number) => {
    setPrescription({
      ...prescription,
      medicines: prescription.medicines.filter((_, i) => i !== index),
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new', label: 'New Prescription', icon: PlusCircle },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 glass-sidebar p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gradient font-display">MediSync</h2>
          <p className="text-blue-400/70 text-sm">Doctor Portal</p>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'new') setIsCreating(true);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              DS
            </div>
            <div>
              <div className="font-semibold text-white text-sm">Dr. Sarah Johnson</div>
              <div className="text-xs text-slate-500">General Physician</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-400 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-white font-display">Dashboard</h1>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[
                { label: "Today's Prescriptions", value: '12', gradient: 'from-blue-500 to-cyan-500', glow: 'stat-card-blue' },
                { label: 'Active Patients', value: '48', gradient: 'from-emerald-500 to-green-500', glow: 'stat-card-green' },
                { label: 'Pending Reviews', value: '3', gradient: 'from-amber-500 to-yellow-500', glow: 'stat-card-yellow' },
                { label: 'Completed', value: '156', gradient: 'from-purple-500 to-pink-500', glow: 'stat-card-purple' },
              ].map((stat, index) => (
                <div key={index} className={`glass-card p-6 ${stat.glow}`}>
                  <div className="text-sm text-slate-400 mb-2">{stat.label}</div>
                  <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 text-white font-display">Recent Prescriptions</h2>
              <div className="space-y-3">
                {[
                  { id: 'RX001', patient: 'John Doe', date: '2026-02-14', status: 'Completed' },
                  { id: 'RX002', patient: 'Jane Smith', date: '2026-02-15', status: 'Active' },
                ].map((rx) => (
                  <div key={rx.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/8 transition-colors">
                    <div>
                      <div className="font-semibold text-white">{rx.id}</div>
                      <div className="text-sm text-slate-400">{rx.patient}</div>
                    </div>
                    <div className="text-sm text-slate-500">{rx.date}</div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${rx.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                    >
                      {rx.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'new' || isCreating) && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white font-display">Create Prescription</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('voice')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${mode === 'voice'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-glow-blue'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                    }`}
                >
                  <Mic className="w-5 h-5" />
                  Voice Input
                </button>
                <button
                  onClick={() => setMode('manual')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${mode === 'manual'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-glow-blue'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                    }`}
                >
                  <Edit className="w-5 h-5" />
                  Manual Entry
                </button>
              </div>
            </div>

            {mode === 'voice' && (
              <div className="glass-card p-8 text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white font-display">Voice-to-Text Prescription</h3>
                <p className="text-slate-400 mb-6">Click the button below and speak your prescription naturally</p>
                <button className="btn-gradient px-8 py-4 rounded-xl font-semibold text-lg">
                  <span className="relative z-10">Start Recording</span>
                </button>
                <p className="text-sm text-slate-500 mt-4">Real-time transcription will appear as you speak</p>
              </div>
            )}

            {mode === 'manual' && (
              <div className="glass-card p-8">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Patient Name *</label>
                      <input
                        type="text"
                        value={prescription.patient_name}
                        onChange={(e) => setPrescription({ ...prescription, patient_name: e.target.value })}
                        className="w-full px-4 py-3 glass-input"
                        placeholder="Enter patient name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Age *</label>
                      <input
                        type="number"
                        value={prescription.age}
                        onChange={(e) => setPrescription({ ...prescription, age: e.target.value })}
                        className="w-full px-4 py-3 glass-input"
                        placeholder="Enter age"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Diagnosis *</label>
                    <textarea
                      value={prescription.diagnosis}
                      onChange={(e) => setPrescription({ ...prescription, diagnosis: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 glass-input"
                      placeholder="Enter diagnosis"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Symptoms</label>
                    <textarea
                      value={prescription.symptoms}
                      onChange={(e) => setPrescription({ ...prescription, symptoms: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 glass-input"
                      placeholder="Enter symptoms"
                    />
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-bold mb-4 text-white font-display">Medicines</h3>

                    {prescription.medicines.length > 0 && (
                      <div className="mb-6 space-y-2">
                        {prescription.medicines.map((med, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <div className="flex-1 grid grid-cols-5 gap-4">
                              <div>
                                <div className="text-xs text-slate-500">Medicine</div>
                                <div className="font-semibold text-white">{med.medicine_name}</div>
                              </div>
                              <div>
                                <div className="text-xs text-slate-500">Dosage</div>
                                <div className="text-slate-300">{med.dosage}</div>
                              </div>
                              <div>
                                <div className="text-xs text-slate-500">Frequency</div>
                                <div className="text-slate-300">{med.frequency}</div>
                              </div>
                              <div>
                                <div className="text-xs text-slate-500">Duration</div>
                                <div className="text-slate-300">{med.duration}</div>
                              </div>
                              <div>
                                <div className="text-xs text-slate-500">Quantity</div>
                                <div className="text-slate-300">{med.quantity}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeMedicine(index)}
                              className="ml-4 text-red-400 hover:text-red-300"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="bg-white/5 p-6 rounded-xl border border-white/5 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">Medicine Name *</label>
                          <input
                            type="text"
                            value={currentMedicine.medicine_name}
                            onChange={(e) =>
                              setCurrentMedicine({ ...currentMedicine, medicine_name: e.target.value })
                            }
                            className="w-full px-4 py-2 glass-input"
                            placeholder="e.g., Amoxicillin"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">Dosage *</label>
                          <input
                            type="text"
                            value={currentMedicine.dosage}
                            onChange={(e) => setCurrentMedicine({ ...currentMedicine, dosage: e.target.value })}
                            className="w-full px-4 py-2 glass-input"
                            placeholder="e.g., 500mg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">Frequency *</label>
                          <select
                            value={currentMedicine.frequency}
                            onChange={(e) => setCurrentMedicine({ ...currentMedicine, frequency: e.target.value })}
                            className="w-full px-4 py-2 glass-input"
                          >
                            <option>Once daily</option>
                            <option>Twice daily</option>
                            <option>Three times daily</option>
                            <option>Four times daily</option>
                            <option>Every 4 hours</option>
                            <option>Every 6 hours</option>
                            <option>Every 8 hours</option>
                            <option>As needed (PRN)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">Duration *</label>
                          <input
                            type="text"
                            value={currentMedicine.duration}
                            onChange={(e) => setCurrentMedicine({ ...currentMedicine, duration: e.target.value })}
                            className="w-full px-4 py-2 glass-input"
                            placeholder="e.g., 7 days"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">Quantity</label>
                          <input
                            type="number"
                            value={currentMedicine.quantity}
                            onChange={(e) =>
                              setCurrentMedicine({ ...currentMedicine, quantity: parseInt(e.target.value) })
                            }
                            className="w-full px-4 py-2 glass-input"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2">Instructions</label>
                          <input
                            type="text"
                            value={currentMedicine.instructions}
                            onChange={(e) =>
                              setCurrentMedicine({ ...currentMedicine, instructions: e.target.value })
                            }
                            className="w-full px-4 py-2 glass-input"
                            placeholder="e.g., Take with food"
                          />
                        </div>
                      </div>
                      <button
                        onClick={addMedicine}
                        className="btn-gradient px-6 py-2 rounded-xl font-semibold"
                      >
                        <span className="relative z-10">Add Medicine</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Doctor's Notes</label>
                    <textarea
                      value={prescription.notes}
                      onChange={(e) => setPrescription({ ...prescription, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 glass-input"
                      placeholder="Additional instructions or notes"
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button className="px-6 py-3 bg-white/5 text-slate-300 rounded-xl font-semibold hover:bg-white/10 transition-colors border border-white/10">
                      Save as Draft
                    </button>
                    <button className="px-6 py-3 bg-white/5 text-slate-300 rounded-xl font-semibold hover:bg-white/10 transition-colors border border-white/10">
                      Preview PDF
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 btn-gradient px-6 py-3 rounded-xl font-semibold">
                      <span className="relative z-10 flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Send to Pharmacy
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}