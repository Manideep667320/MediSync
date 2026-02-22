import { useState } from 'react';
import { LayoutDashboard, PlusCircle, Users, History, BarChart, Settings, Mic, Edit, X, Send } from 'lucide-react';

interface Medicine {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

export default function DoctorDashboard() {
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new', label: 'New Prescription', icon: PlusCircle },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="w-full md:w-64 bg-blue-900 text-white p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">MediSync</h2>
          <p className="text-blue-200 text-sm">Doctor Portal</p>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pt-6 border-t border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
              DS
            </div>
            <div>
              <div className="font-semibold">Dr. Sarah Johnson</div>
              <div className="text-sm text-blue-200">General Physician</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Today\'s Prescriptions', value: '12', color: 'blue' },
                { label: 'Active Patients', value: '48', color: 'green' },
                { label: 'Pending Reviews', value: '3', color: 'yellow' },
                { label: 'Completed', value: '156', color: 'gray' },
              ].map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="text-sm text-gray-500 mb-2">{stat.label}</div>
                  <div className={`text-4xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Recent Prescriptions</h2>
              <div className="space-y-3">
                {[
                  { id: 'RX001', patient: 'John Doe', date: '2026-02-14', status: 'Completed' },
                  { id: 'RX002', patient: 'Jane Smith', date: '2026-02-15', status: 'Active' },
                ].map((rx) => (
                  <div key={rx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">{rx.id}</div>
                      <div className="text-sm text-gray-600">{rx.patient}</div>
                    </div>
                    <div className="text-sm text-gray-500">{rx.date}</div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        rx.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
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
              <h1 className="text-3xl font-bold text-gray-900">Create Prescription</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('voice')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    mode === 'voice'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                  Voice Input
                </button>
                <button
                  onClick={() => setMode('manual')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    mode === 'manual'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Edit className="w-5 h-5" />
                  Manual Entry
                </button>
              </div>
            </div>

            {mode === 'voice' && (
              <div className="bg-white rounded-xl shadow-md p-8 text-center mb-6">
                <Mic className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">Voice-to-Text Prescription</h3>
                <p className="text-gray-600 mb-6">Click the button below and speak your prescription naturally</p>
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Start Recording
                </button>
                <p className="text-sm text-gray-500 mt-4">Real-time transcription will appear as you speak</p>
              </div>
            )}

            {mode === 'manual' && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Name *</label>
                      <input
                        type="text"
                        value={prescription.patient_name}
                        onChange={(e) => setPrescription({ ...prescription, patient_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="Enter patient name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Age *</label>
                      <input
                        type="number"
                        value={prescription.age}
                        onChange={(e) => setPrescription({ ...prescription, age: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="Enter age"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnosis *</label>
                    <textarea
                      value={prescription.diagnosis}
                      onChange={(e) => setPrescription({ ...prescription, diagnosis: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Enter diagnosis"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Symptoms</label>
                    <textarea
                      value={prescription.symptoms}
                      onChange={(e) => setPrescription({ ...prescription, symptoms: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Enter symptoms"
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">Medicines</h3>

                    {prescription.medicines.length > 0 && (
                      <div className="mb-6 space-y-2">
                        {prescription.medicines.map((med, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                            <div className="flex-1 grid grid-cols-5 gap-4">
                              <div>
                                <div className="text-xs text-gray-500">Medicine</div>
                                <div className="font-semibold text-gray-900">{med.medicine_name}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Dosage</div>
                                <div className="text-gray-900">{med.dosage}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Frequency</div>
                                <div className="text-gray-900">{med.frequency}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Duration</div>
                                <div className="text-gray-900">{med.duration}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Quantity</div>
                                <div className="text-gray-900">{med.quantity}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeMedicine(index)}
                              className="ml-4 text-red-600 hover:text-red-700"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine Name *</label>
                          <input
                            type="text"
                            value={currentMedicine.medicine_name}
                            onChange={(e) =>
                              setCurrentMedicine({ ...currentMedicine, medicine_name: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            placeholder="e.g., Amoxicillin"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Dosage *</label>
                          <input
                            type="text"
                            value={currentMedicine.dosage}
                            onChange={(e) => setCurrentMedicine({ ...currentMedicine, dosage: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            placeholder="e.g., 500mg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency *</label>
                          <select
                            value={currentMedicine.frequency}
                            onChange={(e) => setCurrentMedicine({ ...currentMedicine, frequency: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
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
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Duration *</label>
                          <input
                            type="text"
                            value={currentMedicine.duration}
                            onChange={(e) => setCurrentMedicine({ ...currentMedicine, duration: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            placeholder="e.g., 7 days"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                          <input
                            type="number"
                            value={currentMedicine.quantity}
                            onChange={(e) =>
                              setCurrentMedicine({ ...currentMedicine, quantity: parseInt(e.target.value) })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
                          <input
                            type="text"
                            value={currentMedicine.instructions}
                            onChange={(e) =>
                              setCurrentMedicine({ ...currentMedicine, instructions: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            placeholder="e.g., Take with food"
                          />
                        </div>
                      </div>
                      <button
                        onClick={addMedicine}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Add Medicine
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor's Notes</label>
                    <textarea
                      value={prescription.notes}
                      onChange={(e) => setPrescription({ ...prescription, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Additional instructions or notes"
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                      Save as Draft
                    </button>
                    <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                      Preview PDF
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      <Send className="w-5 h-5" />
                      Send to Pharmacy
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