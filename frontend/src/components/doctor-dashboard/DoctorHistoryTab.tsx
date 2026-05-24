import { useState } from 'react';
import { History, Eye, Loader2, Calendar, User, FileText, Pill, Clipboard, Download } from 'lucide-react';
import Modal from '../Modal';
import { Prescription } from '../../types';

interface DoctorHistoryTabProps {
  prescriptions: Prescription[];
  loadingPrescriptions: boolean;
  setActiveTab: (tab: string) => void;
  fetchPrescriptions: () => void;
}

export default function DoctorHistoryTab({
  prescriptions,
  loadingPrescriptions,
  setActiveTab,
  fetchPrescriptions,
}: DoctorHistoryTabProps) {
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  const handlePrint = (p: Prescription) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const medicinesHtml = p.medicines?.map((m: any) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: bold; color: #0f172a;">${m.medicineName || m.medicine_name}</td>
        <td style="padding: 12px; color: #334155;">${m.dosage}</td>
        <td style="padding: 12px; color: #334155;">${m.frequency}</td>
        <td style="padding: 12px; color: #334155;">${m.duration}</td>
        <td style="padding: 12px; color: #334155; text-align: center;">${m.quantity}</td>
      </tr>
    `).join('') || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription_${p.prescriptionId || 'Download'}</title>
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
              <p style="font-weight: bold; margin: 0; color: #0f172a;">Prescription ID: ${p.prescriptionId || 'N/A'}</p>
              <p style="margin: 4px 0 0 0; color: #64748b;">Date: ${new Date(p.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>

          <div class="grid">
            <div>
              <span class="label">Patient Name</span>
              <div class="value">${p.patientName}</div>
            </div>
            <div>
              <span class="label">Status</span>
              <div class="value">${(p.status || 'Active').toUpperCase()}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Clinical Indication</div>
            <div style="font-size: 14px; color: #334155;">
              <strong>Diagnosis:</strong> ${p.diagnosis}<br/>
              <strong>Symptoms:</strong> ${p.symptoms || 'N/A'}
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

          ${p.doctorNotes || p.notes ? `
            <div class="section">
              <div class="section-title">Doctor Notes</div>
              <p style="font-size: 13px; color: #475569; margin: 0; white-space: pre-wrap;">${p.doctorNotes || p.notes}</p>
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

  const handleOpenDetails = (p: Prescription) => {
    setSelectedPrescription(p);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-600">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">My Prescriptions</h1>
          <p className="text-slate-500 mt-1">Review and manage your clinical records</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPrescriptions}
            disabled={loadingPrescriptions}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-300 disabled:opacity-50 text-sm font-semibold text-slate-600"
          >
            {loadingPrescriptions ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <History className="w-4 h-4 text-slate-400" />
            )}
            Refresh
          </button>
        </div>
      </div>

      <div className="card-clean overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Prescription ID</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Patient</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Diagnosis</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingPrescriptions ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                      <span className="text-slate-500 font-medium">Fetching clinical records...</span>
                    </div>
                  </td>
                </tr>
              ) : prescriptions.length > 0 ? (
                prescriptions.map((p, i) => (
                  <tr key={p._id || i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-brand-900">
                      {p.prescriptionId || `RX-${String(i + 1).padStart(6, '0')}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{p.patientName}</div>
                      <div className="text-xs text-slate-500">Age: {p.patientAge}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{p.diagnosis}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                        p.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                        p.status === 'active' || p.status === 'SENT' ? 'bg-brand-50 text-brand-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.status === 'completed' ? 'bg-emerald-500' :
                          p.status === 'active' || p.status === 'SENT' ? 'bg-brand-500' :
                          'bg-slate-400'
                        }`} />
                        {(p.status || 'PENDING').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(p)}
                        className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-5-0 rounded-lg transition-all"
                        title="View Prescription Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <History className="w-6 h-6" />
                      </div>
                      <div className="text-slate-500 font-medium">No prescriptions found</div>
                      <button
                        onClick={() => setActiveTab('new')}
                        className="text-brand-500 hover:underline font-semibold text-sm"
                      >
                        Create your first prescription
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPrescription && (
        <Modal
          isOpen={!!selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
          title={`Prescription: ${selectedPrescription.prescriptionId || 'Details'}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Verified Record
                </span>
                <p className="text-xs text-slate-400 mt-1">Issued on {new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handlePrint(selectedPrescription)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-500/10 active:scale-95"
              >
                <Download className="w-4 h-4" /> Download PDF / Print
              </button>
            </div>

            {/* Patient Header Details */}
            <div className="grid md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center text-brand-900">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Patient Name</div>
                  <div className="font-semibold text-slate-950">{selectedPrescription.patientName}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center text-brand-900">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Age / Gender</div>
                  <div className="font-semibold text-slate-950">
                    {selectedPrescription.patientAge ? `${selectedPrescription.patientAge} years` : 'N/A'}
                    {selectedPrescription.patientGender ? ` / ${selectedPrescription.patientGender}` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis / Symptoms */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-500 mt-0.5 flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Diagnosis</h4>
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{selectedPrescription.diagnosis}</p>
                </div>
              </div>

              {selectedPrescription.symptoms && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-500 mt-0.5 flex-shrink-0">
                    <Clipboard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Symptoms</h4>
                    <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{selectedPrescription.symptoms}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Medicines List */}
            <div className="space-y-3">
              <h4 className="text-md font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Pill className="w-4 h-4 text-brand-500" />
                Prescribed Medications
              </h4>
              <div className="space-y-2">
                {selectedPrescription.medicines?.map((med, index) => (
                  <div key={index} className="p-4 bg-brand-500/5 rounded-xl border border-brand-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-semibold text-brand-900">{med.medicineName}</div>
                      {med.instructions && (
                        <div className="text-xs text-brand-700 font-medium">Instructions: {med.instructions}</div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:flex items-center gap-x-6 gap-y-1 text-sm text-slate-600 font-medium">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Dosage</span>
                        {med.dosage}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Frequency</span>
                        {med.frequency}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Duration</span>
                        {med.duration}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Qty</span>
                        {med.quantity}
                      </div>
                    </div>
                  </div>
                ))}
                {(!selectedPrescription.medicines || selectedPrescription.medicines.length === 0) && (
                  <div className="text-center py-4 text-slate-500 bg-slate-50 rounded-lg">
                    No medications listed in this prescription record.
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {(selectedPrescription.doctorNotes || selectedPrescription.notes) && (
              <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/15">
                <h4 className="text-sm font-bold text-amber-900 mb-1">Doctor's Notes</h4>
                <p className="text-sm text-amber-800 whitespace-pre-wrap">
                  {selectedPrescription.doctorNotes || selectedPrescription.notes}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
