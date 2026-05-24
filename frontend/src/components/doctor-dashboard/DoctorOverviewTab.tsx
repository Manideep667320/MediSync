import { LayoutDashboard, Pill, Users, Clock, AlertCircle } from 'lucide-react';

interface DoctorOverviewTabProps {
  setActiveTab: (t: string) => void;
  setIsCreating: (c: boolean) => void;
  doctorDisplayName: string;
  dashboardData: any;
  loadingDashboard: boolean;
  consultations?: any[];
  startSession?: (consultation: any) => void;
  fetchConsultations?: () => void;
}

export default function DoctorOverviewTab({
  setActiveTab,
  setIsCreating,
  doctorDisplayName,
  dashboardData,
  loadingDashboard,
  consultations = [],
  startSession,
  fetchConsultations,
}: DoctorOverviewTabProps) {
  const stats = dashboardData?.statistics;
  const recentPrescriptions = dashboardData?.recentPrescriptions || [];

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Morning, {doctorDisplayName}</h1>
          {loadingDashboard ? (
            <p className="text-slate-500 mt-1 text-sm">Loading live dashboard data…</p>
          ) : (
            <p className="text-slate-500 mt-1 text-sm">
              Today you have <span className="font-semibold text-slate-900">{stats?.todayPrescriptions ?? 0}</span> prescriptions.
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900 font-display">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </div>
          <div className="text-sm text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Consultations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <span className="text-[#508991]">●</span> Today's Consultations
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchConsultations && fetchConsultations()}
                  className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold rounded-full transition-colors flex items-center gap-1"
                >
                  <Clock className="w-3 h-3" />
                  Refresh
                </button>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                  {consultations.length} Upcoming
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {consultations.length === 0 && (
                <div className="card-clean p-4 text-slate-600 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                  No upcoming consultations found.
                </div>
              )}

              {consultations.map((consultation: any, idx: number) => {
                const isNext = idx === 0;
                const patientName = consultation.patientId?.firstName
                  ? `${consultation.patientId.firstName} ${consultation.patientId.lastName}`.trim()
                  : 'Patient';
                const timeLabel = formatTime(consultation.scheduledDate);
                const typeLabel = consultation.consultationType || 'in-person';

                return (
                  <div
                    key={consultation._id || idx}
                    className={`card-clean p-4 ${isNext ? 'border-l-4 border-l-[#508991]' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <div
                          className={`text-[10px] font-bold rounded px-1.5 py-0.5 mb-0.5 ${
                            isNext ? 'text-white bg-[#508991]' : 'text-[#508991] bg-[#508991]/10'
                          }`}
                        >
                          {isNext ? 'NEXT' : 'UPCOMING'}
                        </div>
                        <div className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {timeLabel || '—'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{patientName}</div>
                        <div className="text-sm text-slate-500 capitalize">
                          {typeLabel} Consultation
                        </div>
                      </div>
                      <button
                        onClick={() => startSession && startSession(consultation)}
                        className="px-4 py-2 bg-[#508991] text-white text-sm font-semibold rounded-lg hover:bg-[#457a81] transition-colors"
                      >
                        Start Session
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <span className="text-[#508991]">●</span> Recent Prescriptions (Details)
              </h2>
              <button
                onClick={() => setActiveTab('history')}
                className="text-sm font-medium text-[#508991] hover:underline"
              >
                View All
              </button>
            </div>
            <div className="card-clean overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Patient</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Diagnosis</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Timestamp</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentPrescriptions.length === 0 && !loadingDashboard && (
                    <tr>
                      <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                        No recent prescriptions.
                      </td>
                    </tr>
                  )}

                  {recentPrescriptions.map((rx: any, i: number) => {
                    const patientName = rx.patientId?.firstName
                      ? `${rx.patientId.firstName} ${rx.patientId.lastName}`.trim()
                      : rx.patientName || 'Patient';
                    const status = (rx.status || 'PENDING').toString();
                    const isSent = status.toLowerCase().includes('sent');
                    const statusColor = isSent
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-amber-700 bg-amber-50';
                    const timestamp = rx.createdAt ? new Date(rx.createdAt).toLocaleString() : '—';

                    return (
                      <tr key={rx._id || i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">{patientName}</td>
                        <td className="px-4 py-3 text-slate-600">{rx.diagnosis || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{timestamp}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setActiveTab('history')}
                            className="text-slate-400 hover:text-[#508991]"
                            title="Open history"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1/3) */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="rounded-xl p-5 text-white" style={{ background: '#1B3A3A', border: '1px solid #264d4d' }}>
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8ec8ce' }}>Today</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg p-3" style={{ background: '#0f2424' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8ec8ce' }}>Prescriptions</div>
                <div className="text-2xl font-bold text-white">{stats?.todayPrescriptions ?? 0}</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: '#0f2424' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8ec8ce' }}>Active patients</div>
                <div className="text-2xl font-bold text-white">{stats?.activePatients ?? 0}</div>
              </div>
              <div className="rounded-lg p-3 col-span-2" style={{ background: '#0f2424' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#8ec8ce' }}>Total prescriptions</div>
                <div className="text-2xl font-bold text-white">{stats?.totalPrescriptions ?? 0}</div>
              </div>
            </div>
          </div>

          {/* Pending / Unsent */}
          <div className="card-clean p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 font-display">Pending Prescriptions</h3>
              <span className="text-xs font-medium text-slate-500">
                {recentPrescriptions.filter((p: any) => (p.status || '').toString().toLowerCase() === 'pending').length} Tasks
              </span>
            </div>
            <div className="space-y-3">
              {recentPrescriptions
                .filter((p: any) => (p.status || '').toString().toLowerCase() === 'pending')
                .slice(0, 5)
                .map((rx: any, i: number) => {
                  const patientName = rx.patientId?.firstName
                    ? `${rx.patientId.firstName} ${rx.patientId.lastName}`.trim()
                    : rx.patientName || 'Patient';
                  const med = rx.medicines?.[0]?.medicineName || rx.diagnosis || 'Prescription';
                  return (
                    <div key={rx._id || i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#508991] rounded-lg flex items-center justify-center">
                        <Pill className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{med}</div>
                        <div className="text-xs text-slate-500">Patient: {patientName}</div>
                      </div>
                    </div>
                  );
                })}

              {recentPrescriptions.filter((p: any) => (p.status || '').toString().toLowerCase() === 'pending').length === 0 && !loadingDashboard && (
                <p className="text-sm text-slate-500">No pending prescriptions.</p>
              )}
            </div>
          </div>

          {/* Clinical Reminders */}
          <div className="card-clean p-5" style={{ background: '#E8F5F4', borderColor: '#b5dfe0' }}>
            <h3 className="font-bold text-[#172A3A] font-display mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#508991]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Clinical Reminders
            </h3>
            <ul className="space-y-2.5 text-sm text-[#004346]">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#508991] mt-1.5 flex-shrink-0" />
                Submit peer review for oncology journal by EOD.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#508991] mt-1.5 flex-shrink-0" />
                3 lab results from Friday still need validation.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
