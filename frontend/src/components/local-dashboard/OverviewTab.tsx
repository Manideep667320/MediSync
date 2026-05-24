import { useState, useRef } from 'react';
import { Upload, Camera, Check, Pill, LayoutDashboard, ArrowLeft, MapPin, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import localService from '../../services/localService';

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

interface OverviewTabProps {
  prescription: DigitalPrescription | null;
  setPrescription: (p: DigitalPrescription | null) => void;
  setPrescriptionHistory: React.Dispatch<React.SetStateAction<DigitalPrescription[]>>;
  isProcessing: boolean;
  setIsProcessing: (b: boolean) => void;
  currentStep: 'upload' | 'extracted' | 'pharmacies';
  setCurrentStep: (s: 'upload' | 'extracted' | 'pharmacies') => void;
  searchPharmacies: () => void;
  liveOrder: any;
}

export default function OverviewTab({
  prescription,
  setPrescription,
  setPrescriptionHistory,
  isProcessing,
  setIsProcessing,
  currentStep,
  setCurrentStep,
  searchPharmacies,
  liveOrder
}: OverviewTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handlePrint = () => {
    if (!prescription) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const medicinesHtml = prescription.medicines?.map((m: any) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: bold; color: #0f172a;">${m.name || m.medicineName}</td>
        <td style="padding: 12px; color: #334155;">${m.dosage}</td>
        <td style="padding: 12px; color: #334155;">${m.frequency}</td>
        <td style="padding: 12px; color: #334155;">${m.duration}</td>
        <td style="padding: 12px; color: #334155; text-align: center;">1</td>
      </tr>
    `).join('') || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription_Download</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 28px; font-weight: bold; color: #0f766e; margin: 0; }
            .rx-symbol { font-size: 36px; font-weight: bold; color: #0f766e; margin-bottom: 10px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .label { font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; }
            .value { font-size: 14px; font-weight: 600; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f8fafc; padding: 12px; text-align: left; font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
            .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">MediSync Prescription Record</h1>
              <p style="margin: 4px 0 0 0; color: #64748b;">Patient Digital Healthcare Network</p>
            </div>
            <div style="text-align: right;">
              <p style="font-weight: bold; margin: 0; color: #0f172a;">Prescription: Verified Extract</p>
              <p style="margin: 4px 0 0 0; color: #64748b;">Date: ${prescription.date || new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div class="grid">
            <div>
              <span class="label">Patient Name</span>
              <div class="value">${prescription.patientName}</div>
            </div>
            <div>
              <span class="label">Age / Gender</span>
              <div class="value">${prescription.age} / ${prescription.gender}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Clinical Indication</div>
            <div style="font-size: 14px; color: #334155;">
              <strong>Diagnosis:</strong> ${prescription.diagnosis}<br/>
            </div>
          </div>

          <div class="section">
            <div class="rx-symbol">℞</div>
            <table>
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th style="text-align: center;">Qty</th>
                </tr>
              </thead>
              <tbody>
                ${medicinesHtml}
              </tbody>
            </table>
          </div>

          ${prescription.doctorNotes ? `
            <div class="section">
              <div class="section-title">Doctor Notes</div>
              <p style="font-size: 13px; color: #475569; margin: 0; white-space: pre-wrap;">${prescription.doctorNotes}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>This is a digitally verified prescription record from the MediSync platform.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const response = await localService.uploadPrescription(file);
      if (response && response.success && response.data && response.data.prescription) {
        const raw = response.data.prescription;
        
        const mappedPrescription: DigitalPrescription = {
          patientName: raw.patientName || 'John Doe',
          age: (raw.patientAge ?? raw.age ?? '34').toString(),
          gender: raw.patientGender || raw.gender || 'Male',
          date: raw.date || new Date().toISOString().split('T')[0],
          diagnosis: raw.diagnosis || 'Diagnosis extracted via AI',
          medicines: (raw.medicines || []).map((m: any) => ({
            name: m.medicineName || m.name || 'Unknown Medicine',
            dosage: m.dosage || '500mg',
            frequency: m.frequency || 'Once daily',
            duration: m.duration || '5 days',
            instructions: m.instructions || 'Take as directed'
          })),
          doctorNotes: raw.doctorNotes || 'Rest and recover.'
        };
        
        setPrescription(mappedPrescription);
        setPrescriptionHistory(prev => [mappedPrescription, ...prev]);
        setCurrentStep('extracted');
      } else {
        throw new Error(response?.message || 'Failed to process prescription');
      }
    } catch (err: any) {
      console.error('Prescription upload failed:', err);
      alert(err.message || 'Prescription upload failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
            {liveOrder ? (
              <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-brand-900/5 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-brand-900 font-display">Live Order Status</h2>
                    <p className="text-sm text-brand-500">Order #{liveOrder.orderId} • Meds: {liveOrder.meds}</p>
                  </div>
                  <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black tracking-widest uppercase">
                    {liveOrder.status}
                  </span>
                </div>

                <div className="relative pt-12">
                  <div className="absolute top-[48px] left-0 right-0 h-0.5 bg-slate-100" />
                  <div className="flex justify-between items-start relative z-10">
                    {liveOrder.steps?.map((step: any, i: number) => (
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
            ) : (
              <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-brand-900/5 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                  <Pill className="w-8 h-8 text-brand-500/40" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-900 font-display">No Active Orders</h3>
                  <p className="text-sm text-brand-500 max-w-md mt-1">
                    Upload a clinical prescription to check inventory and place real-time orders at nearby pharmacies.
                  </p>
                </div>
              </div>
            )}

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
            <div className="bg-brand-900 p-10 text-white flex flex-col sm:flex-row justify-between sm:items-center gap-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-black font-display tracking-tight">Digital Prescription</h2>
                <p className="text-brand-300 font-bold text-sm tracking-widest uppercase">AI Verified Selection</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all border border-white/20 active:scale-95"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20">
                  <LayoutDashboard className="w-8 h-8 text-white" />
                </div>
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
  );
}
