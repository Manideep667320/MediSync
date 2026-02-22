const mongoose = require('mongoose');
require('dotenv').config();

const Hospital = require('../models/Hospital');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');

// Sample data
const hospitals = [
  {
    name: 'City General Hospital',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.730610]
    },
    phone: '+1-212-555-1000',
    email: 'info@citygeneralhospital.com',
    verified: true,
    subscriptionTier: 'professional'
  },
  {
    name: 'St. Mary\'s Medical Center',
    address: {
      street: '456 Oak Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'USA'
    },
    location: {
      type: 'Point',
      coordinates: [-73.985242, 40.748817]
    },
    phone: '+1-212-555-2000',
    email: 'contact@stmarysmedical.com',
    verified: true,
    subscriptionTier: 'enterprise'
  }
];

const medicines = [
  {
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    manufacturer: 'Generic Pharma',
    category: 'Antibiotic',
    form: 'Capsule',
    strength: '500mg',
    requiresPrescription: true,
    schedule: 'Schedule H'
  },
  {
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    manufacturer: 'Generic Pharma',
    category: 'Analgesic',
    form: 'Tablet',
    strength: '650mg',
    requiresPrescription: false,
    schedule: 'OTC'
  },
  {
    name: 'Metformin',
    genericName: 'Metformin HCl',
    manufacturer: 'Diabetes Care Inc',
    category: 'Antidiabetic',
    form: 'Tablet',
    strength: '850mg',
    requiresPrescription: true,
    schedule: 'Schedule H'
  },
  {
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    manufacturer: 'Cardio Health',
    category: 'Antihypertensive',
    form: 'Tablet',
    strength: '10mg',
    requiresPrescription: true,
    schedule: 'Schedule H'
  },
  {
    name: 'Cetirizine',
    genericName: 'Cetirizine HCl',
    manufacturer: 'Allergy Relief Co',
    category: 'Antihistamine',
    form: 'Tablet',
    strength: '10mg',
    requiresPrescription: false,
    schedule: 'OTC'
  }
];

