import { Sun, CloudSun, Moon, Pill, Eye, FileText, History, ChevronRight } from 'lucide-react';

interface ActiveMedication {
  name: string;
  type: string;
  category: string;
  statusBadge: string;
  statusColor?: string;
  times: string[];
  progressLabel: string;
  complianceLabel: string;
  progress: number;
}

interface HistoricMedication {
  name: string;
  strength: string;
  doctor: string;
  dateRange: string;
}

interface MedicationsTabProps {
  activeMedications: ActiveMedication[];
  historicMedications: HistoricMedication[];
}

export default function MedicationsTab({ activeMedications, historicMedications }: MedicationsTabProps) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-600 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-5xl font-black text-brand-900 font-display tracking-tight">My Medications</h2>
          <p className="text-brand-500 text-lg font-medium max-w-xl leading-relaxed">
            Manage your active prescriptions and review your medical history. Our clinical curator ensures your therapeutic journey is safe and clearly documented.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between border-l-4 border-brand-900 pl-4">
          <h3 className="text-xl font-black text-brand-900 font-display tracking-tight uppercase">Active Prescriptions</h3>
          <span className="text-[10px] font-black text-brand-400 tracking-widest">{activeMedications.length} ACTIVE ITEMS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeMedications.map((med, i) => (
            <div key={i} className="bg-white rounded-[32px] p-8 border border-brand-900/5 shadow-sm space-y-8 group hover:shadow-2xl hover:shadow-brand-900/10 transition-all duration-500 flex flex-col justify-between">
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">{med.category}</span>
                    <h4 className="text-3xl font-black text-brand-900 font-display">{med.name}</h4>
                    <p className="text-sm font-bold text-slate-400">{med.type}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase whitespace-nowrap ${med.statusColor || 'bg-emerald-50/10 text-emerald-600'}`}>
                    {med.statusBadge}
                  </span>
                </div>

                <div className="flex gap-6">
                  {med.times.map((time, idx) => (
                    <div key={idx} className="flex items-center gap-2 opacity-60">
                      {time === 'Morning' && <Sun className="w-4 h-4 text-amber-500" />}
                      {time === 'Noon' && <CloudSun className="w-4 h-4 text-slate-400" />}
                      {time === 'Night' && <Moon className="w-4 h-4 text-brand-900" />}
                      <span className="text-xs font-bold text-brand-900 whitespace-nowrap">{time}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                    <span className="text-brand-500">{med.progressLabel}</span>
                    <span className="text-brand-900">{med.complianceLabel}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all duration-1000" style={{ width: `${med.progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4 pt-8 border-t border-slate-50">
                 <button className="col-span-4 bg-[#f59e0b] hover:bg-[#d97706] text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95">
                   Order Refill
                 </button>
                 <button className="col-span-1 border-2 border-slate-100 rounded-xl flex items-center justify-center text-brand-900 hover:bg-slate-50 transition-colors">
                   <Eye className="w-6 h-6" />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-100/50 rounded-[40px] p-10 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-brand-900 font-display tracking-tight">Prescription History</h3>
          <button className="flex items-center gap-2 text-xs font-black text-brand-500 hover:text-brand-900 transition-colors uppercase tracking-widest">
             Download PDF Report <FileText className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {historicMedications.map((item, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all group cursor-pointer border border-transparent hover:border-brand-500/20">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-emerald-500/5 rounded-2xl flex items-center justify-center border border-emerald-500/10 group-hover:bg-emerald-500/10 transition-colors">
                    <History className="w-6 h-6 text-emerald-500" />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-xl font-bold text-brand-900 font-display">{item.name}</h4>
                    <p className="text-xs font-medium text-slate-400">{item.strength} • Prescribed by {item.doctor}</p>
                 </div>
              </div>
              <div className="flex items-center gap-10">
                 <div className="text-right hidden md:block text-nowrap">
                    <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Date Range</p>
                    <p className="text-sm font-bold text-brand-900">{item.dateRange}</p>
                 </div>
                 <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-brand-900 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
