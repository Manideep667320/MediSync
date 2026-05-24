import api from './api';

export interface NearbyPharmaciesData {
  latitude: number;
  longitude: number;
  radius?: number;
  medicines?: string[];
}

class LocalService {
  async uploadPrescription(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('prescription', file);

    const response = await api.post('/local/upload-prescription', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response as any;
  }

  async findNearbyPharmacies(data: NearbyPharmaciesData): Promise<any> {
    const response = await api.post('/local/pharmacies/nearby', data);
    return response as any;
  }

  async placeOrder(data: {
    prescriptionId?: string;
    prescriptionData?: any;
    pharmacyId: string;
    deliveryType: 'pickup' | 'home_delivery';
    patientNotes?: string;
    deliveryAddress?: any;
  }): Promise<any> {
    const response = await api.post('/local/orders', data);
    return response as any;
  }

  async getOrders(): Promise<any> {
    const response = await api.get('/local/orders');
    return response as any;
  }

  async getOrder(id: string): Promise<any> {
    const response = await api.get(`/local/orders/${id}`);
    return response as any;
  }

  async getPrescriptions(): Promise<any> {
    const response = await api.get('/local/prescriptions');
    return response as any;
  }
}

export default new LocalService();