const pharmacies = [
  // ─── within 1 km ────────────────────────────────────────────────────────────
  {
    name: 'MediCare Plus Pharmacy',
    licenseNumber: 'PH-NY-101',
    address: { street: '42 Oak Street', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
    location: { type: 'Point', coordinates: [-74.003, 40.7168] },
    phone: '+1 (555) 101-2030',
    email: 'info@medicareplus.com',
    features: ['24/7 Open', 'Home Delivery', 'Digital Rx'],
    rating: 4.8,
    verified: true,
    deliveryAvailable: true,
    deliveryRadius: 10,
    operatingHours: {
      monday:    { open: '00:00', close: '23:59', isOpen: true },
      tuesday:   { open: '00:00', close: '23:59', isOpen: true },
      wednesday: { open: '00:00', close: '23:59', isOpen: true },
      thursday:  { open: '00:00', close: '23:59', isOpen: true },
      friday:    { open: '00:00', close: '23:59', isOpen: true },
      saturday:  { open: '00:00', close: '23:59', isOpen: true },
      sunday:    { open: '00:00', close: '23:59', isOpen: true }
    }
  },
  {
    name: 'City Health Pharmacy',
    licenseNumber: 'PH-NY-102',
    address: { street: '9 Maple Ave', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
    location: { type: 'Point', coordinates: [-74.003, 40.7048] },
    phone: '+1 (555) 202-3141',
    email: 'info@cityhealthrx.com',
    features: ['Insurance Accepted', 'Generic Meds'],
    rating: 4.5,
    verified: true,
    deliveryAvailable: false,
    deliveryRadius: 0,
    operatingHours: {
      monday:    { open: '08:00', close: '21:00', isOpen: true },
      tuesday:   { open: '08:00', close: '21:00', isOpen: true },
      wednesday: { open: '08:00', close: '21:00', isOpen: true },
      thursday:  { open: '08:00', close: '21:00', isOpen: true },
      friday:    { open: '08:00', close: '21:00', isOpen: true },
      saturday:  { open: '09:00', close: '18:00', isOpen: true },
      sunday:    { open: '10:00', close: '16:00', isOpen: true }
    }
  },
  // ─── within 3 km ────────────────────────────────────────────────────────────
  {
    name: 'QuickScript Pharmacy',
    licenseNumber: 'PH-NY-103',
    address: { street: '77 Pine Road', city: 'New York', state: 'NY', zipCode: '10003', country: 'USA' },
    location: { type: 'Point', coordinates: [-74.000, 40.7268] },
    phone: '+1 (555) 303-4252',
    email: 'service@quickscriptrx.com',
    features: ['Express Counter', 'Digital Rx', 'Loyalty Points'],
    rating: 4.6,
    verified: true,
    deliveryAvailable: false,
    deliveryRadius: 0,
    operatingHours: {
      monday:    { open: '07:00', close: '22:00', isOpen: true },
      tuesday:   { open: '07:00', close: '22:00', isOpen: true },
      wednesday: { open: '07:00', close: '22:00', isOpen: true },
      thursday:  { open: '07:00', close: '22:00', isOpen: true },
      friday:    { open: '07:00', close: '22:00', isOpen: true },
      saturday:  { open: '08:00', close: '20:00', isOpen: true },
      sunday:    { open: '09:00', close: '17:00', isOpen: true }
    }
  },
  {
    name: 'Wellness Rx Center',
    licenseNumber: 'PH-NY-104',
    address: { street: '23 Birch Lane', city: 'New York', state: 'NY', zipCode: '10014', country: 'USA' },
    location: { type: 'Point', coordinates: [-74.014, 40.6928] },
    phone: '+1 (555) 404-5363',
    email: 'hello@wellnessrx.com',
    features: ['Pharmacist Consult', 'Insurance Accepted'],
    rating: 4.3,
    verified: true,
    deliveryAvailable: false,
    deliveryRadius: 0,
    operatingHours: {
      monday:    { open: '09:00', close: '20:00', isOpen: true },
      tuesday:   { open: '09:00', close: '20:00', isOpen: true },
      wednesday: { open: '09:00', close: '20:00', isOpen: true },
      thursday:  { open: '09:00', close: '20:00', isOpen: true },
      friday:    { open: '09:00', close: '20:00', isOpen: true },
      saturday:  { open: '10:00', close: '18:00', isOpen: true },
      sunday:    { open: '10:00', close: '15:00', isOpen: true }
    }
  },
  {
    name: 'HealthHub Pharmacy',
    licenseNumber: 'PH-NY-105',
    address: { street: '5 Elm Boulevard', city: 'New York', state: 'NY', zipCode: '10003', country: 'USA' },
    location: { type: 'Point', coordinates: [-74.003, 40.7388] },
    phone: '+1 (555) 505-6474',
    email: 'care@healthhub.com',
    features: ['24/7 Open', 'Home Delivery', 'Compounding'],
    rating: 4.7,
    verified: true,
    deliveryAvailable: true,
    deliveryRadius: 8,
    operatingHours: {
      monday:    { open: '00:00', close: '23:59', isOpen: true },
      tuesday:   { open: '00:00', close: '23:59', isOpen: true },
      wednesday: { open: '00:00', close: '23:59', isOpen: true },
      thursday:  { open: '00:00', close: '23:59', isOpen: true },
      friday:    { open: '00:00', close: '23:59', isOpen: true },
      saturday:  { open: '00:00', close: '23:59', isOpen: true },
      sunday:    { open: '00:00', close: '23:59', isOpen: true }
    }
  },
  // ─── within 5 km ────────────────────────────────────────────────────────────
  {
    name: 'PharmaPlus Express',
    licenseNumber: 'PH-NY-106',
    address: { street: '110 Cedar Drive', city: 'New York', state: 'NY', zipCode: '10016', country: 'USA' },
    location: { type: 'Point', coordinates: [-74.016, 40.7438] },
    phone: '+1 (555) 606-7585',
    email: 'info@pharmaplusexpress.com',
    features: ['Drive-Through', 'Digital Rx'],
    rating: 4.4,
    verified: true,
    deliveryAvailable: false,
    deliveryRadius: 0,
    operatingHours: {
      monday:    { open: '08:00', close: '20:00', isOpen: true },
      tuesday:   { open: '08:00', close: '20:00', isOpen: true },
      wednesday: { open: '08:00', close: '20:00', isOpen: true },
      thursday:  { open: '08:00', close: '20:00', isOpen: true },
      friday:    { open: '08:00', close: '20:00', isOpen: true },
      saturday:  { open: '09:00', close: '17:00', isOpen: true },
      sunday:    { open: '00:00', close: '00:00', isOpen: false }
    }
  },
  {
    name: 'CareMed Pharmacy',
    licenseNumber: 'PH-NY-107',
    address: { street: '88 Walnut Street', city: 'New York', state: 'NY', zipCode: '10003', country: 'USA' },
    location: { type: 'Point', coordinates: [-74.003, 40.6708] },
    phone: '+1 (555) 707-8696',
    email: 'support@caremedrx.com',
    features: ['Insurance Accepted', 'Generic Meds', 'Loyalty Points'],
    rating: 4.2,
    verified: true,
    deliveryAvailable: false,
    deliveryRadius: 0,
    operatingHours: {
      monday:    { open: '09:00', close: '21:00', isOpen: true },
      tuesday:   { open: '09:00', close: '21:00', isOpen: true },
      wednesday: { open: '09:00', close: '21:00', isOpen: true },
      thursday:  { open: '09:00', close: '21:00', isOpen: true },
      friday:    { open: '09:00', close: '21:00', isOpen: true },
      saturday:  { open: '10:00', close: '18:00', isOpen: true },
      sunday:    { open: '11:00', close: '16:00', isOpen: true }
    }
  },
  // ─── within 10 km ───────────────────────────────────────────────────────────
  {
    name: 'MedExpress Pharmacy',
    licenseNumber: 'PH-NY-108',
    address: { street: '200 Spruce Ave', city: 'New York', state: 'NY', zipCode: '10996', country: 'USA' },
    location: { type: 'Point', coordinates: [-73.996, 40.7678] },
    phone: '+1 (555) 808-9707',
    email: 'info@medexpressrx.com',
    features: ['24/7 Open', 'Home Delivery', 'Digital Rx', 'Compounding'],
    rating: 4.6,
    verified: true,
    deliveryAvailable: true,
    deliveryRadius: 15,
    operatingHours: {
      monday:    { open: '00:00', close: '23:59', isOpen: true },
      tuesday:   { open: '00:00', close: '23:59', isOpen: true },
      wednesday: { open: '00:00', close: '23:59', isOpen: true },
      thursday:  { open: '00:00', close: '23:59', isOpen: true },
      friday:    { open: '00:00', close: '23:59', isOpen: true },
      saturday:  { open: '00:00', close: '23:59', isOpen: true },
      sunday:    { open: '00:00', close: '23:59', isOpen: true }
    }
  },
  {
    name: 'AllDay Pharmacy',
    licenseNumber: 'PH-NY-109',
    address: { street: '55 Poplar Road', city: 'New York', state: 'NY', zipCode: '10016', country: 'USA' },
    location: { type: 'Point', coordinates: [-74.016, 40.6388] },
    phone: '+1 (555) 909-0818',
    email: 'hello@alldaypharmacy.com',
    features: ['24/7 Open', 'Insurance Accepted'],
    rating: 4.1,
    verified: true,
    deliveryAvailable: false,
    deliveryRadius: 0,
    operatingHours: {
      monday:    { open: '00:00', close: '23:59', isOpen: true },
      tuesday:   { open: '00:00', close: '23:59', isOpen: true },
      wednesday: { open: '00:00', close: '23:59', isOpen: true },
      thursday:  { open: '00:00', close: '23:59', isOpen: true },
      friday:    { open: '00:00', close: '23:59', isOpen: true },
      saturday:  { open: '00:00', close: '23:59', isOpen: true },
      sunday:    { open: '00:00', close: '23:59', isOpen: true }
    }
  },
  {
    name: 'Premier Health Rx',
    licenseNumber: 'PH-NY-110',
    address: { street: '301 Ash Court', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
    location: { type: 'Point', coordinates: [-74.001, 40.7978] },
    phone: '+1 (555) 010-1929',
    email: 'info@premierhealthrx.com',
    features: ['Pharmacist Consult', 'Compounding', 'Digital Rx', 'Home Delivery'],
    rating: 4.9,
    verified: true,
    deliveryAvailable: true,
    deliveryRadius: 12,
    operatingHours: {
      monday:    { open: '08:00', close: '22:00', isOpen: true },
      tuesday:   { open: '08:00', close: '22:00', isOpen: true },
      wednesday: { open: '08:00', close: '22:00', isOpen: true },
      thursday:  { open: '08:00', close: '22:00', isOpen: true },
      friday:    { open: '08:00', close: '22:00', isOpen: true },
      saturday:  { open: '09:00', close: '20:00', isOpen: true },
      sunday:    { open: '10:00', close: '18:00', isOpen: true }
    }
  }
];

// Seeder functions
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Hospital.deleteMany({});
    await Medicine.deleteMany({});
    await Pharmacy.deleteMany({});
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    console.log('✅ Data cleared');

    // Seed hospitals
    console.log('🏥 Seeding hospitals...');
    const createdHospitals = await Hospital.insertMany(hospitals);
    console.log(`✅ Created ${createdHospitals.length} hospitals`);

    // Seed medicines
    console.log('💊 Seeding medicines...');
    const createdMedicines = await Medicine.insertMany(medicines);
    console.log(`✅ Created ${createdMedicines.length} medicines`);

    // Seed pharmacies
    console.log('🏪 Seeding pharmacies...');
    const createdPharmacies = await Pharmacy.insertMany(pharmacies);
    console.log(`✅ Created ${createdPharmacies.length} pharmacies`);

    // Create demo users
    console.log('👥 Creating demo users...');
    
    // Demo Doctor
    const doctorUser = await User.create({
      email: 'doctor@demo.com',
      password: 'demo123',
      role: 'doctor',
      phone: '+1-212-555-6000'
    });
    
    await Doctor.create({
      userId: doctorUser._id,
      hospitalId: createdHospitals[0]._id,
      firstName: 'Sarah',
      lastName: 'Johnson',
      specialty: 'General Physician',
      qualification: 'MD, MBBS',
      licenseNumber: 'DOC-NY-001',
      experience: 10
    });
    console.log('✅ Created demo doctor: doctor@demo.com / demo123');

    // Demo Patient
    const patientUser = await User.create({
      email: 'patient@demo.com',
      password: 'demo123',
      role: 'patient',
      phone: '+1-212-555-7000'
    });
    
    await Patient.create({
      userId: patientUser._id,
      hospitalId: createdHospitals[0]._id,
      patientId: 'PT001',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-15'),
      gender: 'Male',
      bloodGroup: 'O+'
    });
    console.log('✅ Created demo patient: patient@demo.com / demo123');

    // Demo Pharmacy
    const pharmacyUser = await User.create({
      email: 'pharmacy@demo.com',
      password: 'demo123',
      role: 'pharmacy',
      phone: '+1-212-555-8000'
    });
    
    await Pharmacy.findByIdAndUpdate(
      createdPharmacies[0]._id,
      { userId: pharmacyUser._id }
    );
    console.log('✅ Created demo pharmacy: pharmacy@demo.com / demo123');

    // Demo Admin
    await User.create({
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1-212-555-9000'
    });
    console.log('✅ Created demo admin: admin@demo.com / admin123');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log('   Doctor:   doctor@demo.com   / demo123');
    console.log('   Patient:  patient@demo.com  / demo123');
    console.log('   Pharmacy: pharmacy@demo.com / demo123');
    console.log('   Admin:    admin@demo.com    / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
