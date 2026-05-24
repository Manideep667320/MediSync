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
  _id: string;
  email: string;
  role: 'doctor' | 'patient' | 'pharmacy' | 'admin' | 'local';
  phone?: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  _id: string;
  userId: string;
  hospitalId: string;
  firstName: string;
  lastName: string;
  specialty: string;
  qualification?: string;
  licenseNumber: string;
  experience: number;
}

export interface Patient {
  _id: string;
  userId: string;
  hospitalId: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
}

export interface Pharmacy {
  _id: string;
  userId?: string;
  name: string;
  licenseNumber: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  location?: {
    type: string;
    coordinates: [number, number];
  };
  latitude?: number;
  longitude?: number;
  phone: string;
  email?: string;
  rating: number;
  verified: boolean;
  features: string[];
  deliveryAvailable: boolean;
  deliveryRadius: number;
  createdAt: string;
}

export interface Prescription {
  _id: string;
  prescriptionId: string;
  doctorId?: any; // can be populated object or string id
  patientId?: any; // can be populated object or string id
  hospitalId?: any; // can be populated object or string id
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  diagnosis: string;
  symptoms?: string;
  doctorNotes?: string;
  notes?: string; // fallback
  medicines: PrescriptionMedicine[];
  urgent: boolean;
  isDigital: boolean;
  status: 'PENDING' | 'SENT' | 'READY' | 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionMedicine {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity: number;
}

export interface Order {
  _id: string;
  orderId: string;
  prescriptionId: any; // can be populated object
  patientId: any; // can be populated object
  pharmacyId: any; // can be populated object
  status: 'prescription_sent' | 'received_by_pharmacy' | 'checking_stock' | 'confirmed' | 'packing' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled';
  totalAmount: number;
  estimatedTime: number;
  deliveryType: 'pickup' | 'delivery';
  patientNotes?: string;
  pharmacyNotes?: string;
  items: Array<{
    medicineName: string;
    dosage: string;
    quantity: number;
    unitPrice?: number;
    totalPrice?: number;
    availability?: 'available' | 'unavailable';
  }>;
  timeline: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PharmacyInventory {
  _id: string;
  pharmacyId: string;
  medicine: string;
  stock: number;
  price: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PharmacyWithAvailability extends Pharmacy {
  availabilityStatus: 'all_available' | 'partial_available' | 'none_available';
  totalPrice: number;
  distance?: number;
  availableMedicinesCount: number;
  totalRequestedMedicines: number;
  estimatedTime: number;
}
