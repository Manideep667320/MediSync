import { useState, useEffect } from 'react';
import { Search, ArrowLeft, Building, MapPin, CheckCircle } from 'lucide-react';
import { useRouter } from '../components/Router';
import hospitalService from '../services/hospitalService';
import { Hospital } from '../types';

export default function HospitalSelection() {
  const { navigate } = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = hospitals.filter(
        (hospital) =>
          hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hospital.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hospital.address.state.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHospitals(filtered);
    } else {
      setFilteredHospitals(hospitals);
    }
  }, [searchQuery, hospitals]);

  const fetchHospitals = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await hospitalService.getHospitals({ limit: 100 });
      setHospitals(response.hospitals || []);
      setFilteredHospitals(response.hospitals || []);
    } catch (err: any) {
      console.error('Error fetching hospitals:', err);
      setError(err.message || 'Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const selectHospital = (hospitalId: string) => {
    localStorage.setItem('selectedHospitalId', hospitalId);
    navigate(`/hospital/${hospitalId}/role`);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute bottom-40 left-20 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <button
          onClick={() => navigate('/access')}
          className="flex items-center gap-2 text-brand-700 hover:text-brand-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 font-display">
            <span className="text-brand-900">Select Your </span>
            <span className="text-gradient">Hospital</span>
          </h1>
          <p className="text-lg text-brand-700">Choose the hospital you're affiliated with</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-500" />
            <input
              type="text"
              placeholder="Search by hospital name, city, or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 glass-input rounded-2xl text-lg"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-2 border-brand-500/30 border-t-brand-300 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-brand-700">Loading hospitals...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-red-400/50 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchHospitals}
              className="px-6 py-2 btn-gradient rounded-xl"
            >
              <span className="relative z-10">Try Again</span>
            </button>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-brand-700 mx-auto mb-4" />
            <p className="text-brand-700">No hospitals found matching your search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => (
              <div
                key={hospital._id}
                onClick={() => selectHospital(hospital._id)}
                className="glass-card glass-card-hover p-6 cursor-pointer group transition-all duration-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Building className="w-7 h-7 text-brand-900" />
                  </div>
                  {hospital.verified && (
                    <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-full text-xs font-semibold">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-brand-900 mb-2 group-hover:text-gradient transition-colors font-display">
                  {hospital.name}
                </h3>

                <div className="flex items-start gap-2 text-brand-700 text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand-500" />
                  <div>
                    <div>{hospital.address.street}</div>
                    <div className="text-brand-500">
                      {hospital.address.city}, {hospital.address.state} {hospital.address.zipCode}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
