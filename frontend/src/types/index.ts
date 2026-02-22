export interface Hospital {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  location?: {
    type: string;
    coordinates: [number, number];
  };
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  verified: boolean;
  subscriptionTier?: string;
  subscriptionExpiry?: string;
  registrationNumber?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: 'doctor' | 'patient' | 'pharmacy';
  full_name: string;
  hospital_id?: string;
  phone?: string;
  specialization?: string;
  license_number?: string;
  created_at: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  verified: boolean;
  features: string[];
  phone: string;
  user_id?: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  prescription_number: string;
  doctor_id: string;
  patient_id: string;
  hospital_id: string;
  diagnosis: string;
  symptoms?: string;
  notes?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  prescription_date: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionMedicine {
  id: string;
  prescription_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  prescription_id: string;
  patient_id: string;
  pharmacy_id: string;
  status: 'new' | 'checking' | 'confirmed' | 'packing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled';
  total_amount: number;
  estimated_time: number;
  delivery_type: 'pickup' | 'delivery';
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Inventory {
  id: string;
  pharmacy_id: string;
  medicine_name: string;
  generic_name?: string;
  category?: string;
  stock_quantity: number;
  min_stock_level: number;
  unit_price: number;
  expiry_date?: string;
  batch_number?: string;
  supplier?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface PharmacyWithAvailability extends Pharmacy {
  availabilityStatus: 'all_available' | 'partial_available' | 'none_available';
  totalPrice: number;
  distance?: number;
}
