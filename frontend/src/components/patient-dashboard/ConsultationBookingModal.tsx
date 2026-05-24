import React, { useState, useEffect } from 'react';
import { X, Calendar, Users } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  experience: number;
  consultationFee: number;
  profileImage?: string;
  hospitalId?: any;
}

interface ConsultationBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (consultation: any) => void;
  hospitalId?: string;
}

const MOCK_DOCTORS: Doctor[] = [
  { _id: 'mock-1', firstName: 'Ananya', lastName: 'Sharma', specialty: 'General Physician', experience: 12, consultationFee: 500 },
  { _id: 'mock-2', firstName: 'Rahul', lastName: 'Mehta', specialty: 'Cardiologist', experience: 15, consultationFee: 800 },
  { _id: 'mock-3', firstName: 'Priya', lastName: 'Nair', specialty: 'Dermatologist', experience: 8, consultationFee: 600 },
  { _id: 'mock-4', firstName: 'Vikram', lastName: 'Singh', specialty: 'Orthopedics', experience: 18, consultationFee: 750 },
  { _id: 'mock-5', firstName: 'Meera', lastName: 'Patel', specialty: 'Pediatrics', experience: 10, consultationFee: 550 },
];

export default function ConsultationBookingModal({ isOpen, onClose, onSuccess, hospitalId: propHospitalId }: ConsultationBookingModalProps) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [consultationType, setConsultationType] = useState<string>('in-person');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Use provided hospitalId or extract from user data if available
  const hospitalId = propHospitalId || (user as any)?.hospitalId;

  // Fetch doctors on modal open
  useEffect(() => {
    if (!isOpen) return;
    fetchDoctors();
  }, [isOpen]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      const response: any = await api.get(`/patient/doctors`);
      console.log('API /patient/doctors response:', response);
      if (response.success) {
        const apiDoctors = response.data?.doctors || [];
        console.log('Extracted apiDoctors:', apiDoctors);
        if (apiDoctors.length > 0) {
          setDoctors(apiDoctors);
        } else {
          setDoctors(MOCK_DOCTORS);
        }
        setError('');
      } else {
        console.warn('Backend returned success: false', response);
        setDoctors(MOCK_DOCTORS);
        setError(response.message || 'Failed to fetch doctors from server');
      }
    } catch (err: any) {
      console.error('Error fetching doctors:', err);
      setDoctors(MOCK_DOCTORS);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!selectedDoctor || !scheduledDate) {
      setError('Please fill in all required fields');
      return;
    }

    const selectedDoctorInfo = doctors.find(d => d._id === selectedDoctor);
    const isMockDoctor = selectedDoctor.startsWith('mock-');
    const effectiveHospitalId = selectedDoctorInfo?.hospitalId?._id || selectedDoctorInfo?.hospitalId || hospitalId;

    if (!effectiveHospitalId && !isMockDoctor) {
      setError('Hospital information not found for the selected doctor');
      return;
    }

    const resetForm = () => {
      setSelectedDoctor('');
      setScheduledDate('');
      setConsultationType('in-person');
      setReason('');
    };

    const buildMockConsultation = () => ({
      _id: `mock-appt-${Date.now()}`,
      scheduledDate,
      consultationType,
      reason: reason?.trim() || 'Consultation scheduled',
      status: 'scheduled',
      doctorId: selectedDoctorInfo
        ? { firstName: selectedDoctorInfo.firstName, lastName: selectedDoctorInfo.lastName, specialty: selectedDoctorInfo.specialty }
        : null,
      hospitalId: { name: 'MediSync Hospital' },
    });

    if (isMockDoctor) {
      resetForm();
      onSuccess?.(buildMockConsultation());
      onClose();
      return;
    }

    try {
      setSubmitting(true);
      const response: any = await api.post('/patient/consultations', {
        hospitalId: effectiveHospitalId,
        doctorId: selectedDoctor,
        scheduledDate,
        consultationType,
        reason
      });

      if (response.success) {
        resetForm();
        const payload = response.data;
        const consultation = payload?.consultation ?? payload;
        onSuccess?.(consultation);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book consultation');
      console.error('Error booking consultation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedDoctorData = doctors.find(d => d._id === selectedDoctor);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004346] to-[#003335] p-6 flex items-center justify-between border-b border-emerald-500/20">
          <div>
            <h2 className="text-2xl font-bold text-white font-display">Book a Consultation</h2>
            <p className="text-emerald-100 text-sm mt-1">Select a doctor and schedule your appointment</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form content — scrollable, scrollbar hidden */}
        <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Doctor Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-brand-900 uppercase tracking-wide">
              <Users className="w-4 h-4 inline mr-2 text-emerald-600" />
              Select Doctor
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-brand-900/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium text-brand-900 bg-white"
              required
            >
              <option value="" className="text-slate-900">-- Select a doctor --</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id} className="text-slate-900">
                  Dr. {doctor.firstName} {doctor.lastName} • {doctor.specialty} {doctor.consultationFee ? `(₹${doctor.consultationFee}/consultation)` : ''}
                </option>
              ))}
            </select>

            {selectedDoctorData && (
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-2xl">
                <div className="flex items-start gap-4">
                  {selectedDoctorData.profileImage && (
                    <img
                      src={selectedDoctorData.profileImage}
                      alt={selectedDoctorData.firstName}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-brand-900">Dr. {selectedDoctorData.firstName} {selectedDoctorData.lastName}</h3>
                    <p className="text-sm text-brand-600">{selectedDoctorData.specialty}</p>
                    <p className="text-xs text-brand-500 mt-1">{selectedDoctorData.experience}+ years experience</p>
                    {selectedDoctorData.consultationFee && (
                      <p className="text-sm font-bold text-emerald-700 mt-2">₹{selectedDoctorData.consultationFee} per consultation</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Consultation Type */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-brand-900 uppercase tracking-wide">
              Consultation Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['in-person', 'video', 'phone'].map(type => (
                <label
                  key={type}
                  className={`p-3 border rounded-xl cursor-pointer transition-all text-center font-medium capitalize ${
                    consultationType === type
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'border-brand-900/10 text-brand-600 hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="consultationType"
                    value={type}
                    checked={consultationType === type}
                    onChange={(e) => setConsultationType(e.target.value)}
                    className="hidden"
                  />
                  {type === 'in-person' ? '🏥 In-Person' : type === 'video' ? '📹 Video' : '📞 Phone'}
                </label>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-brand-900 uppercase tracking-wide">
              <Calendar className="w-4 h-4 inline mr-2 text-emerald-600" />
              Preferred Date & Time
            </label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-3 border border-brand-900/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium text-brand-900 bg-white"
              required
            />
          </div>

          {/* Reason for Consultation */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-brand-900 uppercase tracking-wide">
              Reason for Consultation (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe your symptoms or reason for consultation..."
              rows={3}
              className="w-full px-4 py-3 border border-brand-900/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium text-brand-900 bg-white resize-none"
            />
          </div>

          {/* Summary */}
          {selectedDoctorData && scheduledDate && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-sm">
              <p className="font-bold text-blue-900">Booking Summary:</p>
              <p className="text-blue-800">
                👨‍⚕️ <span className="font-medium">Dr. {selectedDoctorData.firstName} {selectedDoctorData.lastName}</span>
              </p>
              <p className="text-blue-800">
                🏥 <span className="font-medium">{selectedDoctorData.specialty}</span>
              </p>
              <p className="text-blue-800">
                📅 <span className="font-medium">{new Date(scheduledDate).toLocaleString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </p>
              <p className="text-blue-800">
                💰 <span className="font-medium">₹{selectedDoctorData.consultationFee}</span>
              </p>
            </div>
          )}
          </form>
        </div>

        {/* Action Buttons - Sticky Footer */}
        <div className="bg-white border-t border-brand-900/5 p-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-brand-900/10 text-brand-900 font-bold rounded-xl hover:bg-brand-900/5 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedDoctor || !scheduledDate}
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin">⏳</div>
                Booking...
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                Book Consultation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
