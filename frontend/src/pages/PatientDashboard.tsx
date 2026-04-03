import { useState, useEffect } from 'react';
import { 
  FileText, Clock, Package, User, Settings, Download, Eye, MapPin, Phone, 
  Map as MapIcon, FileCheck, LogOut, Heart, Activity, Moon, Plus, 
  Calendar, ChevronRight, Search, Bell, Menu, ShieldCheck, Pill, CheckCircle
} from 'lucide-react';
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

export default function PatientDashboard() {
  const { navigate } = useRouter();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [selectedPrescription, setSelectedPrescription] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'prescriptions', label: 'Dashboard', icon: FileText },
    { id: 'orders', label: 'Track Orders', icon: Package },
    { id: 'history', label: 'Health Records', icon: Clock },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${backendUrl}/patient/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data.orders);
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'prescription_sent': return { label: 'RECEIVED BY PHARMACY', type: 'muted' };
      case 'received_by_pharmacy': return { label: 'ORDER CONFIRMED', type: 'info' };
      case 'packing': return { label: 'PACKING MEDICINES', type: 'warning' };
      case 'ready_for_pickup': return { label: 'READY FOR PICKUP', type: 'success' };
      case 'completed': return { label: 'COLLECTED', type: 'success' };
      default: return { label: (status || 'UNKNOWN').toUpperCase().replace(/_/g, ' '), type: 'muted' };
    }
  };

  const appointments = [
    {
      id: 1,
      date: 'THURSDAY, OCT 24',
      doctor: 'Dr. Michael Chen',
      type: 'Cardiology Follow-up',
      time: '10:30 AM — Central Clinic',
      status: 'current',
    },
    {
      id: 2,
      date: 'NOV 12',
      doctor: 'Blood Work Lab',
      type: 'Routine Screening',
      status: 'upcoming',
    },
    {
      id: 3,
      date: 'DEC 05',
      doctor: 'Annual Wellness Exam',
      type: 'Primary Care',
      status: 'upcoming',
    },
  ];

  const healthInsights = [
    {
      label: 'BLOOD PRESSURE',
      value: '118/76',
      unit: 'mmHg',
      status: 'STABLE',
      statusColor: 'text-emerald-500 bg-emerald-500/10',
      description: 'Your readings have remained within the optimal range for the last 14 days. Great work!',
      icon: Heart,
      progress: 45,
    },
    {
      label: 'DAILY ACTIVITY',
      value: '8,420',
      unit: 'Avg Steps',
      status: '+12%',
      statusColor: 'text-emerald-500 bg-emerald-500/10',
      description: 'You\'ve increased your daily step count. This positively impacts your cardiovascular health.',
      icon: Activity,
      progress: 60,
    },
    {
      label: 'SLEEP DURATION',
      value: '6.2',
      unit: 'Hours',
      status: 'ADJUST',
      statusColor: 'text-amber-500 bg-amber-500/10',
      description: 'Consider aiming for 7.5 hours to improve your recovery metrics. Try an earlier wind-down routine.',
      icon: Moon,
      progress: 80,
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50 flex w-full flex-col md:flex-row font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <Sidebar collapsible="icon" className="glass-sidebar border-r-0">
          <SidebarHeader>
            <div className="flex items-center justify-between group-data-[collapsible=icon]:hidden p-6 pb-2">
              <h2 className="text-2xl font-bold text-gradient font-display">MediSync</h2>
              <SidebarTrigger />
            </div>
            <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center p-2">
              <SidebarTrigger />
            </div>
            <p className="px-6 text-emerald-600/70 text-xs font-semibold uppercase tracking-wider group-data-[collapsible=icon]:hidden mb-2">Patient Portal</p>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => {
                          setActiveTab(item.id);
                          setSelectedPrescription(null);
                        }}
                        isActive={activeTab === item.id}
                        className={activeTab === item.id
                          ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-brand-900 border border-emerald-500/30 font-medium'
                          : 'text-brand-700 hover:text-brand-900 hover:bg-brand-900/5'
                        }
                        tooltip={item.label}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-brand-900/10 p-4">
            <div className="flex items-center gap-3 mb-4 group-data-[collapsible=icon]:justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-brand-900 font-semibold text-sm flex-shrink-0 shadow-sm shadow-emerald-500/20">
                JD
              </div>
              <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
                <div className="font-semibold text-brand-900 text-sm truncate">John Doe</div>
                <div className="text-xs text-brand-500 truncate">Patient ID: PT12345</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-brand-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm group-data-[collapsible=icon]:px-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </button>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="bg-transparent flex-1 flex flex-col w-full h-full overflow-hidden">
          <header className="flex h-16 items-center justify-between gap-4 px-6 md:px-8 border-b border-brand-900/5 bg-white/50 backdrop-blur-md sticky top-0 z-10 lg:hidden">
             <div className="flex items-center gap-2">
                <Menu className="w-6 h-6 text-brand-700 lg:hidden" />
                <h2 className="text-xl font-bold text-gradient font-display">MediSync</h2>
             </div>
             <div className="flex items-center gap-4">
               <Bell className="w-5 h-5 text-brand-500" />
               <div className="w-8 h-8 rounded-full bg-emerald-500" />
             </div>
          </header>

          <div className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto custom-scrollbar">
            {activeTab === 'prescriptions' && !selectedPrescription && (
              <div className="max-w-7xl mx-auto space-y-10">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-2">
                    <p className="text-brand-500 font-semibold uppercase tracking-widest text-xs">PATIENT DASHBOARD</p>
                    <h1 className="text-4xl lg:text-5xl font-bold text-brand-900 font-display">Good morning, Alex.</h1>
                    <p className="text-brand-700/80 max-w-xl text-lg">
                      Your health journey is looking steady. You have <span className="text-emerald-600 font-bold">{orders.filter(o => o.status !== 'completed').length} active prescriptions</span> and <span className="text-emerald-600 font-bold">one upcoming visit</span>.
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-4 bg-[#004346] text-white rounded-xl font-bold hover:bg-[#003335] transition-all shadow-lg shadow-emerald-900/20 active:scale-95 whitespace-nowrap">
                    <Plus className="w-5 h-5" />
                    New Consultation
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Left Column: My Prescriptions */}
                  <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-brand-900 font-display flex items-center gap-2">
                        My Prescriptions
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order, idx) => {
                        const statusInfo = getStatusInfo(order.status);
                        return (
                          <div 
                            key={idx} 
                            className="group p-5 bg-white border border-brand-900/5 rounded-2xl hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-500 flex flex-col sm:flex-row items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-5 w-full">
                              <div className="w-14 h-14 rounded-full bg-emerald-50/50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <Pill className="w-7 h-7" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="text-lg font-bold text-brand-900 group-hover:text-emerald-700 transition-colors">
                                  {order.items?.[0]?.medicineName || 'Prescription Order'}
                                </h3>
                                <p className="text-brand-500 text-sm font-medium">
                                  {order.items?.[0]?.dosage || 'View details for dosage'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2 ${
                                statusInfo.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                                statusInfo.type === 'warning' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                                'bg-slate-50 text-slate-500 border border-slate-100'
                              }`}>
                                {statusInfo.type === 'success' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                {statusInfo.label}
                              </span>
                              <button className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all text-emerald-600 hover:bg-emerald-50">
                                Details
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {orders.length === 0 && !loading && (
                        <div className="p-10 text-center bg-white border border-brand-900/5 rounded-2xl text-brand-400 font-bold">
                          No active prescriptions found.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Appointments */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-brand-900 font-display flex items-center gap-3">
                        Appointments
                      </h2>
                      <div className="p-2 bg-white rounded-lg border border-brand-900/5 text-brand-500 hover:text-emerald-500 cursor-pointer transition-colors">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-8 p-6 bg-white border border-brand-900/5 rounded-3xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                      
                      {appointments.map((appt, idx) => (
                        <div key={appt.id} className="relative">
                          {idx !== appointments.length - 1 && (
                            <div className="absolute left-3 top-10 w-0.5 h-16 bg-brand-900/5" />
                          )}
                          
                          {appt.status === 'current' ? (
                            <div className="p-5 border-l-4 border-emerald-500 bg-white rounded-xl shadow-lg shadow-emerald-900/5 space-y-4">
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{appt.date}</p>
                              <div>
                                <h3 className="text-lg font-bold text-brand-900">{appt.doctor}</h3>
                                <p className="text-brand-500 text-sm font-medium">{appt.type}</p>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100/50 text-emerald-900 text-[11px] font-bold">
                                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                {appt.time}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-5 pl-1.5 transition-all hover:translate-x-1">
                              <div className="w-3 h-3 rounded-full bg-brand-900/10 mt-2 border-2 border-white ring-4 ring-brand-900/5" />
                              <div className="space-y-1 pb-2">
                                <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">{appt.date}</p>
                                <h4 className="text-brand-900 font-bold text-sm tracking-tight">{appt.doctor}</h4>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      <button className="w-full py-4 mt-4 bg-emerald-50/50 text-emerald-800 border border-emerald-100/80 rounded-2xl font-bold text-sm hover:bg-emerald-500 hover:text-white transition-all duration-300">
                        Schedule Appointment
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Recent Health Insights */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-brand-900 font-display">Recent Health Insights</h2>
                    <button className="text-emerald-600 font-bold text-sm hover:underline flex items-center gap-1 group">
                      View All Trends
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {healthInsights.map((stat, idx) => (
                      <div key={idx} className="p-6 bg-white border border-brand-900/5 rounded-3xl space-y-6 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-colors -mr-12 -mt-12 rounded-full" />
                        
                        <div className="flex items-center justify-between relative z-10">
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner group-hover:scale-110 transition-transform">
                             <stat.icon className="w-6 h-6" />
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest whitespace-nowrap ${stat.statusColor}`}>
                            {stat.status}
                          </span>
                        </div>

                        <div className="space-y-1 relative z-10">
                          <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{stat.label}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-brand-900 font-display">{stat.value}</span>
                            <span className="text-brand-400 font-bold text-sm">{stat.unit}</span>
                          </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                          <div className="h-1.5 w-full bg-brand-900/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 group-hover:opacity-80" 
                              style={{ width: `${stat.progress}%` }} 
                            />
                          </div>
                          <p className="text-xs text-brand-600/80 font-medium leading-relaxed">
                            {stat.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="max-w-7xl mx-auto space-y-10">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-brand-900 font-display">Track Your Orders</h1>
                  <p className="text-brand-500">Real-time updates from your pharmacy.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {orders.map((order, idx) => {
                    const statusInfo = getStatusInfo(order.status);
                    return (
                      <div key={idx} className="bg-white border border-brand-900/5 rounded-3xl p-8 hover:shadow-xl transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                              <Package className="w-8 h-8" />
                            </div>
                            <div>
                               <div className="flex items-center gap-3 mb-1">
                                 <h3 className="text-xl font-bold text-brand-900">{order.orderId}</h3>
                                 <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${
                                   statusInfo.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 
                                   statusInfo.type === 'warning' ? 'bg-amber-100 text-amber-700' : 
                                   'bg-slate-100 text-slate-600'
                                 }`}>
                                   {statusInfo.label}
                                 </span>
                               </div>
                               <p className="text-brand-500 font-medium">
                                 {order.items?.map((i: any) => i.medicineName).join(', ')}
                               </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-10">
                             <div className="text-right hidden sm:block">
                               <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">ESTIMATED ARRIVAL</p>
                               <p className="text-brand-900 font-bold">25 - 30 Mins</p>
                             </div>
                             <button className="px-8 py-4 bg-[#004346] text-white rounded-xl font-bold hover:bg-[#003335] transition-all shadow-lg active:scale-95">
                               Track on Map
                             </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-10 relative">
                           <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
                           <div 
                              className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-1000" 
                              style={{ width: 
                                order.status === 'prescription_sent' ? '20%' : 
                                order.status === 'received_by_pharmacy' ? '40%' : 
                                order.status === 'packing' ? '60%' : 
                                order.status === 'ready_for_pickup' ? '85%' : 
                                '100%' 
                              }}
                            />
                           
                           <div className="relative flex justify-between">
                              {['RECEIVED', 'CONFIRMED', 'PACKING', 'READY'].map((step, i) => (
                                <div key={i} className="flex flex-col items-center gap-3">
                                  <div className={`w-4 h-4 rounded-full border-4 border-white ring-2 z-10 ${
                                    (i === 0 && order.status !== 'prescription_sent') || 
                                    (i === 1 && ['received_by_pharmacy', 'packing', 'ready_for_pickup', 'completed'].includes(order.status)) ||
                                    (i === 2 && ['packing', 'ready_for_pickup', 'completed'].includes(order.status)) ||
                                    (i === 3 && ['ready_for_pickup', 'completed'].includes(order.status))
                                    ? 'bg-emerald-500 ring-emerald-500/20' : 'bg-slate-200 ring-slate-100'
                                  }`} />
                                  <span className="text-[9px] font-black text-brand-400 uppercase tracking-widest">{step}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>
                    );
                  })}
                  {orders.length === 0 && !loading && (
                    <div className="p-20 text-center bg-white border border-brand-900/5 rounded-[2rem] space-y-4">
                      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                        <Package className="w-10 h-10" />
                      </div>
                      <h2 className="text-2xl font-bold text-brand-900">No active orders</h2>
                      <p className="text-brand-500">Start by visiting your doctor or sending a prescription to a pharmacy.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </SidebarProvider>
  );
}
