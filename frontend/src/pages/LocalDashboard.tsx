import { useState, useRef } from 'react';
import { Upload, Camera, ArrowLeft, Download, Edit, MapPin, Check, Package, Clock } from 'lucide-react';
import { useRouter } from '../components/Router';
import localService from '../services/localService';
import type { PharmacyWithAvailability } from '../types';

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

export default function LocalDashboard() {
  const { navigate } = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prescription, setPrescription] = useState<DigitalPrescription | null>(null);
  const [pharmacies, setPharmacies] = useState<PharmacyWithAvailability[]>([]);
  const [showPharmacies, setShowPharmacies] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(5);

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
          {
            name: 'Amoxicillin',
            dosage: '500mg',
            frequency: 'Three times daily',
            duration: '7 days',
            instructions: 'Take after meals with water',
          },
          {
            name: 'Paracetamol',
            dosage: '650mg',
            frequency: 'As needed for fever',
            duration: '5 days',
            instructions: 'Maximum 4 times per day',
          },
        ],
        doctorNotes: 'Rest and stay hydrated. Avoid cold drinks.',
      };
      setPrescription(mockPrescription);
      setIsProcessing(false);
    }, 2000);
  };

  const searchPharmacies = async () => {
    setShowPharmacies(true);
    
    try {
      // Get user location or use default (New York City coordinates)
      let latitude = 40.7128;
      let longitude = -74.0060;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (geoError) {
          console.log('Using default location (New York)');
        }
      }

      // Extract medicine names from prescription
      const medicines = prescription?.medicines.map(m => m.name) || [];

      // Find nearby pharmacies
      const pharmaciesData = await localService.findNearbyPharmacies({
        latitude,
        longitude,
        radius: selectedRadius,
        medicines,
      });

      setPharmacies(pharmaciesData || []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/access')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Upload Your Prescription</h1>
          <p className="text-lg text-gray-600">Convert your physical prescription to digital format</p>
        </div>

        {!prescription && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-12 border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Upload Prescription Image</h3>
                <p className="text-gray-600 mb-6">
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
                    className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {isProcessing ? 'Analyzing prescription...' : 'Choose File'}
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:bg-gray-300"
                  >
                    <Camera className="w-5 h-5" />
                    Take Photo
                  </button>
                </div>

                {isProcessing && (
                  <div className="mt-6">
                    <div className="animate-pulse text-blue-600">Processing your prescription...</div>
                    <div className="mt-2 text-sm text-gray-500">This usually takes 5-10 seconds</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {prescription && !showPharmacies && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <Check className="w-6 h-6 text-green-600" />
                Digital Prescription
              </h2>

              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4 pb-6 border-b border-gray-200">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Patient Name</div>
                    <div className="font-semibold text-gray-900">{prescription.patientName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Age / Gender</div>
                    <div className="font-semibold text-gray-900">
                      {prescription.age} / {prescription.gender}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Date</div>
                    <div className="font-semibold text-gray-900">{prescription.date}</div>
                  </div>
                </div>

                <div className="pb-6 border-b border-gray-200">
                  <div className="text-sm text-gray-500 mb-2">Diagnosis</div>
                  <div className="text-lg font-semibold text-gray-900">{prescription.diagnosis}</div>
                </div>

                <div>
                  <div className="text-lg font-semibold mb-4 text-gray-900">Medicines</div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Medicine</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dosage</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Frequency</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {prescription.medicines.map((medicine, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{medicine.name}</td>
                            <td className="px-4 py-3 text-gray-700">{medicine.dosage}</td>
                            <td className="px-4 py-3 text-gray-700">{medicine.frequency}</td>
                            <td className="px-4 py-3 text-gray-700">{medicine.duration}</td>
                            <td className="px-4 py-3 text-gray-700 text-sm">{medicine.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {prescription.doctorNotes && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Doctor's Notes</div>
                    <div className="text-gray-800">{prescription.doctorNotes}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                <Edit className="w-5 h-5" />
                Edit Information
              </button>
              <button
                onClick={searchPharmacies}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                Find Pharmacies
              </button>
            </div>
          </div>
        )}

        {showPharmacies && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Nearby Pharmacies</h2>
              <div className="flex gap-4 items-center">
                <span className="text-gray-600">Search radius:</span>
                <div className="flex gap-2">
                  {[1, 3, 5, 10].map((radius) => (
                    <button
                      key={radius}
                      onClick={() => setSelectedRadius(radius)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        selectedRadius === radius
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {radius} km
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {pharmacies.map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{pharmacy.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{pharmacy.address}</p>
                      <div className="flex gap-2 flex-wrap">
                        {pharmacy.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Distance</div>
                      <div className="text-2xl font-bold text-gray-900">{pharmacy.distance} km</div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="text-yellow-500">★</div>
                        <span className="font-semibold text-gray-900">{pharmacy.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                          pharmacy.availabilityStatus === 'all_available'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        <Package className="w-4 h-4" />
                        {pharmacy.availabilityStatus === 'all_available'
                          ? 'All medicines available'
                          : 'Partial availability'}
                      </div>
                      {pharmacy.availabilityStatus === 'all_available' && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Ready in ~30 min</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {pharmacy.availabilityStatus === 'all_available' && (
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Total Price</div>
                          <div className="text-2xl font-bold text-green-600">${pharmacy.totalPrice.toFixed(2)}</div>
                        </div>
                      )}
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Reserve & Get Directions
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
