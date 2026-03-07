import { useState, useRef } from 'react';
import { Upload, Camera, ArrowLeft, Download, Edit, MapPin, Check, Package, Clock, Star, Phone, Navigation, AlertCircle } from 'lucide-react';
import { useRouter } from '../components/Router';
import localService from '../services/localService';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prescription, setPrescription] = useState<DigitalPrescription | null>(null);
  const [pharmacies, setPharmacies] = useState<PharmacyResult[]>([]);
  const [showPharmacies, setShowPharmacies] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(5);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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
      setIsProcessing(false);
    }, 2000);
  };

  const getMockPharmacies = (radius: number): PharmacyResult[] => [
    {
      id: 'mock-1',
      name: 'HealthPlus Pharmacy',
      address: { street: '123 Main Street', city: 'Downtown', state: 'NY', zipCode: '10001', country: 'US' },
      distance: parseFloat((0.5 + Math.random() * radius * 0.3).toFixed(1)),
      rating: 4.8,
      phone: '+1 (555) 123-4567',
      features: ['24/7 Open', 'Home Delivery', 'Insurance Accepted'],
      deliveryAvailable: true,
      availabilityStatus: 'all_available',
      totalPrice: 32.50,
      estimatedTime: 15,
    },
    {
      id: 'mock-2',
      name: 'CareWell Medical Store',
      address: { street: '456 Oak Avenue', city: 'Midtown', state: 'NY', zipCode: '10002', country: 'US' },
      distance: parseFloat((1.0 + Math.random() * radius * 0.4).toFixed(1)),
      rating: 4.5,
      phone: '+1 (555) 234-5678',
      features: ['Prescription Refills', 'Drive-Through'],
      deliveryAvailable: false,
      availabilityStatus: 'all_available',
      totalPrice: 28.75,
      estimatedTime: 20,
    },
    {
      id: 'mock-3',
      name: 'MediCare Express',
      address: { street: '789 Elm Boulevard', city: 'Uptown', state: 'NY', zipCode: '10003', country: 'US' },
      distance: parseFloat((1.5 + Math.random() * radius * 0.5).toFixed(1)),
      rating: 4.6,
      phone: '+1 (555) 345-6789',
      features: ['Home Delivery', 'Online Ordering', 'Loyalty Program'],
      deliveryAvailable: true,
      availabilityStatus: 'partial_available',
      totalPrice: 0,
      estimatedTime: 25,
    },
    {
      id: 'mock-4',
      name: 'City General Pharmacy',
      address: { street: '321 Hospital Road', city: 'Medical District', state: 'NY', zipCode: '10004', country: 'US' },
      distance: parseFloat((2.0 + Math.random() * radius * 0.6).toFixed(1)),
      rating: 4.9,
      phone: '+1 (555) 456-7890',
      features: ['Hospital Affiliated', 'Compounding', 'Insurance Accepted'],
      deliveryAvailable: true,
      availabilityStatus: 'all_available',
      totalPrice: 35.20,
      estimatedTime: 30,
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
      // If API returns no results (empty DB), use mock data for demo purposes
      setPharmacies(apiPharmacies.length > 0 ? apiPharmacies : getMockPharmacies(radius));
    } catch {
      // API failed — use mock data so the feature still works for demo
      setPharmacies(getMockPharmacies(radius));
    } finally {
      setIsSearching(false);
    }
  };

  const searchPharmacies = () => {
    setShowPharmacies(true);
    fetchPharmacies(selectedRadius);
  };

  const handleRadiusChange = (radius: number) => {
    setSelectedRadius(radius);
    fetchPharmacies(radius);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-30 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <button
          onClick={() => navigate('/access')}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 font-display">
            <span className="text-white">Upload Your </span>
            <span className="text-gradient">Prescription</span>
          </h1>
          <p className="text-lg text-slate-400">Convert your physical prescription to digital format</p>
        </div>

        {!prescription && (
          <div className="max-w-2xl mx-auto">
            <div className="glass-card p-12 border-2 border-dashed border-white/10 hover:border-blue-500/30 transition-colors duration-300">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white font-display">Upload Prescription Image</h3>
                <p className="text-slate-400 mb-6">
                  Support for PNG, JPG, JPEG, and PDF files up to 10MB
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="btn-gradient py-3 px-6 rounded-xl font-semibold disabled:opacity-50"
                  >
                    <span className="relative z-10">{isProcessing ? 'Analyzing prescription...' : 'Choose File'}</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="flex items-center justify-center gap-2 bg-white/5 text-slate-300 py-3 px-6 rounded-xl font-semibold hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-5 h-5" />
                    Take Photo
                  </button>
                </div>

                {isProcessing && (
                  <div className="mt-6">
                    <div className="text-blue-400 animate-pulse">Processing your prescription...</div>
                    <div className="mt-2 text-sm text-slate-500">This usually takes 5-10 seconds</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {prescription && !showPharmacies && (
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 mb-6">
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2 font-display">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                Digital Prescription
              </h2>

              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4 pb-6 border-b border-white/10">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Patient Name</div>
                    <div className="font-semibold text-white">{prescription.patientName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Age / Gender</div>
                    <div className="font-semibold text-white">{prescription.age} / {prescription.gender}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Date</div>
                    <div className="font-semibold text-white">{prescription.date}</div>
                  </div>
                </div>

                <div className="pb-6 border-b border-white/10">
                  <div className="text-sm text-slate-500 mb-2">Diagnosis</div>
                  <div className="text-lg font-semibold text-white">{prescription.diagnosis}</div>
                </div>

                <div>
                  <div className="text-lg font-semibold mb-4 text-white font-display">Medicines</div>
                  <div className="glass-table overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left">Medicine</th>
                          <th className="px-4 py-3 text-left">Dosage</th>
                          <th className="px-4 py-3 text-left">Frequency</th>
                          <th className="px-4 py-3 text-left">Duration</th>
                          <th className="px-4 py-3 text-left">Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescription.medicines.map((medicine, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 font-medium text-white">{medicine.name}</td>
                            <td className="px-4 py-3">{medicine.dosage}</td>
                            <td className="px-4 py-3">{medicine.frequency}</td>
                            <td className="px-4 py-3">{medicine.duration}</td>
                            <td className="px-4 py-3 text-sm">{medicine.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {prescription.doctorNotes && (
                  <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                    <div className="text-sm font-semibold text-blue-400 mb-1">Doctor's Notes</div>
                    <div className="text-slate-300">{prescription.doctorNotes}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-white/5 text-slate-300 rounded-xl font-semibold hover:bg-white/10 border border-white/10 transition-colors">
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white/5 text-slate-300 rounded-xl font-semibold hover:bg-white/10 border border-white/10 transition-colors">
                <Edit className="w-5 h-5" />
                Edit Information
              </button>
              <button
                onClick={searchPharmacies}
                className="flex-1 flex items-center justify-center gap-2 btn-gradient px-6 py-3 rounded-xl font-semibold"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Find Pharmacies
                </span>
              </button>
            </div>
          </div>
        )}

        {showPharmacies && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold text-white font-display">Nearby Pharmacies</h2>
                <button
                  onClick={() => setShowPharmacies(false)}
                  className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                >
                  ← Back to Prescription
                </button>
              </div>
              <p className="text-slate-400 mb-4">
                Showing <span className="font-semibold text-white">{pharmacies.length} pharmacies</span> within <span className="font-semibold text-blue-400">{selectedRadius} km</span> that stock your medicines
              </p>
              <div className="flex gap-3 items-center flex-wrap">
                <span className="text-slate-400 font-medium">Search radius:</span>
                {[1, 3, 5, 10].map((radius) => (
                  <button
                    key={radius}
                    onClick={() => handleRadiusChange(radius)}
                    className={`px-5 py-2 rounded-xl font-semibold transition-all duration-300 ${selectedRadius === radius
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-glow-blue'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                      }`}
                  >
                    {radius} km
                  </button>
                ))}
              </div>
            </div>

            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
                <p className="text-slate-400 font-medium">Finding pharmacies near you…</p>
              </div>
            ) : searchError ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <AlertCircle className="w-12 h-12 text-red-400/50" />
                <p className="text-white font-semibold text-lg">Could not load pharmacies</p>
                <p className="text-slate-400 text-sm max-w-sm">{searchError}</p>
                <button
                  onClick={() => fetchPharmacies(selectedRadius)}
                  className="mt-2 btn-gradient px-5 py-2 rounded-xl font-semibold"
                >
                  <span className="relative z-10">Retry</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {pharmacies.map((pharmacy) => (
                  <div
                    key={pharmacy.id}
                    className="glass-card glass-card-hover p-6 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-white font-display">{pharmacy.name}</h3>
                          {pharmacy.deliveryAvailable && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              Home Delivery
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-3 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {pharmacy.address.street}, {pharmacy.address.city}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {pharmacy.features.map((feature, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-6 flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end mb-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-bold text-white text-lg">{pharmacy.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-sm justify-end">
                          <Navigation className="w-3.5 h-3.5 text-blue-400" />
                          <span className="font-semibold text-blue-400 text-lg">{pharmacy.distance} km</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${pharmacy.availabilityStatus === 'all_available'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                          <Package className="w-4 h-4" />
                          {pharmacy.availabilityStatus === 'all_available' ? 'All medicines in stock' : 'Partial availability'}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Ready ~{pharmacy.estimatedTime} min</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{pharmacy.phone}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        {pharmacy.availabilityStatus === 'all_available' && (
                          <div className="text-right">
                            <div className="text-xs text-slate-500">Est. Total</div>
                            <div className="text-2xl font-bold text-emerald-400">${pharmacy.totalPrice.toFixed(2)}</div>
                          </div>
                        )}
                        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-glow-blue transition-all duration-300 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Reserve &amp; Navigate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
