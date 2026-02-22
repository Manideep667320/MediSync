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
  {
    name: 'HealthPlus Pharmacy',
    licenseNumber: 'PH-NY-001',
    address: {
      street: '100 Broadway',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.730610]
    },
    phone: '+1-212-555-3000',
    email: 'info@healthpluspharmacy.com',
    features: ['24/7 Open', 'Home Delivery', 'Verified'],
    rating: 4.7,
    verified: true,
    deliveryAvailable: true,
    deliveryRadius: 10
  },
  {
    name: 'CareWell Medical Store',
    licenseNumber: 'PH-NY-002',
    address: {
      street: '200 5th Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'USA'
    },
    location: {
      type: 'Point',
      coordinates: [-73.985242, 40.748817]
    },
    phone: '+1-212-555-4000',
    email: 'contact@carewellstore.com',
    features: ['Insurance Accepted', 'Verified'],
    rating: 4.5,
    verified: true,
    deliveryAvailable: true,
    deliveryRadius: 5
  },
  {
    name: 'MediQuick Pharmacy',
    licenseNumber: 'PH-NY-003',
    address: {
      street: '300 Park Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10003',
      country: 'USA'
    },
    location: {
      type: 'Point',
      coordinates: [-73.975242, 40.758817]
    },
    phone: '+1-212-555-5000',
    email: 'service@mediquick.com',
    features: ['Home Delivery', 'Insurance Accepted'],
    rating: 4.8,
    verified: true,
    deliveryAvailable: true,
    deliveryRadius: 8
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
