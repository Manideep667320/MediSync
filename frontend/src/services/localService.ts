import api from './api';

export interface NearbyPharmaciesData {
  latitude: number;
  longitude: number;
  radius?: number;
  medicines?: string[];
}

class LocalService {
  async uploadPrescription(file: File) {
    const formData = new FormData();
    formData.append('prescription', file);

    const response = await api.post('/local/upload-prescription', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async findNearbyPharmacies(data: NearbyPharmaciesData) {
    const response = await api.post('/local/pharmacies/nearby', data);
    return response.data;
  }
}

export default new LocalService();
