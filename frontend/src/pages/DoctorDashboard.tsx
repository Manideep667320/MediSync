import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  History,
  BarChart,
  Settings,
  LogOut,
  Clock,
  AlertCircle
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
import DoctorOverviewTab from '../components/doctor-dashboard/DoctorOverviewTab';
import DoctorCreateRxTab from '../components/doctor-dashboard/DoctorCreateRxTab';
import DoctorHistoryTab from '../components/doctor-dashboard/DoctorHistoryTab';

export default function DoctorDashboard() {
  const { navigate } = useRouter();
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCreating, setIsCreating] = useState(false);

  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [selectedSessionPatient, setSelectedSessionPatient] = useState<{ id: string, name: string, age: string, consultationId: string } | null>(null);

  const doctorFirstName = profile?.firstName || '';
  const doctorLastName = profile?.lastName || '';
  const doctorDisplayName = doctorFirstName
    ? `Dr. ${doctorFirstName} ${doctorLastName}`.trim()
    : 'Doctor';
  const doctorSpecialty = profile?.specialty || '';
  const doctorInitials = doctorFirstName
    ? `${doctorFirstName.charAt(0)}${doctorLastName?.charAt(0) || ''}`.toUpperCase()
    : 'DR';

  const fetchDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${backendUrl}/doctor/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Error fetching doctor dashboard:', error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchPharmacies = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${backendUrl}/doctor/pharmacies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setPharmacies(result.data);
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    }
  };

  const fetchPrescriptions = async () => {
    setLoadingPrescriptions(true);
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${backendUrl}/doctor/prescriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setPrescriptions(result.data.prescriptions || []);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const fetchConsultations = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${backendUrl}/doctor/consultations?status=scheduled`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setConsultations(result.data);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  useEffect(() => {
    fetchPharmacies();
    fetchDashboard();
    fetchConsultations();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchPrescriptions();
    }
    if (activeTab === 'dashboard' && !isCreating) {
      fetchDashboard();
      fetchConsultations();
    }
  }, [activeTab]);

  const startSession = async (consultation: any) => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Update status to in-progress
      await fetch(`${backendUrl}/doctor/consultations/${consultation._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'in-progress' })
      });

      // Calculate age
      let ageStr = '';
      if (consultation.patientId?.dateOfBirth) {
        const dob = new Date(consultation.patientId.dateOfBirth);
        const diffMs = Date.now() - dob.getTime();
        const ageDt = new Date(diffMs); 
        ageStr = String(Math.abs(ageDt.getUTCFullYear() - 1970));
      }

      setSelectedSessionPatient({
        id: consultation.patientId?._id,
        name: `${consultation.patientId?.firstName} ${consultation.patientId?.lastName}`.trim(),
        age: ageStr,
        consultationId: consultation._id
      });

      setIsCreating(true);
      setActiveTab('new');
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new', label: 'New Prescription', icon: PlusCircle },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'history', label: 'My Prescriptions', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50 flex w-full flex-col md:flex-row">
        {/* Sidebar */}
        <Sidebar collapsible="icon" className="glass-sidebar border-r-0">
          <SidebarHeader>
            <div className="flex items-center justify-between group-data-[collapsible=icon]:hidden">
              <h2 className="text-2xl font-bold text-gradient font-display">MediSync</h2>
              <SidebarTrigger />
            </div>
            <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
              <SidebarTrigger />
            </div>
            <p className="text-brand-700/70 text-sm group-data-[collapsible=icon]:hidden">Doctor Portal</p>
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
                          if (item.id === 'new') {
                            setIsCreating(true);
                          } else {
                            setIsCreating(false);
                          }
                        }}
                        isActive={activeTab === item.id}
                        className={activeTab === item.id
                          ? 'bg-gradient-to-r from-brand-500/20 to-purple-500/20 text-brand-900 border border-brand-500/30'
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
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-purple-600 rounded-full flex items-center justify-center text-brand-900 font-semibold text-sm flex-shrink-0">
                {doctorInitials}
              </div>
              <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
                <div className="font-semibold text-brand-900 text-sm truncate">{doctorDisplayName}</div>
                {doctorSpecialty && (
                  <div className="text-xs text-brand-500 truncate">{doctorSpecialty}</div>
                )}
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
              <DoctorOverviewTab
                setActiveTab={setActiveTab}
                setIsCreating={setIsCreating}
                doctorDisplayName={doctorDisplayName}
                dashboardData={dashboardData}
                loadingDashboard={loadingDashboard}
                consultations={consultations}
                startSession={startSession}
                fetchConsultations={fetchConsultations}
              />
            )}

            {(activeTab === 'new' || isCreating) && (
              <DoctorCreateRxTab
                onSuccess={() => {
                  setIsCreating(false);
                  setActiveTab('dashboard');
                  setSelectedSessionPatient(null);
                }}
                pharmacies={pharmacies}
                initialPatient={selectedSessionPatient}
              />
            )}

            {activeTab === 'history' && (
              <DoctorHistoryTab
                prescriptions={prescriptions}
                loadingPrescriptions={loadingPrescriptions}
                setActiveTab={setActiveTab}
                fetchPrescriptions={fetchPrescriptions}
              />
            )}

            {/* Placeholder views for Patients, Analytics, and Settings */}
            {['patients', 'analytics', 'settings'].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center text-brand-900 mb-4">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-display">Under Construction</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  The {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} module is currently in development and will be available soon.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setIsCreating(false);
                  }}
                  className="mt-6 px-6 py-2.5 bg-[#508991] text-white rounded-xl font-semibold hover:bg-[#457a81] transition-colors text-sm"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}