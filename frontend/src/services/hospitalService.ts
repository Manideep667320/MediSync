import api from './api';

class HospitalService {
  async getHospitals(params?: {
    search?: string;
    city?: string;
    state?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/hospitals', { params });
    return response.data;
  }

  async getHospitalById(id: string) {
    const response = await api.get(`/hospitals/${id}`);
    return response.data;
  }
}

export default new HospitalService();
