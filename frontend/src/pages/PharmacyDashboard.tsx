import { useState, useEffect } from 'react';
import { 
  Package, BarChart, Settings, Eye, Check, X, Phone, LogOut, Plus, 
  RefreshCw, AlertCircle, CheckSquare, Truck, ClipboardList, RotateCcw, 
  FilePlus, AlertTriangle, TrendingUp, Clock, User, Search, 
  ArrowUpRight, CheckCircle, Calendar, ChevronRight, Menu, Bell
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

interface PrescriptionOrder {
  id: string;
  patientName: string;
  dob: string;
  medication: string;
  quantity: string;
  prescriber: string;
  status: 'PROCESSING' | 'READY' | 'INCOMING' | 'CANCELED';
  actionIcon: any;
}

interface VerificationLog {
  id: string;
  pharmacist: string;
  time: string;
}

export default function PharmacyDashboard() {
  const { navigate } = useRouter();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'queue', label: 'Dashboard', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: ClipboardList },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    incoming: 0,
    processing: 0,
    ready: 0
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${backendUrl}/pharmacy/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data.orders);
        
        // Update stats
        const incoming = result.data.orders.filter((o: any) => o.status === 'prescription_sent').length;
        const processing = result.data.orders.filter((o: any) => ['received_by_pharmacy', 'packing'].includes(o.status)).length;
        const ready = result.data.orders.filter((o: any) => o.status === 'ready_for_pickup').length;
        setStats({ incoming, processing, ready });
      }
    } catch (error) {
      console.error('Error fetching pharmacy data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus = '';
    switch (currentStatus) {
      case 'prescription_sent': nextStatus = 'received_by_pharmacy'; break;
      case 'received_by_pharmacy': nextStatus = 'packing'; break;
      case 'packing': nextStatus = 'ready_for_pickup'; break;
      case 'ready_for_pickup': nextStatus = 'completed'; break;
      default: return;
    }

    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${backendUrl}/pharmacy/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });
      
      const result = await response.json();
      if (result.success) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'prescription_sent': return { label: 'INCOMING', color: 'bg-[#004346] text-white', icon: ClipboardList };
      case 'received_by_pharmacy': return { label: 'RECEIVED', color: 'bg-blue-100 text-blue-700', icon: CheckSquare };
      case 'packing': return { label: 'PACKING', color: 'bg-amber-100 text-amber-700', icon: Package };
      case 'ready_for_pickup': return { label: 'READY', color: 'bg-emerald-100 text-emerald-700', icon: Truck };
      case 'completed': return { label: 'COMPLETED', color: 'bg-slate-100 text-slate-700', icon: CheckCircle };
      default: return { label: (status || 'unknown').toUpperCase(), color: 'bg-slate-100 text-slate-700', icon: Package };
    }
  };

  const verificationLogs: VerificationLog[] = [
    { id: '#RX-88209', pharmacist: 'Ph. Aris Thorne', time: '2 mins ago' },
    { id: '#RX-88208', pharmacist: 'Ph. Aris Thorne', time: '12 mins ago' },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#F8FAFC] flex w-full flex-col md:flex-row font-sans selection:bg-orange-100 selection:text-orange-900">
        <Sidebar collapsible="icon" className="glass-sidebar border-r-0">
          <SidebarHeader>
            <div className="flex items-center justify-between group-data-[collapsible=icon]:hidden p-6 pb-2">
              <h2 className="text-2xl font-bold text-gradient font-display">MediSync</h2>
              <SidebarTrigger />
            </div>
            <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center p-2">
              <SidebarTrigger />
            </div>
            <p className="px-6 text-orange-600/70 text-xs font-semibold uppercase tracking-wider group-data-[collapsible=icon]:hidden mb-2">Pharmacy Portal</p>
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
                          setSelectedOrder(null);
                        }}
                        isActive={activeTab === item.id}
                        className={activeTab === item.id
                          ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-brand-900 border border-orange-500/30 font-medium'
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
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-brand-900 font-semibold text-sm flex-shrink-0 shadow-sm shadow-orange-500/20">
                HP
              </div>
              <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
                <div className="font-semibold text-brand-900 text-sm truncate">HealthPlus Pharmacy</div>
                <div className="text-xs text-brand-500 truncate">Pharmacy ID: PH98765</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-brand-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all text-sm group-data-[collapsible=icon]:px-0"
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
                <SidebarTrigger className="lg:hidden" />
                <h2 className="text-xl font-bold text-gradient font-display">MediSync</h2>
             </div>
             <div className="flex items-center gap-4">
               <Bell className="w-5 h-5 text-brand-500" />
               <div className="w-8 h-8 rounded-full bg-orange-500" />
             </div>
          </header>

          <div className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto custom-scrollbar">
            {activeTab === 'queue' && (
              <div className="max-w-7xl mx-auto space-y-10">
                {/* Fulfillment Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h1 className="text-4xl font-bold text-brand-900 font-display">Pharmacy Fulfillment</h1>
                    <p className="text-brand-500 text-lg">
                      Real-time prescription orchestration and clinical verification.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2.5 px-6 py-4 bg-emerald-50 text-emerald-800 rounded-xl font-bold hover:bg-emerald-100 transition-all border border-emerald-200">
                      <CheckSquare className="w-5 h-5" />
                      Quick Verify
                    </button>
                    <button className="flex items-center gap-2.5 px-6 py-4 bg-[#004346] text-white rounded-xl font-bold hover:bg-[#003335] transition-all shadow-lg shadow-emerald-900/10">
                      <Plus className="w-5 h-5" />
                      New Intake
                    </button>
                  </div>
                </div>

                {/* Dashboard Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Active Queue Status */}
                  <div className="p-8 bg-white border border-brand-900/5 rounded-3xl space-y-8 hover:shadow-xl hover:shadow-orange-900/5 transition-all duration-500 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">ACTIVE QUEUE STATUS</p>
                      <BarChart className="w-4 h-4 text-brand-300 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-3xl font-bold text-brand-900 font-display">{stats.incoming}</p>
                        <p className="text-[10px] font-bold text-brand-400 uppercase tracking-tighter">INCOMING</p>
                      </div>
                      <div className="p-4 border-r border-brand-900/5 h-10" />
                      <div className="space-y-1">
                        <p className="text-3xl font-bold text-orange-500 font-display">{stats.processing}</p>
                        <p className="text-[10px] font-bold text-brand-400 uppercase tracking-tighter">PROCESSING</p>
                      </div>
                      <div className="p-4 border-r border-brand-900/5 h-10" />
                      <div className="space-y-1">
                        <p className="text-3xl font-bold text-emerald-500 font-display">{stats.ready}</p>
                        <p className="text-[10px] font-bold text-brand-400 uppercase tracking-tighter">READY</p>
                      </div>
                    </div>
                  </div>

                  {/* Inventory Alert */}
                  <div className="p-8 bg-white border-l-4 border-amber-500 border-y border-r border-brand-900/5 rounded-3xl space-y-4 hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-500">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">INVENTORY ALERT</p>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-brand-900">Amoxicillin 500mg</h3>
                      <p className="text-brand-500 text-sm leading-relaxed">Stock level below 15%. Trigger reorder?</p>
                    </div>
                    <button className="text-amber-600 font-bold text-sm hover:underline flex items-center gap-1 group">
                      Review Inventory
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Pickup Peak */}
                  <div className="p-8 bg-emerald-50/50 border border-emerald-100 rounded-3xl space-y-4 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-500 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">PICKUP PEAK</p>
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-emerald-900">14:00 - 15:30</p>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className={`w-6 h-6 rounded-full border-2 border-white bg-slate-200`} />
                          ))}
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-emerald-200 flex items-center justify-center text-[8px] font-bold text-emerald-800">+12</div>
                        </div>
                        <p className="text-emerald-700 text-xs font-semibold">18 Scheduled Pickups</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Queue Table */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-brand-900 font-display">Active Fulfillment Queue</h2>
                  </div>

                  <div className="bg-white border border-brand-900/5 rounded-[2rem] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-brand-900/5">
                            <th className="px-8 py-6 text-[10px] font-black text-brand-400 uppercase tracking-widest">ORDER ID</th>
                            <th className="px-8 py-6 text-[10px] font-black text-brand-400 uppercase tracking-widest">PATIENT NAME</th>
                            <th className="px-8 py-6 text-[10px] font-black text-brand-400 uppercase tracking-widest">MEDICATION</th>
                            <th className="px-8 py-6 text-[10px] font-black text-brand-400 uppercase tracking-widest">STATUS</th>
                            <th className="px-8 py-6 text-[10px] font-black text-brand-400 uppercase tracking-widest text-right">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-900/5">
                          {orders.map((order, idx) => {
                            const statusInfo = getStatusDisplay(order.status);
                            const StatusIcon = statusInfo.icon;
                            
                            return (
                              <tr key={idx} className="group hover:bg-slate-50/80 transition-colors">
                                <td className="px-8 py-7">
                                  <span className="font-bold text-brand-900 font-display">{order.orderId}</span>
                                </td>
                                <td className="px-8 py-7">
                                  <div>
                                    <p className="font-bold text-brand-900">
                                      {order.patientId ? `${order.patientId.firstName} ${order.patientId.lastName}` : order.prescriptionId?.patientName || 'Unknown Patient'}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-8 py-7">
                                  <div>
                                    <p className="font-bold text-brand-900">{order.items?.[0]?.medicineName || 'No Item'}</p>
                                    {order.items?.length > 1 && <p className="text-[10px] font-bold text-brand-400">+ {order.items.length - 1} more items</p>}
                                  </div>
                                </td>
                                <td className="px-8 py-7">
                                  <span className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-widest ${statusInfo.color}`}>
                                    {statusInfo.label}
                                  </span>
                                </td>
                                <td className="px-8 py-7">
                                  <div className="flex items-center justify-end gap-3">
                                    <Eye className="w-5 h-5 text-brand-300 hover:text-brand-900 cursor-pointer transition-colors" />
                                    <StatusIcon 
                                      onClick={() => handleUpdateStatus(order._id, order.status)}
                                      className={`w-5 h-5 cursor-pointer ${
                                        order.status === 'completed' ? 'text-brand-300' : 'text-emerald-600'
                                      }`} 
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {orders.length === 0 && !loading && (
                        <div className="p-12 text-center text-brand-400 font-bold">No active orders in queue</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-10">
                  {/* Calendar Placeholder */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-brand-900 font-display">Patient Pickup Calendar</h2>
                    <div className="h-64 border-2 border-dashed border-brand-900/10 rounded-[2rem] flex flex-col items-center justify-center space-y-4 bg-white/30 group hover:border-emerald-500/30 transition-all duration-500">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-brand-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                        <Calendar className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-brand-900">Calendar View Not Configured</p>
                        <button className="text-emerald-600 font-bold text-xs uppercase tracking-widest hover:underline mt-1">ACTIVATE SCHEDULE</button>
                      </div>
                    </div>
                  </div>

                  {/* Verification Logs */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-brand-900 font-display">Recent Verification Logs</h2>
                    <div className="space-y-3">
                      {verificationLogs.map((log, idx) => (
                        <div key={idx} className="p-5 bg-white border border-brand-900/5 rounded-2xl flex items-center justify-between group hover:shadow-lg hover:shadow-emerald-900/5 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-brand-900 text-sm">{log.id} Verified</p>
                              </div>
                              <p className="text-xs text-brand-400 font-medium">By {log.pharmacist} • {log.time}</p>
                            </div>
                          </div>
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SidebarInset>

        {/* Floating Action Button */}
        <button className="fixed bottom-10 right-10 w-16 h-16 bg-[#004346] text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group z-30">
          <ClipboardList className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        </button>
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

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}