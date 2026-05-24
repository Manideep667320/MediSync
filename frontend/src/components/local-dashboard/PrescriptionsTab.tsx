import { Plus, Pill, History, AlertCircle } from 'lucide-react';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface DigitalPrescription {
  patientName: string;
  age: string;
  gender: string;
  date: string;
  diagnosis: string;
  medicines: Medicine[];
  doctorNotes: string;
}

interface PrescriptionsTabProps {
  prescriptionHistory: DigitalPrescription[];
  setPrescription: (p: DigitalPrescription | null) => void;
  setActiveTab: (t: string) => void;
  setCurrentStep: (s: 'upload' | 'extracted' | 'pharmacies') => void;
}

export default function PrescriptionsTab({
  prescriptionHistory,
  setPrescription,
  setActiveTab,
  setCurrentStep
}: PrescriptionsTabProps) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-600">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-brand-900 font-display">My Prescriptions</h2>
          <p className="text-brand-500 text-lg font-medium tracking-tight">Access your clinical history of {prescriptionHistory.length} verified records.</p>
        </div>
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setCurrentStep('upload');
          }}
          className="bg-brand-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-900/90 transition-all flex items-center gap-2 shadow-lg shadow-brand-900/10"
        >
          <Plus className="w-5 h-5" /> New Upload
        </button>
      </div>

      {prescriptionHistory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {prescriptionHistory.map((item, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-brand-900/5 shadow-sm group hover:shadow-2xl hover:shadow-brand-900/10 transition-all duration-500 flex flex-col justify-between min-h-[320px]">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="px-4 py-1.5 bg-brand-500/10 text-brand-900 rounded-full text-[10px] font-black tracking-widest uppercase">
                    Clinical Record
                  </div>
                  <span className="text-xs font-bold text-brand-400">{item.date}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-brand-900 font-display leading-tight">{item.diagnosis}</h3>
                  <p className="text-sm font-bold text-brand-500 tracking-tight">Patient: {item.patientName}</p>
                </div>
                <div className="flex -space-x-2">
                  {item.medicines.slice(0, 3).map((_, medIdx) => (
                    <div key={medIdx} className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center">
                      <Pill className="w-4 h-4 text-brand-500" />
                    </div>
                  ))}
                  {item.medicines.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-brand-900 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                      +{item.medicines.length - 3}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Total Meds</span>
                  <span className="text-lg font-black text-brand-900">{item.medicines.length}</span>
                </div>
                <button
                  onClick={() => {
                    setPrescription(item);
                    setActiveTab('dashboard');
                    setCurrentStep('extracted');
                  }}
                  className="px-6 py-3 bg-slate-50 text-brand-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-900 hover:text-white transition-all active:scale-95"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-8 bg-white rounded-[40px] border border-brand-900/5 shadow-sm">
          <div className="w-32 h-32 bg-brand-500/5 rounded-full flex items-center justify-center relative">
            <History className="w-16 h-16 text-brand-500/20" />
            <div className="absolute top-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-brand-500" />
            </div>
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-3xl font-black text-brand-900 font-display">No Clinical History</h3>
            <p className="text-brand-500 font-medium">Your historical records will appear here once you've successfully uploaded and verified your first prescription.</p>
          </div>
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setCurrentStep('upload');
            }}
            className="bg-brand-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-brand-900/20 hover:scale-[1.02] transition-all active:scale-95"
          >
            Upload First Record
          </button>
        </div>
      )}
    </div>
  );
}
