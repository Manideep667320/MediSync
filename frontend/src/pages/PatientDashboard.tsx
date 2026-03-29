import { useState } from 'react';
import { FileText, Clock, Package, User, Settings, Download, Eye, MapPin, Phone, Map as MapIcon, FileCheck, LogOut } from 'lucide-react';
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
    { id: 'prescriptions', label: 'My Prescriptions', icon: FileText },
    { id: 'orders', label: 'Track Orders', icon: Package },
    { id: 'history', label: 'Health Records', icon: Clock },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const prescriptions = [
    {
      id: 'RX001',
      date: '2026-02-14',
      doctor: 'Dr. Sarah Johnson',
      diagnosis: 'Upper Respiratory Tract Infection',
      status: 'Active',
      medicines: [
        { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days', instructions: 'Take after meals with water' },
        { name: 'Paracetamol', dosage: '650mg', frequency: 'As needed for fever', duration: '5 days', instructions: 'Maximum 4 times per day' },
      ],
      pharmacy: 'HealthPlus Pharmacy',
      orderStatus: 'packing',
    },
    {
      id: 'RX002',
      date: '2026-02-15',
      doctor: 'Dr. Michael Chen',
      diagnosis: 'Type 2 Diabetes Management',
      status: 'Active',
      medicines: [
        { name: 'Metformin', dosage: '850mg', frequency: 'Twice daily', duration: '30 days', instructions: 'Take with meals' },
        { name: 'Glimepiride', dosage: '2mg', frequency: 'Once daily before breakfast', duration: '30 days', instructions: 'Monitor for hypoglycemia' },
      ],
      pharmacy: 'CareWell Medical Store',
      orderStatus: 'checking',
    },
  ];

  const orderStatuses = [
    { status: 'prescription_sent', label: 'Prescription Sent', icon: FileCheck },
    { status: 'received_by_pharmacy', label: 'Received by Pharmacy', icon: Package },
    { status: 'checking', label: 'Checking Stock', icon: Clock },
    { status: 'packing', label: 'Packing', icon: Package },
    { status: 'ready', label: 'Ready for Pickup', icon: Check },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50 flex w-full flex-col md:flex-row">
        <Sidebar collapsible="icon" className="glass-sidebar border-r-0">
          <SidebarHeader className="p-6 pb-2">
            <div className="flex items-center justify-between group-data-[collapsible=icon]:hidden">
              <h2 className="text-2xl font-bold text-gradient font-display">MediSync</h2>
              <SidebarTrigger />
            </div>
            <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
              <SidebarTrigger />
            </div>
            <p className="text-emerald-400/70 text-sm group-data-[collapsible=icon]:hidden">Patient Portal</p>
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
                          setSelectedPrescription(null);
                        }}
                        isActive={activeTab === item.id}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id
                          ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-brand-900 border border-emerald-500/30'
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
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-brand-900 font-semibold text-sm flex-shrink-0">
                JD
              </div>
              <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
                <div className="font-semibold text-brand-900 text-sm truncate">John Doe</div>
                <div className="text-xs text-brand-500 truncate">Patient ID: PT12345</div>
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
            {activeTab === 'prescriptions' && !selectedPrescription && (
              <div>
                <h1 className="text-3xl font-bold mb-8 text-brand-900 font-display">My Prescriptions</h1>

                <div className="flex gap-3 mb-6">
                  {['All', 'Active', 'Completed', 'Pending'].map((filter) => (
                    <button
                      key={filter}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${filter === 'All'
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-brand-900'
                        : 'bg-brand-900/5 text-brand-700 hover:bg-brand-900/10 border border-brand-900/10'
                        }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="glass-card p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-brand-900 font-display">{rx.id}</h3>
                            <span className="px-3 py-1 bg-brand-500/20 text-brand-700 text-sm font-semibold rounded-full border border-brand-500/30">
                              {rx.status}
                            </span>
                          </div>
                          <p className="text-brand-700">{rx.diagnosis}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-brand-500">Issue Date</div>
                          <div className="font-semibold text-brand-900">{rx.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-brand-700 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-brand-500" />
                          <span>{rx.doctor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-brand-500" />
                          <span>{rx.medicines.length} medicines</span>
                        </div>
                        {rx.pharmacy && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-brand-500" />
                            <span>{rx.pharmacy}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedPrescription(rx.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-brand-900 rounded-xl font-semibold hover:shadow-md transition-all duration-300"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-brand-900/5 text-brand-800 rounded-xl font-semibold hover:bg-brand-900/10 border border-brand-900/10 transition-colors">
                          <Download className="w-4 h-4" />
                          Download PDF
                        </button>
                        {rx.orderStatus && (
                          <button
                            onClick={() => setActiveTab('orders')}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-500/20 text-brand-700 rounded-xl font-semibold hover:bg-brand-500/30 border border-brand-500/30 transition-colors"
                          >
                            <Package className="w-4 h-4" />
                            Track Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'prescriptions' && selectedPrescription && (
              <div>
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="flex items-center gap-2 text-brand-700 hover:text-emerald-400 mb-6 transition-colors"
                >
                  ← Back to Prescriptions
                </button>

                {prescriptions
                  .filter((rx) => rx.id === selectedPrescription)
                  .map((rx) => (
                    <div key={rx.id} className="glass-card p-8">
                      <div className="flex justify-between items-start mb-6 pb-6 border-b border-brand-900/10">
                        <div>
                          <h2 className="text-2xl font-bold mb-4 text-brand-900 font-display">Prescription {rx.id}</h2>
                          <p className="text-brand-700">Issued by {rx.doctor}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-brand-500 mb-1">Date</div>
                          <div className="font-semibold text-brand-900">{rx.date}</div>
                          <span className="inline-block mt-2 px-3 py-1 bg-brand-500/20 text-brand-700 text-sm font-semibold rounded-full border border-brand-500/30">
                            {rx.status}
                          </span>
                        </div>
                      </div>

                      <div className="mb-6 pb-6 border-b border-brand-900/10">
                        <h3 className="text-lg font-bold mb-2 text-brand-900 font-display">Diagnosis</h3>
                        <p className="text-brand-800">{rx.diagnosis}</p>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-lg font-bold mb-4 text-brand-900 font-display">Medicines</h3>
                        <div className="space-y-4">
                          {rx.medicines.map((med, index) => (
                            <div key={index} className="bg-brand-900/5 p-4 rounded-xl border border-white/5">
                              <div className="font-semibold text-brand-900 mb-2">{med.name}</div>
                              <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div><span className="text-brand-500">Dosage: </span><span className="text-brand-800">{med.dosage}</span></div>
                                <div><span className="text-brand-500">Frequency: </span><span className="text-brand-800">{med.frequency}</span></div>
                                <div><span className="text-brand-500">Duration: </span><span className="text-brand-800">{med.duration}</span></div>
                                <div><span className="text-brand-500">Instructions: </span><span className="text-brand-800">{med.instructions}</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-brand-900 rounded-xl font-semibold hover:shadow-md transition-all duration-300">
                          <Download className="w-5 h-5" />
                          Download Digital Report
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-brand-900/5 text-brand-800 rounded-xl font-semibold hover:bg-brand-900/10 border border-brand-900/10 transition-colors">
                          <MapPin className="w-5 h-5" />
                          Find Pharmacies
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h1 className="text-3xl font-bold mb-8 text-brand-900 font-display">Track My Orders</h1>

                <div className="space-y-6">
                  {prescriptions
                    .filter((rx) => rx.orderStatus)
                    .map((rx) => (
                      <div key={rx.id} className="glass-card p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-xl font-bold mb-1 text-brand-900 font-display">Order for {rx.id}</h3>
                            <p className="text-brand-700">{rx.pharmacy}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-brand-500">Order Date</div>
                            <div className="font-semibold text-brand-900">{rx.date}</div>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-white/10"></div>
                          <div className="space-y-6">
                            {orderStatuses.map((orderStatus, index) => {
                              const isActive = index <= orderStatuses.findIndex((s) => s.status === rx.orderStatus);
                              const isCurrent = orderStatus.status === rx.orderStatus;

                              return (
                                <div key={orderStatus.status} className="relative flex items-start gap-4">
                                  <div
                                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${isActive
                                      ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                                      : 'bg-white/10 border border-brand-900/10'
                                      }`}
                                  >
                                    <orderStatus.icon
                                      className={`w-6 h-6 ${isActive ? 'text-brand-900' : 'text-brand-700'}`}
                                    />
                                  </div>
                                  <div className="flex-1 pt-2">
                                    <div
                                      className={`font-semibold ${isCurrent ? 'text-emerald-400' : isActive ? 'text-brand-900' : 'text-brand-700'
                                        }`}
                                    >
                                      {orderStatus.label}
                                    </div>
                                    {isCurrent && (
                                      <div className="text-sm text-brand-700 mt-1">
                                        Your order is currently being processed
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex gap-3 mt-8 pt-6 border-t border-brand-900/10">
                          <button className="flex items-center gap-2 px-4 py-2 bg-brand-900/5 text-brand-800 rounded-xl font-semibold hover:bg-brand-900/10 border border-brand-900/10 transition-colors">
                            <Phone className="w-4 h-4" />
                            Call Pharmacy
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 bg-brand-900/5 text-brand-800 rounded-xl font-semibold hover:bg-brand-900/10 border border-brand-900/10 transition-colors">
                            <MapIcon className="w-4 h-4" />
                            Get Directions
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 bg-brand-900/5 text-brand-800 rounded-xl font-semibold hover:bg-brand-900/10 border border-brand-900/10 transition-colors">
                            <FileText className="w-4 h-4" />
                            View Bill
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}
