import { useState, useRef } from 'react';
import { LayoutDashboard, PlusCircle, Users, History, BarChart, Settings, Mic, Edit, X, Send, LogOut, Loader2, Square, Plus } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
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
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [prescription, setPrescription] = useState({
    patient_name: '',
    age: '',
    diagnosis: '',
    symptoms: '',
    medicines: [] as Medicine[],
    notes: '',
  });

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const addMedicine = () => {
    setPrescription(prev => ({
      ...prev,
      medicines: [...prev.medicines, {
        medicine_name: '',
        dosage: '',
        frequency: 'Twice daily',
        duration: '',
        instructions: '',
        quantity: 1,
      }],
    }));
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string | number) => {
    const updated = [...prescription.medicines];
    updated[index] = { ...updated[index], [field]: value };
    setPrescription({ ...prescription, medicines: updated });
  };

  const removeMedicine = (index: number) => {
    setPrescription(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access the microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'prescription-audio.webm');

      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${backendUrl}/doctor/voice-prescription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success && result.data && result.data.prescription) {
        const aiPrescription = result.data.prescription;
        const meds: Medicine[] = (aiPrescription.medicines || []).map((m: any) => ({
          medicine_name: m.medicine_name || '',
          dosage: m.dosage || '',
          frequency: m.frequency || 'Twice daily',
          duration: m.duration || '',
          instructions: m.instructions || '',
          quantity: m.quantity || 1,
        }));

        // Fill patient details and all medicines into the existing editable form fields
        setPrescription(prev => ({
          ...prev,
          patient_name: aiPrescription.patient_name || prev.patient_name,
          age: aiPrescription.age || prev.age,
          diagnosis: aiPrescription.diagnosis || prev.diagnosis,
          symptoms: aiPrescription.symptoms || prev.symptoms,
          notes: aiPrescription.notes || prev.notes,
          medicines: meds.length > 0 ? meds : prev.medicines,
        }));

        setShowVoicePanel(false);
      } else {
        throw new Error(result.message || 'Failed to process voice prescription');
      }
    } catch (error: any) {
      console.error('Audio processing error:', error);
      alert(error.message || 'Error processing audio. Make sure the AssemblyAI API key is set in the backend.');
    } finally {
      setIsProcessing(false);
    }
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
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50 flex w-full flex-col md:flex-row">
        {/* Sidebar */}
        <Sidebar collapsible="icon" className="glass-sidebar border-r-0">
          <SidebarHeader className="p-6 pb-2">
            <div className="flex items-center justify-between group-data-[collapsible=icon]:hidden">
              <h2 className="text-2xl font-bold text-gradient font-display">MediSync</h2>
              <SidebarTrigger />
            </div>
            <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
              <SidebarTrigger />
            </div>
            <p className="text-brand-700/70 text-sm group-data-[collapsible=icon]:hidden">Doctor Portal</p>
          </SidebarHeader>

          <SidebarContent className="px-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => {
                          setActiveTab(item.id);
                          if (item.id === 'new') {
                            setIsCreating(true);
                          } else {
                            setIsCreating(false);
                          }
                        }}
                        isActive={activeTab === item.id}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id
                          ? 'bg-gradient-to-r from-brand-500/20 to-purple-500/20 text-brand-900 border border-brand-500/30'
                          : 'text-brand-700 hover:text-brand-900 hover:bg-brand-900/5'
                          }`}
                        style={{ height: 'auto' }}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-6 pt-2 border-t border-brand-900/10 group-data-[collapsible=icon]:p-2">
            <div className="flex items-center gap-3 mb-4 group-data-[collapsible=icon]:justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-purple-600 rounded-full flex items-center justify-center text-brand-900 font-semibold text-sm flex-shrink-0">
                DS
              </div>
              <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
                <div className="font-semibold text-brand-900 text-sm truncate">Dr. Sarah Johnson</div>
                <div className="text-xs text-brand-500 truncate">General Physician</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-brand-500 hover:text-red-400 rounded-lg transition-colors text-sm group-data-[collapsible=icon]:px-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </button>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="bg-transparent flex-1 flex flex-col w-full h-full">
          <header className="flex h-14 items-center gap-2 px-4 md:hidden">
            <SidebarTrigger />
          </header>
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            {activeTab === 'dashboard' && !isCreating && (
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-display">Morning, Dr. Sarah Johnson</h1>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900 font-display">
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                    <div className="text-sm text-slate-500">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* LEFT COLUMN (2/3) */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Today's Appointments */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                          <span className="text-[#508991]">●</span> Today's Appointments
                        </h2>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                          8 Patients Remaining
                        </span>
                      </div>
                      <div className="space-y-3">
                        {/* NOW */}
                        <div className="card-clean p-4 border-l-4 border-l-[#508991]">
                          <div className="flex items-center gap-4">
                            <div className="text-center min-w-[50px]">
                              <div className="text-[10px] font-bold text-white bg-[#508991] rounded px-1.5 py-0.5 mb-0.5">NOW</div>
                              <div className="text-sm font-bold text-slate-900">10:00</div>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">Arthur Morgan</div>
                              <div className="text-sm text-slate-500">Post-Op Recovery Checkup · Room 402</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-red-100 text-red-600 rounded text-xs font-bold flex items-center justify-center">H</span>
                              <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded text-xs font-bold flex items-center justify-center">!</span>
                            </div>
                            <button className="px-4 py-2 bg-[#508991] text-white text-sm font-semibold rounded-lg hover:bg-[#457a81] transition-colors">
                              Start Session
                            </button>
                          </div>
                        </div>
                        {/* NEXT */}
                        <div className="card-clean p-4">
                          <div className="flex items-center gap-4">
                            <div className="text-center min-w-[50px]">
                              <div className="text-[10px] font-bold text-[#508991] bg-[#508991]/10 rounded px-1.5 py-0.5 mb-0.5">NEXT</div>
                              <div className="text-sm font-bold text-slate-900">10:45</div>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">Elena Vance</div>
                              <div className="text-sm text-slate-500">Routine Bloodwork Review · Telehealth</div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><circle cx="3" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="13" cy="8" r="1.5" /></svg>
                            </div>
                          </div>
                        </div>
                        {/* LATER */}
                        <div className="card-clean p-4">
                          <div className="flex items-center gap-4">
                            <div className="text-center min-w-[50px]">
                              <div className="text-[10px] font-bold text-slate-400 bg-slate-100 rounded px-1.5 py-0.5 mb-0.5">LATER</div>
                              <div className="text-sm font-bold text-slate-900">11:30</div>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">Gordon Freeman</div>
                              <div className="text-sm text-slate-500">Annual Physical · Room 105</div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><circle cx="3" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="13" cy="8" r="1.5" /></svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Lab Results */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                          <span className="text-[#508991]">●</span> Recent Lab Results
                        </h2>
                        <button className="text-sm font-medium text-[#508991] hover:underline">View All Results</button>
                      </div>
                      <div className="card-clean overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Patient</th>
                              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Test Type</th>
                              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Timestamp</th>
                              <th className="px-4 py-3"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { patient: 'Sarah Connor', test: 'CBC with Differential', status: 'Normal', statusColor: 'text-emerald-600 bg-emerald-50', time: '2 hours ago' },
                              { patient: 'John Doe', test: 'Lipid Panel', status: 'Critical', statusColor: 'text-red-600 bg-red-50', time: '5 hours ago' },
                              { patient: 'Linda Blair', test: 'TSH Reflex', status: 'Reviewing', statusColor: 'text-amber-600 bg-amber-50', time: 'Yesterday' },
                            ].map((row, i) => (
                              <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                <td className="px-4 py-3 font-medium text-slate-900">{row.patient}</td>
                                <td className="px-4 py-3 text-slate-600">{row.test}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${row.statusColor}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {row.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500">{row.time}</td>
                                <td className="px-4 py-3 text-center">
                                  <button className="text-slate-400 hover:text-[#508991]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN (1/3) */}
                  <div className="space-y-6">
                    {/* Patient Throughput */}
                    <div className="rounded-xl p-5 text-white" style={{ background: '#1B3A3A', border: '1px solid #264d4d' }}>
                      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8ec8ce' }}>Patient Throughput</div>
                      <div className="flex items-end gap-3 mt-2">
                        <div className="text-4xl font-bold text-white">68%</div>
                        <div className="text-sm font-medium mb-1" style={{ color: '#4ade80' }}>+12% from yesterday</div>
                      </div>
                      <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: '#0f2424' }}>
                        <div className="h-full w-[68%] rounded-full" style={{ background: '#508991' }} />
                      </div>
                    </div>

                    {/* Pending Prescriptions */}
                    <div className="card-clean p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 font-display">Pending Prescriptions</h3>
                        <span className="text-xs font-medium text-slate-500">3 Tasks</span>
                      </div>
                      <div className="space-y-3">
                        {[
                          { med: 'Amoxicillin Refill', patient: 'Patient: David Gallan', color: 'bg-[#508991]' },
                          { med: 'Lisinopril 10mg', patient: 'Patient: Peter Murphy', color: 'bg-[#2d3a5c]' },
                          { med: 'Insulin Aspart', patient: 'Patient: Siouxsie Sioux', color: 'bg-[#d4a252]' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center`}>
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{item.med}</div>
                              <div className="text-xs text-slate-500">{item.patient}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Clinical Reminders */}
                    <div className="card-clean p-5" style={{ background: '#E8F5F4', borderColor: '#b5dfe0' }}>
                      <h3 className="font-bold text-[#172A3A] font-display mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#508991]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Clinical Reminders
                      </h3>
                      <ul className="space-y-2.5 text-sm text-[#004346]">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#508991] mt-1.5 flex-shrink-0" />
                          Submit peer review for oncology journal by EOD.
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#508991] mt-1.5 flex-shrink-0" />
                          3 lab results from Friday still need validation.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'new' || isCreating) && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-bold text-brand-900 font-display">Create Prescription</h1>
                  <button
                    onClick={() => setShowVoicePanel(v => !v)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${showVoicePanel
                      ? 'bg-gradient-to-r from-brand-500 to-purple-600 text-brand-900 shadow-sm'
                      : 'bg-brand-900/5 text-brand-700 hover:bg-brand-900/10 border border-brand-900/10'
                      }`}
                  >
                    <Mic className="w-5 h-5" />
                    {showVoicePanel ? 'Hide Voice Input' : 'Voice Input'}
                  </button>
                </div>

                {showVoicePanel && (
                  <div className="glass-card p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className={`w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-gradient-to-br from-brand-500 to-purple-600'
                        }`}>
                        <Mic className="w-7 h-7 text-brand-900" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-bold text-brand-900 font-display mb-1">
                          {isProcessing ? 'Processing AI Transcription...' : isRecording ? 'Listening Now...' : 'Voice-to-Text Prescription'}
                        </h3>
                        <p className="text-sm text-brand-500">
                          {isProcessing
                            ? 'Analyzing your voice — patient details and medicines will fill in below.'
                            : isRecording
                              ? 'Speak naturally: patient name, age, diagnosis, symptoms, and medicines.'
                              : 'Example: "Patient John Doe, 45 years, diagnosis acute bronchitis. Prescribe Amoxicillin 500mg twice daily for 7 days."'}
                        </p>
                      </div>
                      {isProcessing ? (
                        <div className="flex items-center gap-3 text-brand-700">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="font-semibold text-sm animate-pulse">Processing...</span>
                        </div>
                      ) : (
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all flex-shrink-0 ${isRecording ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' : 'btn-gradient'
                            }`}
                        >
                          {isRecording ? (
                            <><Square className="w-4 h-4 fill-current" /><span>Stop</span></>
                          ) : (
                            <><Mic className="w-4 h-4" /><span>Start Recording</span></>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="glass-card p-8">
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-brand-800 mb-2">Patient Name *</label>
                        <input
                          type="text"
                          value={prescription.patient_name}
                          onChange={(e) => setPrescription({ ...prescription, patient_name: e.target.value })}
                          className="w-full px-4 py-3 glass-input"
                          placeholder="Enter patient name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-brand-800 mb-2">Age *</label>
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
                      <label className="block text-sm font-semibold text-brand-800 mb-2">Diagnosis *</label>
                      <textarea
                        value={prescription.diagnosis}
                        onChange={(e) => setPrescription({ ...prescription, diagnosis: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 glass-input"
                        placeholder="Enter diagnosis"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-brand-800 mb-2">Symptoms</label>
                      <textarea
                        value={prescription.symptoms}
                        onChange={(e) => setPrescription({ ...prescription, symptoms: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 glass-input"
                        placeholder="Enter symptoms"
                      />
                    </div>

                    <div className="border-t border-brand-900/10 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-brand-900 font-display">Medicines</h3>
                        <button
                          onClick={addMedicine}
                          className="flex items-center gap-2 px-4 py-2 bg-brand-900/5 text-brand-700 hover:bg-brand-900/10 rounded-xl font-semibold transition-colors border border-brand-900/10"
                        >
                          <Plus className="w-4 h-4" />
                          Add Medicine
                        </button>
                      </div>

                      <div className="space-y-4">
                        {prescription.medicines.map((med, index) => (
                          <div key={index} className="bg-brand-900/5 p-6 rounded-xl border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-brand-500">Medicine {index + 1}</span>
                              <button
                                onClick={() => removeMedicine(index)}
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Remove medicine"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-brand-800 mb-2">Medicine Name *</label>
                                <input
                                  type="text"
                                  value={med.medicine_name}
                                  onChange={(e) => updateMedicine(index, 'medicine_name', e.target.value)}
                                  className="w-full px-4 py-2 glass-input"
                                  placeholder="e.g., Amoxicillin"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-brand-800 mb-2">Dosage *</label>
                                <input
                                  type="text"
                                  value={med.dosage}
                                  onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                  className="w-full px-4 py-2 glass-input"
                                  placeholder="e.g., 500mg"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-brand-800 mb-2">Frequency *</label>
                                <select
                                  value={med.frequency}
                                  onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
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
                                <label className="block text-sm font-semibold text-brand-800 mb-2">Duration *</label>
                                <input
                                  type="text"
                                  value={med.duration}
                                  onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                  className="w-full px-4 py-2 glass-input"
                                  placeholder="e.g., 7 days"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-brand-800 mb-2">Quantity</label>
                                <input
                                  type="number"
                                  value={med.quantity}
                                  onChange={(e) => updateMedicine(index, 'quantity', parseInt(e.target.value) || 1)}
                                  className="w-full px-4 py-2 glass-input"
                                  min="1"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-brand-800 mb-2">Instructions</label>
                                <input
                                  type="text"
                                  value={med.instructions}
                                  onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                                  className="w-full px-4 py-2 glass-input"
                                  placeholder="e.g., Take with food"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {prescription.medicines.length === 0 && (
                        <div className="text-center py-8 text-brand-500 bg-brand-900/5 rounded-xl border border-white/5">
                          <p>No medicines added yet. Click "Add Medicine" or use voice input.</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-brand-800 mb-2">Doctor's Notes</label>
                      <textarea
                        value={prescription.notes}
                        onChange={(e) => setPrescription({ ...prescription, notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 glass-input"
                        placeholder="Additional instructions or notes"
                      />
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button className="px-6 py-3 bg-brand-900/5 text-brand-800 rounded-xl font-semibold hover:bg-brand-900/10 transition-colors border border-brand-900/10">
                        Save as Draft
                      </button>
                      <button className="px-6 py-3 bg-brand-900/5 text-brand-800 rounded-xl font-semibold hover:bg-brand-900/10 transition-colors border border-brand-900/10">
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
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}