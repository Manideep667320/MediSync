import { Check, FileText, FileSpreadsheet, ChevronRight, Truck, Car, Syringe, HelpCircle, Pill } from 'lucide-react';

interface OrderHistoryItem {
  id: string;
  date: string;
  meds: string;
  pharmacy: string;
  price: number;
}

interface PreferredPharmacy {
  name: string;
  address: string | any;
  hours: string;
}

interface OrdersTabProps {
  liveOrder: any;
  orderHistory: OrderHistoryItem[];
  uploadStatus: { filename: string; progress: number };
  preferredPharmacy: PreferredPharmacy;
}

export default function OrdersTab({
  liveOrder,
  orderHistory,
  uploadStatus,
  preferredPharmacy
}: OrdersTabProps) {
  const getProgressWidth = () => {
    if (!liveOrder || !liveOrder.steps) return '0%';
    const completedCount = liveOrder.steps.filter((s: any) => s.completed).length;
    if (completedCount === 0) return '0%';
    if (completedCount === 1) return '5%';
    if (completedCount === 2) return '33%';
    if (completedCount === 3) return '66%';
    return '100%';
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-600 max-w-[1400px] mx-auto">
      <h2 className="text-4xl font-black text-brand-900 font-display mb-10 tracking-tight">Order History & Tracking</h2>

      <div className="flex flex-col xl:flex-row gap-10">
        {/* Left Column: History & Tracking */}
        <div className="flex-1 space-y-12">
          {/* Live Tracking Card */}
          {liveOrder ? (
            <div className="bg-white rounded-[40px] p-10 border border-brand-900/5 shadow-sm space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="space-y-4">
                  <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black tracking-widest uppercase">
                    {liveOrder.status}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-brand-900 font-display">Order #{liveOrder.orderId}</h3>
                    <p className="text-sm font-bold text-slate-400">
                      Placed on {liveOrder.placedDate || new Date(liveOrder.createdAt).toLocaleDateString()} • {liveOrder.pharmacyId?.name || liveOrder.pharmacy || 'Pharmacy'}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 min-w-[240px]">
                   <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1 text-center">Estimated Pickup</p>
                   <p className="text-lg font-black text-brand-900 text-center leading-tight">
                     {liveOrder.eta ? (liveOrder.eta.split(' — ')[0] || 'Today') : 'Today'} —<br />
                     {liveOrder.eta ? (liveOrder.eta.split(' — ')[1] || 'As Scheduled') : 'As Scheduled'}
                   </p>
                </div>
              </div>

              <div className="relative pt-8 pb-4">
                <div className="absolute top-[48px] left-[5%] right-[5%] h-[3px] bg-slate-100" />
                <div className="absolute top-[48px] left-[5%] h-[3px] bg-[#004346] transition-all duration-500" style={{ width: getProgressWidth() }} />
                
                <div className="flex justify-between items-start relative z-10 px-0">
                  {liveOrder.steps?.map((step: any, i: number) => (
                    <div key={i} className="flex flex-col items-center text-center space-y-4 group">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        step.completed ? 'bg-[#004346] text-white shadow-lg' :
                        step.active ? 'bg-[#004346] text-white shadow-xl scale-110' : 'bg-slate-100 text-slate-300'
                      }`}>
                        {step.completed ? <Check className="w-6 h-6" /> : (step.icon ? <step.icon className="w-6 h-6" /> : (i + 1))}
                      </div>
                      <div className="max-w-[100px]">
                        <p className={`text-[11px] font-black uppercase tracking-tight leading-tight ${step.active || step.completed ? 'text-brand-900' : 'text-slate-300'}`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[40px] p-10 border border-brand-900/5 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[220px]">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                <Truck className="w-8 h-8 text-brand-500/40" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-brand-900 font-display">No Active Orders</h3>
                <p className="text-sm font-medium text-slate-500 max-w-md mt-1">You do not have any orders actively in progress at the moment. Place a new order to start tracking.</p>
              </div>
            </div>
          )}

          {/* Recent History */}
          <div className="space-y-8">
             <div className="flex items-center justify-between border-b border-slate-100 pb-4">
               <h3 className="text-2xl font-black text-brand-900 font-display tracking-tight">Recent History</h3>
               <button className="text-[11px] font-black text-brand-500 hover:text-brand-900 transition-colors uppercase tracking-widest flex items-center gap-2">
                 Download CSV <FileSpreadsheet className="w-4 h-4" />
               </button>
             </div>

             <div className="space-y-6">
               {orderHistory && orderHistory.length > 0 ? (
                 orderHistory.map((order, i) => (
                   <div key={i} className="bg-white rounded-[32px] p-8 border border-brand-900/5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-xl transition-all border-transparent hover:border-brand-500/10">
                      <div className="flex items-center gap-8 flex-1">
                         <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-brand-500/5 transition-colors">
                            <Pill className="w-8 h-8 text-brand-500/40 group-hover:text-brand-500 transition-colors" />
                         </div>
                         <div className="space-y-1">
                            <div className="flex items-center gap-4">
                              <h4 className="text-xl font-black text-brand-900 font-display tracking-tight uppercase">Order #{order.id}</h4>
                              <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">{order.date}</span>
                            </div>
                            <p className="text-sm font-bold text-slate-500">{order.meds}</p>
                            <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest italic mt-1">Pharmacy: {order.pharmacy}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-8 shrink-0">
                         <div className="text-right flex flex-col items-end">
                            <span className="text-2xl font-black text-brand-900">${order.price.toFixed(2)}</span>
                         </div>
                         <div className="flex gap-3">
                           <button className="px-6 py-4 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-brand-900 rounded-xl hover:bg-slate-100 transition-all active:scale-95">
                             View Receipt
                           </button>
                           <button className="px-8 py-4 bg-brand-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-900/90 transition-all shadow-lg shadow-brand-900/10 active:scale-95">
                             Reorder
                           </button>
                         </div>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-12 bg-white rounded-3xl border border-brand-900/5 shadow-sm">
                   <p className="text-brand-500 font-medium">No order history available.</p>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="w-full xl:w-[350px] space-y-8">
           {/* Upload Status */}
           <div className="bg-white rounded-[32px] p-8 border border-brand-900/5 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                 <FileText className="w-4 h-4 text-brand-500" />
                 <h4 className="text-[11px] font-black text-brand-900 uppercase tracking-widest">Upload Status</h4>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                       <FileText className="w-6 h-6 text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-xs font-black text-brand-900 truncate tracking-tight">{uploadStatus.filename}</p>
                       <p className="text-[10px] text-brand-500 font-bold uppercase tracking-widest">Uploading...{uploadStatus.progress}%</p>
                    </div>
                 </div>
                 <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 transition-all duration-1000" style={{ width: `${uploadStatus.progress}%` }} />
                 </div>
              </div>
              <p className="text-[11px] text-brand-500 leading-relaxed font-medium pt-2 italic">
                 Once uploaded, our clinical team will verify the document within 2-4 business hours.
              </p>
           </div>

           {/* Preferred Pharmacy */}
           <div className="bg-[#004346] rounded-[32px] p-8 text-white space-y-8 shadow-2xl shadow-brand-900/20">
              <div className="space-y-6">
                <h4 className="text-xl font-black font-display tracking-tight">Preferred Pharmacy</h4>
                <div className="space-y-4">
                  <div>
                     <p className="text-[10px] font-black text-brand-200 uppercase tracking-widest mb-1 leading-none">Location</p>
                     <p className="text-sm font-bold">{preferredPharmacy.name}</p>
                     <p className="text-xs font-medium text-brand-300/80">
                       {typeof preferredPharmacy.address === 'string' 
                         ? preferredPharmacy.address 
                         : `${preferredPharmacy.address?.street}, ${preferredPharmacy.address?.city}`}
                     </p>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-brand-200 uppercase tracking-widest mb-1 leading-none">Hours Today</p>
                     <p className="text-sm font-bold tracking-tight">{preferredPharmacy.hours}</p>
                  </div>
                </div>
              </div>
              <button className="w-full py-4 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-amber-500/20">
                 Change Pharmacy
              </button>
           </div>

           {/* Help Widget */}
           <div className="bg-emerald-50 rounded-[32px] p-8 border border-emerald-100 space-y-4">
              <h4 className="text-lg font-black text-emerald-900 font-display tracking-tight">Need Help?</h4>
              <p className="text-xs font-medium text-emerald-700 leading-relaxed">
                 Missing an order or having trouble with your scan? Contact our support team immediately.
              </p>
              <button className="flex items-center gap-2 text-[10px] font-black text-emerald-800 uppercase tracking-widest hover:gap-3 transition-all mt-4">
                 Support Center <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
