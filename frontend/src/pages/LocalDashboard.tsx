import { useState, useEffect } from 'react';
import {
  MapPin, LayoutDashboard, Pill, GraduationCap, History, Settings, HelpCircle, LogOut, Bell, User
} from 'lucide-react';
import NotificationCenter from '../components/NotificationCenter';
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

// Import subcomponents
import OverviewTab from '../components/local-dashboard/OverviewTab';
import PharmaciesTab from '../components/local-dashboard/PharmaciesTab';
import MedicationsTab from '../components/local-dashboard/MedicationsTab';
import PrescriptionsTab from '../components/local-dashboard/PrescriptionsTab';
import OrdersTab from '../components/local-dashboard/OrdersTab';

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

export default function LocalDashboard() {
  const { navigate } = useRouter();
  const { logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentStep, setCurrentStep] = useState<'upload' | 'extracted' | 'pharmacies'>('upload');
  const [prescriptionHistory, setPrescriptionHistory] = useState<DigitalPrescription[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prescription, setPrescription] = useState<DigitalPrescription | null>(null);
  const [pharmacies, setPharmacies] = useState<PharmacyResult[]>([]);
  const [selectedRadius, setSelectedRadius] = useState(5);
  const [isSearching, setIsSearching] = useState(false);
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

  const [orders, setOrders] = useState<any[]>([]);
  const [liveOrder, setLiveOrder] = useState<any | null>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [preferredPharmacy, setPreferredPharmacy] = useState<any>({
    name: 'MediCare Plus Pharmacy',
    address: '122 S Main St, Seattle',
    hours: '8:00 AM — 10:00 PM'
  });

  const [uploadStatus, setUploadStatus] = useState({
    filename: 'RX-SCAN-1024.pdf',
    progress: 100
  });

  const mapLiveOrder = (order: any) => {
    if (!order) return null;

    const status = order.status;
    const timeline = order.timeline || [];
    
    const getTimelineTime = (statusList: string[]) => {
      const entry = timeline.find((t: any) => statusList.includes(t.status));
      if (entry) {
        return new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return null;
    };

    const time1 = getTimelineTime(['prescription_sent']) || new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const time2 = getTimelineTime(['received_by_pharmacy', 'checking_stock', 'confirmed']);
    const time3 = getTimelineTime(['packing']);
    const time4 = getTimelineTime(['ready_for_pickup', 'out_for_delivery', 'completed']);

    const step4Label = order.deliveryType === 'home_delivery' ? 'Out for Delivery' : 'Ready for Pickup';

    const steps = [
      {
        label: 'Prescription Sent',
        completed: ['prescription_sent', 'received_by_pharmacy', 'checking_stock', 'confirmed', 'packing', 'ready_for_pickup', 'out_for_delivery', 'completed'].includes(status),
        active: status === 'prescription_sent',
        time: time1
      },
      {
        label: 'Verified by Pharmacy',
        completed: ['confirmed', 'packing', 'ready_for_pickup', 'out_for_delivery', 'completed'].includes(status),
        active: ['received_by_pharmacy', 'checking_stock'].includes(status),
        time: time2 || '--:--'
      },
      {
        label: 'Preparing Meds',
        completed: ['ready_for_pickup', 'out_for_delivery', 'completed'].includes(status),
        active: ['confirmed', 'packing'].includes(status),
        time: time3 || '--:--'
      },
      {
        label: step4Label,
        completed: ['completed'].includes(status),
        active: ['ready_for_pickup', 'out_for_delivery'].includes(status),
        time: time4 || '--:--'
      }
    ];

    let statusText = 'IN PROGRESS';
    if (status === 'prescription_sent') statusText = 'PRESCRIPTION SENT';
    else if (status === 'received_by_pharmacy' || status === 'checking_stock') statusText = 'BEING VERIFIED';
    else if (status === 'confirmed') statusText = 'CONFIRMED';
    else if (status === 'packing') statusText = 'PREPARING';
    else if (status === 'ready_for_pickup') statusText = 'READY FOR PICKUP';
    else if (status === 'out_for_delivery') statusText = 'OUT FOR DELIVERY';
    else if (status === 'completed') statusText = 'DELIVERED';
    else if (status === 'cancelled') statusText = 'CANCELLED';

    const placedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const meds = order.items.map((item: any) => `${item.medicineName} ${item.dosage || ''}`).join(', ');

    const createdAtTime = new Date(order.createdAt);
    const startEta = new Date(createdAtTime.getTime() + 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endEta = new Date(createdAtTime.getTime() + 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const eta = `Today — ${startEta} to ${endEta}`;

    return {
      id: order._id,
      orderId: order.orderId || order._id,
      placedDate,
      meds,
      pharmacy: order.pharmacyId?.name || 'Pharmacy',
      eta,
      status: statusText,
      steps,
      deliveryType: order.deliveryType,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      pharmacyId: order.pharmacyId
    };
  };

  const fetchPrescriptions = async () => {
    try {
      const response = await localService.getPrescriptions();
      if (response && response.success && response.data) {
        const mappedList = response.data.map((raw: any) => ({
          patientName: raw.patientName || 'John Doe',
          age: (raw.patientAge ?? raw.age ?? '34').toString(),
          gender: raw.patientGender || raw.gender || 'Male',
          date: raw.date || new Date(raw.createdAt).toISOString().split('T')[0],
          diagnosis: raw.diagnosis || 'Diagnosis extracted via AI',
          medicines: (raw.medicines || []).map((m: any) => ({
            name: m.medicineName || m.name || 'Unknown Medicine',
            dosage: m.dosage || '500mg',
            frequency: m.frequency || 'Once daily',
            duration: m.duration || '5 days',
            instructions: m.instructions || 'Take as directed'
          })),
          doctorNotes: raw.doctorNotes || 'Rest and recover.'
        }));
        setPrescriptionHistory(mappedList);
      }
    } catch (err) {
      console.error('Failed to fetch prescription history:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await localService.getOrders();
      if (response && response.success && response.data) {
        const rawOrders = response.data;
        setOrders(rawOrders);
        
        const activeOrder = rawOrders.find((o: any) => o.status !== 'completed' && o.status !== 'cancelled');
        if (activeOrder) {
          setLiveOrder(mapLiveOrder(activeOrder));
        } else {
          setLiveOrder(null);
        }

        const mappedHistory = rawOrders.map((o: any) => ({
          id: o.orderId || o._id,
          rawId: o._id,
          date: new Date(o.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }).toUpperCase(),
          meds: o.items.map((item: any) => `${item.medicineName} (${item.quantity})`).join(', '),
          pharmacy: o.pharmacyId?.name || 'Pharmacy',
          price: o.totalAmount,
          status: o.status
        }));
        setOrderHistory(mappedHistory);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const handlePlaceOrder = async (
    pharmacyId: string,
    deliveryType: 'pickup' | 'home_delivery',
    patientNotes?: string,
    deliveryAddress?: any
  ) => {
    if (!prescription) {
      alert('Please upload and verify a prescription first.');
      return;
    }

    try {
      setIsProcessing(true);
      const mappedMedicines = prescription.medicines.map((m: any) => ({
        medicineName: m.name || m.medicineName || 'Unknown Medicine',
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions,
        quantity: 10
      }));

      const prescriptionData = {
        patientName: prescription.patientName,
        patientAge: parseInt(prescription.age) || 34,
        patientGender: prescription.gender,
        diagnosis: prescription.diagnosis,
        medicines: mappedMedicines,
        doctorNotes: prescription.doctorNotes
      };

      const payload = {
        prescriptionData,
        pharmacyId,
        deliveryType,
        patientNotes,
        deliveryAddress
      };

      const response = await localService.placeOrder(payload);
      if (response && response.success) {
        alert('Order placed successfully!');
        await fetchOrders();
        await fetchPrescriptions();
        setPrescription(null);
        setCurrentStep('upload');
        setActiveTab('orders');
      } else {
        throw new Error(response.message || 'Failed to place order');
      }
    } catch (err: any) {
      console.error('Failed to place order:', err);
      alert(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    if (pharmacies.length > 0) {
      setPreferredPharmacy({
        name: pharmacies[0].name,
        address: pharmacies[0].address,
        hours: '8:00 AM — 10:00 PM'
      });
    }
  }, [pharmacies]);

  useEffect(() => {
    let intervalId: any = null;
    
    if (liveOrder && !['DELIVERED', 'CANCELLED', 'completed', 'cancelled'].includes(liveOrder.status)) {
      intervalId = setInterval(async () => {
        try {
          const response = await localService.getOrders();
          if (response && response.success && response.data) {
            const rawOrders = response.data;
            const activeOrder = rawOrders.find((o: any) => o.status !== 'completed' && o.status !== 'cancelled');
            if (activeOrder) {
              setLiveOrder(mapLiveOrder(activeOrder));
            } else {
              setLiveOrder(null);
              fetchOrders();
            }
          }
        } catch (err) {
          console.error('Error polling active order:', err);
        }
      }, 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [liveOrder]);

  // Handle uploading progress state for widgets
  useEffect(() => {
    if (isProcessing) {
      setUploadStatus({
        filename: 'Uploading scan...',
        progress: 45
      });
    } else if (prescription) {
      setUploadStatus({
        filename: 'Prescription-Scan.pdf',
        progress: 100
      });
    }
  }, [isProcessing, prescription]);

  const handleLogout = () => {
    logout();
    navigate('/');
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
          // ignore
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
              <NotificationCenter />
              <button className="p-2 text-brand-700 hover:bg-brand-500/10 rounded-full transition-colors group relative">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-900 font-bold border border-brand-500/30">
                  <User className="w-4 h-4" />
                </div>
              </button>
              <SidebarTrigger className="md:hidden" />
            </div>
          </header>

          <main className="flex-1 p-8 space-y-12 max-w-[1600px] mx-auto w-full">
            {activeTab === 'dashboard' && (
              <OverviewTab
                prescription={prescription}
                setPrescription={setPrescription}
                setPrescriptionHistory={setPrescriptionHistory}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                searchPharmacies={searchPharmacies}
                liveOrder={liveOrder}
              />
            )}

            {activeTab === 'pharmacies' && (
              <PharmaciesTab
                prescription={prescription}
                pharmacies={pharmacies}
                selectedRadius={selectedRadius}
                handleRadiusChange={handleRadiusChange}
                isSearching={isSearching}
                selectedPharma={selectedPharma}
                setSelectedPharma={setSelectedPharma}
                zipSearch={zipSearch}
                setZipSearch={setZipSearch}
                setActiveTab={setActiveTab}
                setCurrentStep={setCurrentStep}
                onPlaceOrder={handlePlaceOrder}
              />
            )}

            {activeTab === 'medications' && (
              <MedicationsTab
                activeMedications={activeMedications}
                historicMedications={historicMedications}
              />
            )}

            {activeTab === 'prescriptions' && (
              <PrescriptionsTab
                prescriptionHistory={prescriptionHistory}
                setPrescription={setPrescription}
                setActiveTab={setActiveTab}
                setCurrentStep={setCurrentStep}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersTab
                liveOrder={liveOrder}
                orderHistory={orderHistory}
                uploadStatus={uploadStatus}
                preferredPharmacy={preferredPharmacy}
              />
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
