import { useState, useEffect } from 'react';
import { ArrowLeft, Search, MapPin, CheckCircle, Star, Package, Map, List, Truck, Car, Syringe } from 'lucide-react';

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

interface PharmaciesTabProps {
  prescription: any;
  pharmacies: PharmacyResult[];
  selectedRadius: number;
  handleRadiusChange: (r: number) => void;
  isSearching: boolean;
  selectedPharma: PharmacyResult | null;
  setSelectedPharma: (p: PharmacyResult | null) => void;
  zipSearch: string;
  setZipSearch: (z: string) => void;
  setActiveTab: (t: string) => void;
  setCurrentStep: (s: 'upload' | 'extracted' | 'pharmacies') => void;
  onPlaceOrder?: (
    pharmacyId: string,
    deliveryType: 'pickup' | 'home_delivery',
    patientNotes?: string,
    deliveryAddress?: any
  ) => void;
}

export default function PharmaciesTab({
  prescription,
  pharmacies,
  selectedRadius,
  handleRadiusChange,
  isSearching,
  selectedPharma,
  setSelectedPharma,
  zipSearch,
  setZipSearch,
  setActiveTab,
  setCurrentStep,
  onPlaceOrder
}: PharmaciesTabProps) {
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'home_delivery'>('pickup');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressZip, setAddressZip] = useState('');
  const [patientNotes, setPatientNotes] = useState('');

  // Fallback to pickup if delivery is not available
  useEffect(() => {
    if (selectedPharma && !selectedPharma.deliveryAvailable) {
      setDeliveryType('pickup');
    }
  }, [selectedPharma]);

  const handleSelectPharma = (pharma: PharmacyResult) => {
    setSelectedPharma(pharma);
    // Smooth scroll to checkout pane on smaller screens
    if (window.innerWidth < 1280) {
      setTimeout(() => {
        document.getElementById('checkout-pane')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
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
          <button
            onClick={() => handleRadiusChange(selectedRadius)}
            className="h-12 bg-[#004346] text-white px-8 rounded-xl font-bold hover:bg-[#003639] transition-all active:scale-95"
          >
            Search
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-6 pb-4 border-b border-brand-900/5 mt-4">
        <div className="flex flex-wrap items-center gap-3">
          {[2, 5, 10, 20].map((radius) => (
            <button
              key={radius}
              onClick={() => handleRadiusChange(radius)}
              className={`flex items-center gap-2 px-6 py-3 border rounded-full text-xs font-black shadow-sm transition-all ${selectedRadius === radius
                  ? 'bg-[#004346] text-white border-transparent'
                  : 'bg-white text-brand-900 border-brand-900/10 hover:border-brand-500/30'
                }`}
            >
              <MapPin className="w-3.5 h-3.5" /> {radius} km Radius
            </button>
          ))}
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

      <div className="flex flex-col xl:flex-row gap-10 min-h-screen">
        {/* Discovery Pane */}
        <div className="flex-1 space-y-6 pb-32">
          {isSearching ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[220px] bg-white rounded-3xl animate-pulse border border-brand-900/5" />
              ))}
            </div>
          ) : pharmacies.length > 0 ? (
            pharmacies.map((pharma, i) => (
              <div
                key={pharma.id}
                onClick={() => handleSelectPharma(pharma)}
                className={`bg-white rounded-[32px] p-8 border hover:shadow-2xl hover:shadow-brand-900/10 transition-all duration-500 group cursor-pointer flex flex-col md:flex-row gap-8 items-center ${selectedPharma?.id === pharma.id ? 'border-brand-500 shadow-xl' : 'border-brand-900/5 shadow-sm'
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
                        {pharma.address.street}, {pharma.address.city} • <span className="text-brand-900 font-black">{pharma.distance} km</span>
                      </p>
                    </div>
                    <div className="flex gap-4 items-center shrink-0">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-black text-brand-900">{pharma.rating}</span>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${pharma.availabilityStatus === 'all_available' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                        {pharma.availabilityStatus.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4 border-t border-slate-50">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Estimated Cost</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-brand-900">{pharma.totalPrice.toFixed(2)}</span>
                        <span className="text-xs font-bold text-slate-400">/ prescribed course</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectPharma(pharma)}
                      className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
                    >
                      Select Pharmacy
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-brand-900/5 shadow-sm">
              <p className="text-brand-500 font-medium">No pharmacies found within this radius. Try widening your search.</p>
            </div>
          )}
        </div>

        {/* Selection Pane (Checkout Sidebar) */}
        <div id="checkout-pane" className="w-full xl:w-[450px] space-y-8">
          <div className="xl:sticky xl:top-24 space-y-8">
            {/* Map View */}
            <div className="h-[300px] w-full bg-slate-900 rounded-[40px] overflow-hidden relative shadow-2xl group border-[6px] border-white ring-1 ring-brand-900/10">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800"
                alt="Map Background"
                className="w-full h-full object-cover opacity-50 contrast-125 grayscale"
              />
              <div className="absolute inset-0 bg-brand-900/20" />
              {pharmacies.map((p, idx) => (
                <div
                  key={p.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-all ${idx % 3 === 0 ? 'top-1/3 left-1/2' : idx % 3 === 1 ? 'top-2/3 left-1/4' : 'top-1/2 left-3/4'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-2xl transition-all ${selectedPharma?.id === p.id ? 'bg-[#004346] scale-125 z-50' : 'bg-[#172A3A] hover:bg-[#004346]'
                    }`}>
                    <Package className="w-5 h-5 text-white" />
                  </div>
                </div>
              ))}
            </div>

            {/* Selection Detail & Place Order Checkout */}
            {selectedPharma && (
              <div className="bg-white rounded-[40px] p-10 border border-brand-900/5 shadow-2xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-[#004346] rounded-2xl flex items-center justify-center shadow-lg shadow-brand-900/20">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Selected Choice</p>
                    <h4 className="text-2xl font-black text-brand-900 font-display leading-tight">{selectedPharma.name}</h4>
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
                    <p className="font-black text-brand-900 text-sm truncate">{selectedPharma.phone}</p>
                    <button className="text-brand-500 text-[10px] font-black uppercase tracking-widest hover:text-brand-900 transition-colors border-b-2 border-brand-500/20 pb-0.5 mt-1">
                      Call Now
                    </button>
                  </div>
                </div>

                {/* Fulfillment Options */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest border-b border-slate-100 pb-2">Choose Fulfillment Method</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setDeliveryType('pickup')}
                      className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${deliveryType === 'pickup'
                          ? 'bg-[#004346] text-white border-transparent'
                          : 'bg-slate-50 text-brand-900 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      Pickup
                    </button>
                    <button
                      onClick={() => setDeliveryType('home_delivery')}
                      disabled={!selectedPharma.deliveryAvailable}
                      className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${!selectedPharma.deliveryAvailable ? 'opacity-50 cursor-not-allowed' : ''
                        } ${deliveryType === 'home_delivery'
                          ? 'bg-[#004346] text-white border-transparent'
                          : 'bg-slate-50 text-brand-900 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      Delivery
                    </button>
                  </div>
                </div>

                {deliveryType === 'home_delivery' && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest leading-none">Delivery Address</p>
                    <input
                      type="text"
                      placeholder="Street address..."
                      value={addressStreet}
                      onChange={(e) => setAddressStreet(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-brand-900 outline-none focus:border-brand-500/50"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="City..."
                        value={addressCity}
                        onChange={(e) => setAddressCity(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-brand-900 outline-none focus:border-brand-500/50"
                      />
                      <input
                        type="text"
                        placeholder="Zip Code..."
                        value={addressZip}
                        onChange={(e) => setAddressZip(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-brand-900 outline-none focus:border-brand-500/50"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest leading-none">Patient Notes (Optional)</p>
                  <textarea
                    placeholder="Instructions for the pharmacist..."
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-brand-900 outline-none focus:border-brand-500/50 h-20 resize-none"
                  />
                </div>

                <button
                  onClick={() => {
                    if (onPlaceOrder) {
                      onPlaceOrder(
                        selectedPharma.id,
                        deliveryType,
                        patientNotes,
                        deliveryType === 'home_delivery'
                          ? { street: addressStreet, city: addressCity, state: 'WA', zipCode: addressZip }
                          : undefined
                      );
                    }
                  }}
                  className="w-full bg-[#004346] hover:bg-[#003639] text-white py-6 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-brand-900/30 active:scale-95"
                >
                  Place Order at this Pharmacy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
