import api from './api';

export interface CreatePrescriptionData {
  patientId?: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  diagnosis: string;
  symptoms?: string;
  medicines: {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    instructions?: string;
  }[];
  doctorNotes?: string;
  urgent?: boolean;
  voiceToText?: boolean;
}

export interface SendToPharmacyData {
  pharmacyId: string;
  deliveryType: 'pickup' | 'delivery';
  patientNotes?: string;
}

class DoctorService {
  async getDashboard() {
    const response = await api.get('/doctor/dashboard');
    return response.data;
  }

  async createPrescription(data: CreatePrescriptionData) {
    const response = await api.post('/doctor/prescriptions', data);
    return response.data;
  }

  async getPrescriptions(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/doctor/prescriptions', { params });
    return response.data;
  }

  async getPrescriptionById(id: string) {
    const response = await api.get(`/doctor/prescriptions/${id}`);
    return response.data;
  }

  async updatePrescription(id: string, data: Partial<CreatePrescriptionData>) {
    const response = await api.put(`/doctor/prescriptions/${id}`, data);
    return response.data;
  }

  async sendToPharmacy(prescriptionId: string, data: SendToPharmacyData) {
    const response = await api.post(`/doctor/prescriptions/${prescriptionId}/send`, data);
    return response.data;
  }

  async getPatients(params?: { search?: string; page?: number; limit?: number }) {
    const response = await api.get('/doctor/patients', { params });
    return response.data;
  }

  async getAnalytics(params?: { startDate?: string; endDate?: string }) {
    const response = await api.get('/doctor/analytics', { params });
    return response.data;
  }
}

export default new DoctorService();
