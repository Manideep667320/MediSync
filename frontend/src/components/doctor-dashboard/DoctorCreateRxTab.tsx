import { useState, useRef } from 'react';
import { Mic, Loader2, Square, X, Plus, Send, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import Modal from '../Modal';

interface Medicine {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

interface DoctorCreateRxTabProps {
  onSuccess: () => void;
  pharmacies: any[];
  initialPatient?: { id: string, name: string, age: string, consultationId: string } | null;
}

export default function DoctorCreateRxTab({ onSuccess, pharmacies, initialPatient }: DoctorCreateRxTabProps) {
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [prescription, setPrescription] = useState({
    patient_name: initialPatient?.name || '',
    age: initialPatient?.age || '',
    diagnosis: '',
    symptoms: '',
    medicines: [] as Medicine[],
    notes: '',
  });

  const [selectedPharmacyId, setSelectedPharmacyId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const addMedicine = () => {
    setPrescription(prev => ({
      ...prev,
      medicines: [...prev.medicines, {
        medicine_name: '',
        dosage: '',
        frequency: 'Twice daily',
        duration: '',
        instructions: '',
        quantity: 1,
      }],
    }));
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string | number) => {
    const updated = [...prescription.medicines];
    updated[index] = { ...updated[index], [field]: value } as Medicine;
    setPrescription({ ...prescription, medicines: updated });
  };

  const removeMedicine = (index: number) => {
    setPrescription(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access the microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'prescription-audio.webm');

      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${backendUrl}/doctor/voice-prescription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success && result.data && result.data.prescription) {
        const aiPrescription = result.data.prescription;
        const medsRaw: any[] = (aiPrescription.medicines || []);

        const meds: Medicine[] = medsRaw.map((m: any) => ({
          medicine_name: m.medicine_name || m.medicineName || m.name || '',
          dosage: m.dosage || m.dose || '',
          frequency: m.frequency || 'Twice daily',
          duration: m.duration || '',
          instructions: m.instructions || m.instruction || '',
          quantity: m.quantity || 1,
        }));

        // Sanitize medicines and extract mis-mapped patient details. Sometimes the
        // AI places patient details into the first medicine entry (e.g., "Patient John Doe").
        // Try to recover a patient name from the medicines list when the top-level
        // patient fields are empty, then remove that entry from medicines.
        let aiPatientName = (aiPrescription.patient_name || aiPrescription.patientName || '').toString().trim();
        let aiAge = (aiPrescription.age || '').toString().trim();

        // Attempt to extract patient name from first medicine entry if missing
        if (!aiPatientName && medsRaw.length > 0) {
          const firstRaw = (medsRaw[0].medicine_name || medsRaw[0].medicineName || medsRaw[0].name || '').toString().trim();
          if (firstRaw) {
            const lower = firstRaw.toLowerCase();
            // Pattern: "Patient John Doe, 45 years" or "Patient John Doe"
            const patientMatch = firstRaw.match(/patient\s+([A-Za-z ,.'-]+)/i);
            if (patientMatch && patientMatch[1]) {
              aiPatientName = patientMatch[1].split(',')[0].trim();
            } else {
              // Heuristic: if the string has two words and doesn't contain common
              // medicine tokens (mg, tablet, capsule, etc.) or digits, treat as name
              if (!/mg|ml|tablet|capsule|tab|\b\d+\b/i.test(firstRaw)) {
                const parts = firstRaw.split(/\s+/).filter(Boolean);
                if (parts.length >= 2 && parts.slice(0,2).every((p: string) => /^[A-Za-z'-.]+$/.test(p))) {
                  aiPatientName = parts.slice(0,2).join(' ');
                }
              }
            }
            // Extract age if present like '45 years' or a number
            if (!aiAge) {
              const ageMatch = firstRaw.match(/(\b\d{1,3}\b)\s*(years|yrs)?/i);
              if (ageMatch) aiAge = ageMatch[1];
            }
          }
        }

        // Filter medicines: remove entries that clearly represent patient info
        const sanitizedMeds = meds.filter((m, idx) => {
          const name = (m.medicine_name || '').toString().trim();
          if (!name) return false; // drop empty names
          const lower = name.toLowerCase();

          if (aiPatientName) {
            const patientLower = aiPatientName.toLowerCase();
            if (lower === patientLower) return false;
            if (lower.includes('patient') && lower.includes(patientLower.split(' ')[0])) return false;
          }

          // If the name contains an age token that matches aiAge, drop it
          if (aiAge && lower.includes(aiAge)) return false;

          // If the name contains obvious medicine tokens, keep it
          if (/mg|ml|tablet|capsule|tab|cream|syrup|injection|drops|spray/i.test(lower)) return true;

          // Otherwise keep the entry
          return true;
        });

        // If the first raw entry was used to extract patient data, and that entry
        // still exists in sanitizedMeds (because it wasn't an exact match), remove it
        if (aiPatientName && meds.length > 0) {
          const firstNameCandidate = (meds[0].medicine_name || '').toString().trim();
          if (firstNameCandidate) {
            const firstLower = firstNameCandidate.toLowerCase();
            const patientLower = aiPatientName.toLowerCase();
            if (firstLower === patientLower || firstLower.includes('patient') || (aiAge && firstLower.includes(aiAge))) {
              // drop the first item
              sanitizedMeds.shift();
            }
          }
        }

        // Final medicines selection: fallback to raw meds if sanitization removed everything
        const finalMeds = sanitizedMeds.length > 0 ? sanitizedMeds : (meds.length > 0 ? meds : prescription.medicines);

        setPrescription(prev => ({
          ...prev,
          patient_name: aiPatientName || prev.patient_name,
          age: aiAge || prev.age,
          diagnosis: aiPrescription.diagnosis || prev.diagnosis,
          symptoms: aiPrescription.symptoms || prev.symptoms,
          notes: aiPrescription.notes || prev.notes,
          medicines: finalMeds,
        }));

        setShowVoicePanel(false);
      } else {
        throw new Error(result.message || 'Failed to process voice prescription');
      }
    } catch (error: any) {
      console.error('Audio processing error:', error);
      alert(error.message || 'Error processing audio. Make sure the AssemblyAI API key is set in the backend.');
    } finally {
      setIsProcessing(false);
    }
  };

  const [validationAlerts, setValidationAlerts] = useState<any[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const handleSendToPharmacy = async (skipValidation = false) => {
    if (!prescription.patient_name || !selectedPharmacyId) {
      alert('Please enter patient name and select a pharmacy');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      if (!skipValidation) {
        // Run validation check
        const validateResponse = await fetch(`${backendUrl}/doctor/prescriptions/validate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ medicines: prescription.medicines })
        });
        const validateResult = await validateResponse.json();
        
        if (validateResult.success && validateResult.alerts && validateResult.alerts.length > 0) {
          setValidationAlerts(validateResult.alerts);
          setShowValidationModal(true);
          setIsSubmitting(false);
          return;
        }
      }

      const payload = {
        patientId: initialPatient?.id || undefined,
        patientName: prescription.patient_name,
        patientAge: parseInt(prescription.age) || undefined,
        diagnosis: prescription.diagnosis,
        symptoms: prescription.symptoms,
        notes: prescription.notes,
        medicines: prescription.medicines.map(m => ({
          medicineName: m.medicine_name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions,
          quantity: m.quantity
        }))
      };

      const createResponse = await fetch(`${backendUrl}/doctor/prescriptions`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const createResult = await createResponse.json();
      
      if (!createResult.success) throw new Error(createResult.message);
      
      const sendResponse = await fetch(`${backendUrl}/doctor/prescriptions/${createResult.data._id}/send`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pharmacyId: selectedPharmacyId })
      });
      const sendResult = await sendResponse.json();
      
      if (sendResult.success) {
        // If part of a session, mark the consultation as completed
        if (initialPatient?.consultationId) {
          try {
            await fetch(`${backendUrl}/doctor/consultations/${initialPatient.consultationId}/status`, {
              method: 'PUT',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: 'completed' })
            });
          } catch (err) {
            console.error('Failed to mark consultation completed', err);
          }
        }
        
        alert('Prescription sent successfully!');
        onSuccess();
      } else {
        throw new Error(sendResult.message || 'Failed to send prescription');
      }
    } catch (error: any) {
      alert(error.message || 'Error sending to pharmacy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-brand-900 font-display">Create Prescription</h1>
        <button
          onClick={() => setShowVoicePanel(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${showVoicePanel
            ? 'bg-gradient-to-r from-brand-500 to-purple-600 text-brand-900 shadow-sm'
            : 'bg-brand-900/5 text-brand-700 hover:bg-brand-900/10 border border-brand-900/10'
            }`}
        >
          <Mic className="w-5 h-5" />
          {showVoicePanel ? 'Hide Voice Input' : 'Voice Input'}
        </button>
      </div>

      {showVoicePanel && (
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className={`w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-gradient-to-br from-brand-500 to-purple-600'
              }`}>
              <Mic className="w-7 h-7 text-brand-900" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-brand-900 font-display mb-1">
                {isProcessing ? 'Processing AI Transcription...' : isRecording ? 'Listening Now...' : 'Voice-to-Text Prescription'}
              </h3>
              <p className="text-sm text-brand-500">
                {isProcessing
                  ? 'Analyzing your voice — patient details and medicines will fill in below.'
                  : isRecording
                    ? 'Speak naturally: patient name, age, diagnosis, symptoms, and medicines.'
                    : 'Example: "Patient John Doe, 45 years, diagnosis acute bronchitis. Prescribe Amoxicillin 500mg twice daily for 7 days."'}
              </p>
            </div>
            {isProcessing ? (
              <div className="flex items-center gap-3 text-brand-700">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-semibold text-sm animate-pulse">Processing...</span>
              </div>
            ) : (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all flex-shrink-0 ${isRecording ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' : 'btn-gradient'
                  }`}
              >
                {isRecording ? (
                  <><Square className="w-4 h-4 fill-current" /><span>Stop</span></>
                ) : (
                  <><Mic className="w-4 h-4" /><span>Start Recording</span></>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="glass-card p-8">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-brand-800 mb-2">Patient Name *</label>
              <input
                type="text"
                value={prescription.patient_name}
                onChange={(e) => setPrescription({ ...prescription, patient_name: e.target.value })}
                className="w-full px-4 py-3 glass-input"
                placeholder="Enter patient name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-800 mb-2">Age *</label>
              <input
                type="number"
                value={prescription.age}
                onChange={(e) => setPrescription({ ...prescription, age: e.target.value })}
                className="w-full px-4 py-3 glass-input"
                placeholder="Enter age"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-800 mb-2">Diagnosis *</label>
            <textarea
              value={prescription.diagnosis}
              onChange={(e) => setPrescription({ ...prescription, diagnosis: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 glass-input"
              placeholder="Enter diagnosis"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-800 mb-2">Symptoms</label>
            <textarea
              value={prescription.symptoms}
              onChange={(e) => setPrescription({ ...prescription, symptoms: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 glass-input"
              placeholder="Enter symptoms"
            />
          </div>

          <div className="border-t border-brand-900/10 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-brand-900 font-display">Medicines</h3>
              <button
                onClick={addMedicine}
                className="flex items-center gap-2 px-4 py-2 bg-brand-900/5 text-brand-700 hover:bg-brand-900/10 rounded-xl font-semibold transition-colors border border-brand-900/10"
              >
                <Plus className="w-4 h-4" />
                Add Medicine
              </button>
            </div>

            <div className="space-y-4">
              {prescription.medicines.map((med, index) => (
                <div key={index} className="bg-brand-900/5 p-6 rounded-xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-brand-500">Medicine {index + 1}</span>
                    <button
                      onClick={() => removeMedicine(index)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Remove medicine"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-brand-800 mb-2">Medicine Name *</label>
                      <input
                        type="text"
                        value={med.medicine_name}
                        onChange={(e) => updateMedicine(index, 'medicine_name', e.target.value)}
                        className="w-full px-4 py-2 glass-input"
                        placeholder="e.g., Amoxicillin"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-800 mb-2">Dosage *</label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        className="w-full px-4 py-2 glass-input"
                        placeholder="e.g., 500mg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-800 mb-2">Frequency *</label>
                      <select
                        value={med.frequency}
                        onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                        className="w-full px-4 py-2 glass-input"
                      >
                        <option>Once daily</option>
                        <option>Twice daily</option>
                        <option>Three times daily</option>
                        <option>Four times daily</option>
                        <option>Every 4 hours</option>
                        <option>Every 6 hours</option>
                        <option>Every 8 hours</option>
                        <option>As needed (PRN)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-800 mb-2">Duration *</label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                        className="w-full px-4 py-2 glass-input"
                        placeholder="e.g., 7 days"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-800 mb-2">Quantity</label>
                      <input
                        type="number"
                        value={med.quantity}
                        onChange={(e) => updateMedicine(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2 glass-input"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-800 mb-2">Instructions</label>
                      <input
                        type="text"
                        value={med.instructions}
                        onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                        className="w-full px-4 py-2 glass-input"
                        placeholder="e.g., Take with food"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {prescription.medicines.length === 0 && (
              <div className="text-center py-8 text-brand-500 bg-brand-900/5 rounded-xl border border-white/5">
                <p>No medicines added yet. Click "Add Medicine" or use voice input.</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-800 mb-2">Doctor's Notes</label>
            <textarea
              value={prescription.notes}
              onChange={(e) => setPrescription({ ...prescription, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 glass-input"
              placeholder="Additional instructions or notes"
            />
          </div>

          <div className="border-t border-brand-900/10 pt-6">
            <label className="block text-sm font-semibold text-brand-800 mb-2">Select Pharmacy *</label>
            <select
              value={selectedPharmacyId}
              onChange={(e) => setSelectedPharmacyId(e.target.value)}
              className="w-full px-4 py-3 glass-input bg-white"
            >
              <option value="">-- Choose a Pharmacy --</option>
              {pharmacies.map(p => (
                <option key={p._id} value={p._id}>{p.name} - {p.address?.city}, {p.address?.state}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-6">
            <button className="px-6 py-3 bg-brand-900/5 text-brand-800 rounded-xl font-semibold hover:bg-brand-900/10 transition-colors border border-brand-900/10">
              Save as Draft
            </button>
            <button className="px-6 py-3 bg-brand-900/5 text-brand-800 rounded-xl font-semibold hover:bg-brand-900/10 transition-colors border border-brand-900/10">
              Preview PDF
            </button>
            <button 
              onClick={() => handleSendToPharmacy()}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 btn-gradient px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-5 h-5" /> Send to Pharmacy</>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Validation Warnings Modal */}
        {showValidationModal && (
          <Modal
            isOpen={showValidationModal}
            onClose={() => setShowValidationModal(false)}
            title="Prescription Validation Alerts"
            size="md"
          >
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">Potential Clinical Issues Detected</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    The system's real-time safety engine flagged the following alerts. Please review before proceeding.
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {validationAlerts.map((alert, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border flex gap-3 ${
                      alert.severity === 'CRITICAL' 
                        ? 'bg-red-50 border-red-200 text-red-900' 
                        : 'bg-yellow-50 border-yellow-250 text-yellow-900'
                    }`}
                  >
                    {alert.severity === 'CRITICAL' ? (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider">
                        {alert.type} Alert ({alert.severity})
                      </div>
                      <div className="text-sm mt-1">{alert.message}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  Go Back & Edit
                </button>
                <button
                  onClick={() => handleSendToPharmacy(true)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-brand-900 hover:bg-brand-900/90 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Send Anyway
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
