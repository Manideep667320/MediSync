import api from './api';

class PatientService {
  async getDashboard() {
    const response = await api.get('/patient/dashboard');
    return response.data;
  }

  async getPrescriptions(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/patient/prescriptions', { params });
    return response.data;
  }

  async getPrescriptionById(id: string) {
    const response = await api.get(`/patient/prescriptions/${id}`);
    return response.data;
  }

  async cancelPrescription(id: string) {
    const response = await api.patch(`/patient/prescriptions/${id}/cancel`);
    return response.data;
  }

  async cancelConsultation(id: string) {
    const response = await api.patch(`/patient/consultations/${id}/cancel`);
    return response.data;
  }

  async getOrders(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/patient/orders', { params });
    return response.data;
  }

  async getOrderById(id: string) {
    const response = await api.get(`/patient/orders/${id}`);
    return response.data;
  }

  async getBills(params?: { page?: number; limit?: number }) {
    const response = await api.get('/patient/bills', { params });
    return response.data;
  }
}

export default new PatientService();
