import { useState, useRef, useEffect } from 'react';
import {
  Upload, Camera, ArrowLeft, Download, Edit, MapPin, Check, Package, Clock, Star,
  Phone, Navigation, AlertCircle, LayoutDashboard, Pill, GraduationCap, History,
  Settings, HelpCircle, LogOut, Bell, Search, Plus, ChevronDown, Sun, Moon, CloudSun, Eye, FileText, ChevronRight,
  Map, CheckCircle, Car, Truck, Syringe, Filter, List, FlaskConical, Store, FileSpreadsheet, User
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
import localService from '../services/localService';
import { useAuth } from '../context/AuthContext';

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

interface PharmacyResult {
  id: string;
  name: string;
  address: { street: string; city: string; state: string; zipCode: string; country: string };
  distance: number;
  rating: number;
  phone: string;
  features: string[];
  deliveryAvailable: boolean;
  availabilityStatus: 'all_available' | 'partial_available';
  totalPrice: number;
  estimatedTime: number;
}

interface PreferredPharmacy {
  name: string;
  address: string | { street: string; city: string; state: string; zipCode: string; country: string };
  hours: string;
}

export default function LocalDashboard() {
  const { navigate } = useRouter();
  const { logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentStep, setCurrentStep] = useState<'upload' | 'extracted' | 'pharmacies'>('upload');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [prescriptionHistory, setPrescriptionHistory] = useState<DigitalPrescription[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prescription, setPrescription] = useState<DigitalPrescription | null>(null);
  const [pharmacies, setPharmacies] = useState<PharmacyResult[]>([]);
  const [showPharmacies, setShowPharmacies] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(5);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedPharma, setSelectedPharma] = useState<PharmacyResult | null>(null);
  const [zipSearch, setZipSearch] = useState('');

  const [activeMedications] = useState([
    { 
      name: 'Amoxicillin', 
      type: '500mg Capsule', 
      category: 'ANTIBIOTIC',
      statusBadge: 'Ready for Refill',
      times: ['Morning', 'Noon', 'Night'],
      progressLabel: 'DAY 4 OF 7',
      complianceLabel: '57% COMPLETE',
      progress: 57 
    },
    { 
      name: 'Lisinopril', 
      type: '10mg Tablet', 
      category: 'HYPERTENSION',
      statusBadge: 'Low Stock',
      statusColor: 'text-amber-600 bg-amber-500/10',
      times: ['Morning'],
      progressLabel: 'ONGOING TREATMENT',
      complianceLabel: '9 REFILLS LEFT',
      progress: 30 
    }
  ]);

  const [historicMedications] = useState([
    { name: 'Atorvastatin', strength: '20mg', doctor: 'Dr. Sarah Chen', dateRange: 'Jan 2023 - Dec 2023' },
    { name: 'Ibuprofen', strength: '800mg', doctor: 'Dr. Marcus Thorne', dateRange: 'Nov 2023 - Nov 2023' },
    { name: 'Metformin', strength: '500mg', doctor: 'Dr. Elena Rodriguez', dateRange: 'Feb 2022 - Aug 2022' }
  ]);

  const [orderHistory] = useState([
    { id: 'MS-44129-LV', date: 'OCT 12, 2024', meds: 'Metformin 500mg, Lisinopril 10mg', pharmacy: 'Green Valley Health', price: 24.50, icon: Pill },
    { id: 'MS-38102-AQ', date: 'SEP 29, 2024', meds: 'Amoxicillin 250mg (Course of 14)', pharmacy: 'Walgreens Community', price: 12.00, icon: Syringe }
  ]);

  const [preferredPharmacy] = useState<PreferredPharmacy>({
    name: 'CVS Pharmacy Downtown',
    address: '122 S Main St, Springfield',
    hours: '8:00 AM — 10:00 PM'
  });

  const [uploadStatus] = useState({
    filename: 'RX-SCAN-1024.pdf',
    progress: 88
  });

  const [liveOrder] = useState({
    orderId: 'MS-99210-XC',
    placedDate: 'October 24, 2024',
    meds: 'Amoxicillin 500mg, Paracetamol 650mg',
    pharmacy: 'CVS Pharmacy Downtown',
    eta: 'Today, 4:30 PM — 5:15 PM',
    status: 'IN PROGRESS',
    steps: [
      { label: 'Prescription Uploaded', completed: true, time: '10:30 AM' },
      { label: 'Verified by Pharmacy', completed: true, time: '11:15 AM' },
      { label: 'Preparing Meds', active: true, icon: FlaskConical, time: '12:45 PM' },
      { label: 'Ready for Pickup', icon: Store, time: '--:--' }
    ]
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    setTimeout(() => {
      const mockPrescription: DigitalPrescription = {
        patientName: 'John Doe',
        age: '34',
        gender: 'Male',
        date: '2026-02-14',
        diagnosis: 'Upper Respiratory Tract Infection',
        medicines: [
          { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days', instructions: 'Take after meals with water' },
          { name: 'Paracetamol', dosage: '650mg', frequency: 'As needed for fever', duration: '5 days', instructions: 'Maximum 4 times per day' },
        ],
        doctorNotes: 'Rest and stay hydrated. Avoid cold drinks.',
      };
      setPrescription(mockPrescription);
      setPrescriptionHistory(prev => [mockPrescription, ...prev]);
      setIsProcessing(false);
      setCurrentStep('extracted'); // Move to Page 2
    }, 2000);
  };

  const getMockPharmacies = (radius: number): PharmacyResult[] => [
    {
      id: 'mock-1',
      name: 'Central Pharmacy',
      address: { street: '1200 Madison St', city: 'Seattle', state: 'WA', zipCode: '98104', country: 'US' },
      distance: 0.8,
      rating: 4.8,
      phone: '(206) 555-0129',
      features: ['Home Delivery', 'Drive-thru', 'Immunizations'],
      deliveryAvailable: true,
      availabilityStatus: 'all_available',
      totalPrice: 12.45,
      estimatedTime: 15,
    },
    {
      id: 'mock-2',
      name: 'Green Cross Medical',
      address: { street: '2450 4th Ave S', city: 'Seattle', state: 'WA', zipCode: '98134', country: 'US' },
      distance: 1.4,
      rating: 4.2,
      phone: '(206) 555-0240',
      features: ['24/7 Open', 'Insurance Accepted'],
      deliveryAvailable: false,
      availabilityStatus: 'partial_available',
      totalPrice: 18.90,
      estimatedTime: 25,
    },
    {
      id: 'mock-3',
      name: 'Medi-Quick Urgent Care',
      address: { street: '801 Pine St', city: 'Seattle', state: 'WA', zipCode: '98101', country: 'US' },
      distance: 2.1,
      rating: 4.5,
      phone: '(206) 555-0310',
      features: ['Urgent Care', 'Pharmacy Services'],
      deliveryAvailable: true,
      availabilityStatus: 'all_available',
      totalPrice: 15.00,
      estimatedTime: 20,
    },
  ];

  const fetchPharmacies = async (radius: number) => {
    setIsSearching(true);
    setSearchError(null);
    try {
      let latitude = 40.7128;
      let longitude = -74.0060;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          );
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        } catch {
          // use default coords
        }
      }
      const medicines = prescription?.medicines.map(m => m.name) ?? [];
      const result = await localService.findNearbyPharmacies({ latitude, longitude, radius, medicines });
      const apiPharmacies = result?.data ?? [];
      const finalPharmaList = apiPharmacies.length > 0 ? apiPharmacies : getMockPharmacies(radius);
      setPharmacies(finalPharmaList);
      if (finalPharmaList.length > 0) setSelectedPharma(finalPharmaList[0]);
    } catch {
      const mockList = getMockPharmacies(radius);
      setPharmacies(mockList);
      if (mockList.length > 0) setSelectedPharma(mockList[0]);
    } finally {
      setIsSearching(false);
    }
  };

  const searchPharmacies = () => {
    setActiveTab('pharmacies');
    setCurrentStep('pharmacies');
    fetchPharmacies(selectedRadius);
  };

  const handleRadiusChange = (radius: number) => {
    setSelectedRadius(radius);
    fetchPharmacies(radius);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50 flex w-full flex-col md:flex-row">
        {/* Sidebar */}
        <Sidebar collapsible="icon" className="glass-sidebar border-r-0">
          <SidebarHeader>
            <div className="flex items-center justify-between group-data-[collapsible=icon]:hidden p-6 pb-2">
              <h2 className="text-2xl font-bold text-brand-900 font-display">MediSync</h2>
              <SidebarTrigger />
            </div>
            <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center p-2">
              <SidebarTrigger />
            </div>
            <p className="px-6 text-brand-500 text-xs font-semibold uppercase tracking-wider group-data-[collapsible=icon]:hidden mb-2">Patient Portal</p>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {[
                    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                    { id: 'prescriptions', label: 'My Prescriptions', icon: GraduationCap },
                    { id: 'medications', label: 'Medications', icon: Pill },
                    { id: 'pharmacies', label: 'Pharmacies', icon: MapPin },
                    { id: 'orders', label: 'Orders', icon: History },
                  ].map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        isActive={activeTab === item.id}
                        className={activeTab === item.id
                          ? 'bg-brand-500/10 text-brand-900 border-l-4 border-brand-500'
                          : 'text-brand-700 hover:text-brand-900'
                        }
                        tooltip={item.label}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-semibold">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-brand-900/10">
            <div className="flex items-center justify-center gap-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-4">
              <SidebarMenuButton 
                tooltip="Settings" 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-brand-700 hover:bg-brand-500/10 transition-all active:scale-95"
              >
                <Settings className="w-5 h-5" />
              </SidebarMenuButton>
              
              <SidebarMenuButton 
                tooltip="Support" 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-brand-700 hover:bg-brand-500/10 transition-all active:scale-95"
              >
                <HelpCircle className="w-5 h-5" />
              </SidebarMenuButton>
              
              <SidebarMenuButton 
                onClick={handleLogout}
                tooltip="Sign Out" 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
              >
                <LogOut className="w-5 h-5" />
              </SidebarMenuButton>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="bg-transparent flex-1 flex flex-col w-full h-full">
          {/* Top Header */}
          <header className="h-16 border-b border-brand-900/10 px-8 flex items-center justify-end bg-white/50 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <button className="p-2 text-brand-700 hover:bg-brand-500/10 rounded-full transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <button className="p-2 text-brand-700 hover:bg-brand-500/10 rounded-full transition-colors group relative">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-900 font-bold border border-brand-500/30">
                  <User className="w-4 h-4" />
                </div>
              </button>
              <SidebarTrigger className="md:hidden" />
            </div>
          </header>

          <main className="flex-1 p-8 space-y-12 max-w-[1600px] mx-auto w-full">
            {isProcessing && (
              <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Pill className="w-8 h-8 text-brand-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-brand-900 font-display">AI Verification in Progress</h3>
                  <p className="text-brand-500 font-medium animate-pulse">Scanning prescription for clinical accuracy...</p>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {currentStep === 'upload' ? (
                  <>
                    {/* Hero Section */}
                    <section className="relative rounded-3xl overflow-hidden min-h-[400px] flex items-center px-12" style={{ background: 'linear-gradient(135deg, #004346 0%, #172A3A 100%)' }}>
                      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                      <div className="relative z-10 max-w-2xl space-y-6">
                        <h1 className="text-6xl font-black text-white leading-tight font-display">
                          Welcome back,<br />Alex
                        </h1>
                        <p className="text-brand-300 text-xl max-w-lg font-medium leading-relaxed">
                          Your clinical dashboard is updated with your latest prescription analytics and pharmacy availability.
                        </p>
                        <div className="flex gap-4 pt-4">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-3 active:scale-95"
                          >
                            <Upload className="w-5 h-5" />
                            Upload Prescription
                          </button>
                          <button className="bg-brand-900/50 backdrop-blur-md border border-white/10 hover:bg-brand-900/80 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-3 active:scale-95">
                            <Camera className="w-5 h-5" />
                            Scan Prescription
                          </button>
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
                      </div>
                      <div className="absolute right-12 bottom-0 top-0 w-1/3 hidden lg:block">
                        <div className="h-full w-full rounded-3xl overflow-hidden mt-12 bg-slate-100 shadow-2xl origin-bottom rotate-[-5deg]">
                          <img src="https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=800" alt="Medical Professional" className="h-full w-full object-cover" />
                        </div>
                      </div>
                    </section>

                    {/* Live Order Status & New Prescription */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-brand-900/5 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-xl font-bold text-brand-900 font-display">Live Order Status</h2>
                            <p className="text-sm text-brand-500">Order #{liveOrder.orderId} • Meds: {liveOrder.meds}</p>
                          </div>
                          <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black tracking-widest">
                            {liveOrder.status}
                          </span>
                        </div>

                        <div className="relative pt-12">
                          <div className="absolute top-[48px] left-0 right-0 h-0.5 bg-slate-100" />
                          <div className="flex justify-between items-start relative z-10">
                            {liveOrder.steps.map((step, i) => (
                              <div key={i} className="flex flex-col items-center text-center space-y-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${step.completed ? 'bg-emerald-500 text-white' :
                                  step.active ? 'bg-white border-4 border-emerald-500 text-emerald-500' : 'bg-slate-100 text-slate-300'
                                  }`}>
                                  {step.completed ? <Check className="w-4 h-4 font-bold" /> : (i + 1)}
                                </div>
                                <div>
                                  <p className={`text-xs font-bold ${step.active ? 'text-emerald-500' : 'text-brand-900'}`}>{step.label}</p>
                                  <p className="text-[10px] text-brand-500 mt-1">{step.time}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white rounded-3xl p-8 border-2 border-dashed border-slate-200 hover:border-brand-500/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-4 group"
                      >
                        <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Camera className="w-8 h-8 text-brand-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-brand-900 font-display">New Prescription?</h3>
                          <p className="text-sm text-brand-500">Drag and drop your file here or click to browse</p>
                        </div>
                        <div className="w-full h-px bg-slate-100" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
                    <button
                      onClick={() => setCurrentStep('upload')}
                      className="flex items-center gap-2 text-brand-500 font-bold hover:text-brand-900 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Upload
                    </button>

                    <div className="bg-white rounded-[40px] shadow-2xl shadow-brand-900/10 border border-brand-900/5 overflow-hidden">
                      <div className="bg-brand-900 p-10 text-white flex justify-between items-center">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-black font-display tracking-tight">Digital Prescription</h2>
                          <p className="text-brand-300 font-bold text-sm tracking-widest uppercase">AI Verified Selection</p>
                        </div>
                        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20">
                          <LayoutDashboard className="w-10 h-10 text-white" />
                        </div>
                      </div>

                      <div className="p-10 space-y-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                          <div>
                            <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Patient</p>
                            <p className="text-lg font-bold text-brand-900">{prescription?.patientName}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Age / Gender</p>
                            <p className="text-lg font-bold text-brand-900">{prescription?.age} / {prescription?.gender}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Date</p>
                            <p className="text-lg font-bold text-brand-900">{prescription?.date}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">Diagnosis</p>
                            <p className="text-lg font-bold text-brand-900 truncate" title={prescription?.diagnosis}>{prescription?.diagnosis}</p>
                          </div>
                        </div>

                        <div className="h-px bg-slate-100" />

                        <div className="space-y-6">
                          <h3 className="text-xl font-bold text-brand-900 font-display">Medications</h3>
                          <div className="grid gap-4">
                            {prescription?.medicines.map((med, i) => (
                              <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-500/20 transition-all">
                                <div className="flex items-center gap-6">
                                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                    <Pill className="w-6 h-6 text-brand-500" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-brand-900">{med.name}</h4>
                                    <p className="text-xs text-brand-500 font-medium">{med.dosage} • {med.frequency}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-brand-900">{med.duration}</p>
                                  <p className="text-[10px] text-brand-500 uppercase tracking-tighter">Treatment Period</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-brand-500/5 rounded-3xl p-8 border border-brand-500/10">
                          <h4 className="text-sm font-black text-brand-900 uppercase tracking-widest mb-4">Doctor's Notes</h4>
                          <p className="text-brand-600 leading-relaxed font-medium italic">"{prescription?.doctorNotes}"</p>
                        </div>

                        <button
                          onClick={searchPharmacies}
                          className="w-full py-6 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-2xl text-xl font-black shadow-xl shadow-amber-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                          <MapPin className="w-6 h-6" />
                          Find Available Pharmacies
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pharmacies' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-600 max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div className="space-y-4 max-w-2xl">
                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        setCurrentStep(prescription ? 'extracted' : 'upload');
                      }}
                      className="flex items-center gap-2 text-brand-500 font-bold hover:text-brand-900 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <div>
                      <h2 className="text-4xl font-black text-brand-900 font-display tracking-tight mb-2">Pharmacy Discovery</h2>
                      <p className="text-brand-500 text-lg font-medium leading-relaxed">
                        Compare availability and pricing for your active prescriptions in the Seattle metropolitan area.
                      </p>
                    </div>
                  </div>

                  <div className="flex bg-white p-1.5 rounded-2xl shadow-lg shadow-brand-900/5 border border-brand-900/5 items-center gap-2 min-w-[400px]">
                    <div className="flex-1 flex items-center px-4 gap-3 bg-slate-50 rounded-xl h-12">
                      <Search className="w-4 h-4 text-brand-400" />
                      <input 
                        type="text" 
                        value={zipSearch}
                        onChange={(e) => setZipSearch(e.target.value)}
                        placeholder="Zip code or address..." 
                        className="bg-transparent border-none outline-none text-sm font-bold text-brand-900 placeholder:text-brand-300 w-full"
                      />
                    </div>
                    <button className="h-12 bg-[#004346] text-white px-8 rounded-xl font-bold hover:bg-[#003639] transition-all active:scale-95">
                      Search
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6 pb-4 border-b border-brand-900/5 mt-4">
                   <div className="flex flex-wrap items-center gap-3">
                      <button className="flex items-center gap-2 px-6 py-3 bg-white border border-brand-900/10 rounded-full text-xs font-black text-brand-900 shadow-sm hover:border-brand-500/30 transition-all">
                        <MapPin className="w-3.5 h-3.5" /> Distance
                      </button>
                      <button className="flex items-center gap-2 px-6 py-3 bg-white border border-brand-900/10 rounded-full text-xs font-black text-brand-900 shadow-sm hover:border-brand-500/30 transition-all">
                        <History className="w-3.5 h-3.5" /> Price: Low to High
                      </button>
                      <button className="flex items-center gap-2 px-6 py-3 bg-[#004346] text-white rounded-full text-xs font-black shadow-lg shadow-brand-900/10 hover:bg-[#003639] transition-all">
                        <CheckCircle className="w-3.5 h-3.5" /> In Stock Only
                      </button>
                   </div>
                   <div className="flex p-1 bg-white rounded-xl shadow-sm border border-brand-900/5">
                      <button className="px-5 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-900 rounded-lg bg-slate-50 transition-all">
                        <List className="w-3 h-3" /> List
                      </button>
                      <button className="px-5 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-300 rounded-lg hover:text-brand-900 transition-all">
                        <Map className="w-3 h-3" /> Map
                      </button>
                   </div>
                </div>

                <div className="flex gap-10 min-h-screen">
                  {/* Discovery Pane */}
                  <div className="flex-1 space-y-6 pb-32">
                    {isSearching ? (
                       <div className="space-y-6">
                         {[1, 2, 3].map(i => (
                           <div key={i} className="h-[220px] bg-white rounded-3xl animate-pulse border border-brand-900/5" />
                         ))}
                       </div>
                    ) : (
                      pharmacies.map((pharma, i) => (
                        <div 
                          key={i} 
                          onClick={() => setSelectedPharma(pharma)}
                          className={`bg-white rounded-[32px] p-8 border hover:shadow-2xl hover:shadow-brand-900/10 transition-all duration-500 group cursor-pointer flex flex-col md:flex-row gap-8 items-center ${
                            selectedPharma?.id === pharma.id ? 'border-brand-500 shadow-xl' : 'border-brand-900/5 shadow-sm'
                          }`}
                        >
                          <div className="w-20 h-20 bg-emerald-500/5 rounded-2xl flex items-center justify-center border border-emerald-500/10 shrink-0">
                            <Package className="w-10 h-10 text-emerald-500" />
                          </div>
                          
                          <div className="flex-1 space-y-6 w-full">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                               <div className="space-y-1">
                                  <h3 className="text-2xl font-black text-brand-900 font-display tracking-tight">{pharma.name}</h3>
                                  <p className="text-sm font-medium text-slate-400">
                                    {pharma.address.street}, {pharma.address.city} • <span className="text-brand-900 font-black">{pharma.distance} miles</span>
                                  </p>
                               </div>
                               <div className="flex gap-4 items-center shrink-0">
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    <span className="text-sm font-black text-brand-900">{pharma.rating}</span>
                                  </div>
                                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
                                    pharma.availabilityStatus === 'all_available' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                  }`}>
                                    {pharma.availabilityStatus.replace('_', ' ')}
                                  </div>
                               </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4 border-t border-slate-50">
                               <div className="space-y-1">
                                  <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Estimated Cost</p>
                                  <div className="flex items-baseline gap-2">
                                     <span className="text-3xl font-black text-brand-900">${pharma.totalPrice.toFixed(2)}</span>
                                     <span className="text-xs font-bold text-slate-400">/ 30-day supply</span>
                                  </div>
                               </div>
                               <button className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest">
                                 Select Pharmacy
                               </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Selection Pane (Sticky Sidebar) */}
                  <div className="w-[450px] space-y-8 hidden xl:block">
                     <div className="sticky top-24 space-y-8">
                        {/* Map View */}
                        <div className="h-[400px] w-full bg-slate-900 rounded-[40px] overflow-hidden relative shadow-2xl group border-[6px] border-white ring-1 ring-brand-900/10">
                           <img 
                              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" 
                              alt="Map Background" 
                              className="w-full h-full object-cover opacity-50 contrast-125 grayscale"
                           />
                           <div className="absolute inset-0 bg-brand-900/20" />
                           {pharmacies.map((p, idx) => (
                             <div 
                               key={p.id}
                               className={`absolute transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-all ${
                                 idx === 0 ? 'top-1/3 left-1/2' : idx === 1 ? 'top-2/3 left-1/4' : 'top-1/2 left-3/4'
                               }`}
                             >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-2xl transition-all ${
                                  selectedPharma?.id === p.id ? 'bg-[#004346] scale-125 z-50' : 'bg-[#172A3A] hover:bg-[#004346]'
                                }`}>
                                   <Package className="w-5 h-5 text-white" />
                                </div>
                             </div>
                           ))}
                        </div>

                        {/* Selection Detail */}
                        {selectedPharma && (
                          <div className="bg-white rounded-[40px] p-10 border border-brand-900/5 shadow-2xl space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                             <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-[#004346] rounded-2xl flex items-center justify-center shadow-lg shadow-brand-900/20">
                                   <CheckCircle className="w-8 h-8 text-white" />
                                </div>
                                <div className="space-y-1">
                                   <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Selected Choice</p>
                                   <h4 className="text-3xl font-black text-brand-900 font-display">{selectedPharma.name}</h4>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-6 rounded-3xl space-y-2">
                                   <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest leading-none">Status</p>
                                   <div className="flex items-center gap-2">
                                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                                      <p className="font-black text-brand-900">Open Now</p>
                                   </div>
                                   <p className="text-xs font-bold text-brand-500">Closes at 9:00 PM</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-3xl space-y-2">
                                   <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest leading-none">Phone</p>
                                   <p className="font-black text-brand-900">{selectedPharma.phone}</p>
                                   <button className="text-brand-500 text-[10px] font-black uppercase tracking-widest hover:text-brand-900 transition-colors border-b-2 border-brand-500/20 pb-0.5 mt-1">
                                      Call Now
                                   </button>
                                </div>
                             </div>

                             <div className="space-y-5">
                                <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest border-b border-slate-100 pb-2">Available Services</p>
                                <div className="flex flex-wrap gap-3">
                                   <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black">
                                      <Truck className="w-4 h-4" /> Home Delivery
                                   </div>
                                   <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black">
                                      <Car className="w-4 h-4" /> Drive-thru
                                   </div>
                                   <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black">
                                      <Syringe className="w-4 h-4" /> Immunizations
                                   </div>
                                </div>
                             </div>

                             <button className="w-full bg-[#004346] hover:bg-[#003639] text-white py-6 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-brand-900/30 active:scale-95">
                               Transfer Prescription to this Pharmacy
                             </button>
                          </div>
                        )}
                     </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'medications' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-600 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h2 className="text-5xl font-black text-brand-900 font-display tracking-tight">My Medications</h2>
                    <p className="text-brand-500 text-lg font-medium max-w-xl leading-relaxed">
                      Manage your active prescriptions and review your medical history. Our clinical curator ensures your therapeutic journey is safe and clearly documented.
                    </p>
                  </div>
                  <button className="bg-brand-900 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-brand-900/20 active:scale-95 transition-all">
                    <Plus className="w-5 h-5" /> New Request
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between border-l-4 border-brand-900 pl-4">
                    <h3 className="text-xl font-black text-brand-900 font-display tracking-tight uppercase">Active Prescriptions</h3>
                    <span className="text-[10px] font-black text-brand-400 tracking-widest">4 ACTIVE ITEMS</span>
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
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase whitespace-nowrap ${med.statusColor || 'bg-emerald-500/10 text-emerald-600'}`}>
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
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-brand-500 to-teal-400 rounded-full" style={{ width: `${med.progress}%` }} />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-5 gap-3 pt-6">
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
            )}

            {activeTab === 'prescriptions' && (
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
            )}

            {activeTab === 'orders' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-600 max-w-[1400px] mx-auto">
                <h2 className="text-4xl font-black text-brand-900 font-display mb-10 tracking-tight">Order History & Tracking</h2>

                <div className="flex flex-col xl:flex-row gap-10">
                  {/* Left Column: History & Tracking */}
                  <div className="flex-1 space-y-12">
                    {/* Live Tracking Card */}
                    <div className="bg-white rounded-[40px] p-10 border border-brand-900/5 shadow-sm space-y-12">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="space-y-4">
                          <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black tracking-widest uppercase">
                            {liveOrder.status}
                          </span>
                          <div className="space-y-1">
                            <h3 className="text-3xl font-black text-brand-900 font-display">Order #{liveOrder.orderId}</h3>
                            <p className="text-sm font-bold text-slate-400">
                              Placed on {liveOrder.placedDate} • {liveOrder.pharmacy}
                            </p>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 min-w-[240px]">
                           <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1 text-center">Estimated Pickup</p>
                           <p className="text-lg font-black text-brand-900 text-center leading-tight">
                             {liveOrder.eta.split(' — ')[0]} —<br />{liveOrder.eta.split(' — ')[1]}
                           </p>
                        </div>
                      </div>

                      <div className="relative pt-8 pb-4">
                        <div className="absolute top-[48px] left-[5%] right-[5%] h-[3px] bg-slate-100" />
                        <div className="absolute top-[48px] left-[5%] w-[66%] h-[3px] bg-[#004346]" />
                        
                        <div className="flex justify-between items-start relative z-10 px-0">
                          {liveOrder.steps.map((step, i) => (
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

                    {/* Recent History */}
                    <div className="space-y-8">
                       <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                         <h3 className="text-2xl font-black text-brand-900 font-display tracking-tight">Recent History</h3>
                         <button className="text-[11px] font-black text-brand-500 hover:text-brand-900 transition-colors uppercase tracking-widest flex items-center gap-2">
                           Download CSV <FileSpreadsheet className="w-4 h-4" />
                         </button>
                       </div>

                       <div className="space-y-6">
                         {orderHistory.map((order, i) => (
                           <div key={i} className="bg-white rounded-[32px] p-8 border border-brand-900/5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-xl transition-all border-transparent hover:border-brand-500/10">
                              <div className="flex items-center gap-8 flex-1">
                                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-brand-500/5 transition-colors">
                                    <order.icon className="w-8 h-8 text-brand-500/40 group-hover:text-brand-500 transition-colors" />
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
                         ))}
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
                                   : `${(preferredPharmacy.address as any).street}, ${(preferredPharmacy.address as any).city}`}
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
            )}

            {activeTab === 'settings' && (
              <div className="flex flex-col items-center justify-center min-h-[600px] text-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-brand-500/5 rounded-[32px] flex items-center justify-center mb-8 border border-brand-500/10">
                  <GraduationCap className="w-12 h-12 text-brand-500/20" />
                </div>
                <h2 className="text-3xl font-black text-brand-900 font-display mb-3">Module Under Clinical Review</h2>
                <p className="text-brand-500 max-w-md font-medium">The {activeTab} portal is currently being refined to meet full MediSync compliance standards. Check back shortly for updates.</p>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
