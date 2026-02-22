import api from './api';

export interface UpdateOrderData {
  status: string;
  estimatedTime?: number;
  pharmacyNotes?: string;
  items?: {
    medicineName: string;
    dosage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    availability: 'available' | 'unavailable' | 'alternative';
  }[];
}

export interface UpdateInventoryData {
  availableQuantity?: number;
  unitPrice?: number;
  minimumStockLevel?: number;
  expiryDate?: string;
  batchNumber?: string;
}

class PharmacyService {
  async getDashboard() {
    const response = await api.get('/pharmacy/dashboard');
    return response.data;
  }

  async getOrders(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/pharmacy/orders', { params });
    return response.data;
  }

  async getOrderById(id: string) {
    const response = await api.get(`/pharmacy/orders/${id}`);
    return response.data;
  }

  async updateOrder(id: string, data: UpdateOrderData) {
    const response = await api.put(`/pharmacy/orders/${id}`, data);
    return response.data;
  }

  async getInventory(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/pharmacy/inventory', { params });
    return response.data;
  }

  async updateInventory(id: string, data: UpdateInventoryData) {
    const response = await api.put(`/pharmacy/inventory/${id}`, data);
    return response.data;
  }

  async addInventoryItem(data: any) {
    const response = await api.post('/pharmacy/inventory', data);
    return response.data;
  }

  async getAnalytics(params?: { startDate?: string; endDate?: string }) {
    const response = await api.get('/pharmacy/analytics', { params });
    return response.data;
  }
}

export default new PharmacyService();
