const mongoose = require('mongoose');
const Pharmacy = require('./models/Pharmacy');
const PharmacyInventory = require('./models/PharmacyInventory');
require('dotenv').config();

const seedPharmacies = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medisync');
        console.log('Connected to MongoDB');

        // Clear existing pharmacies primarily for clean testing
        await Pharmacy.deleteMany({});
        await PharmacyInventory.deleteMany({});
        console.log('Cleared existing pharmacies and inventories');

        const pharmacies = [
            {
                name: "CityCare Pharmacy - Jubilee Hills",
                licenseNumber: "PH-JH-1001",
                address: { street: "Road No. 36", city: "Hyderabad", state: "TS", zipCode: "500033" },
                location: { type: "Point", coordinates: [78.4042, 17.4326] }, // Longitude, Latitude
                latitude: 17.4326,
                longitude: 78.4042,
                phone: "9876543210",
                rating: 4.8,
                deliveryAvailable: true,
                inventory: [
                    { medicineName: "Amoxicillin", stock: 100, price: 15.50 },
                    { medicineName: "Paracetamol", stock: 50, price: 5.00 },
                    { medicineName: "Cough Syrup", stock: 20, price: 45.00 }
                ]
            },
            {
                name: "Wellness Meds - Banjara Hills",
                licenseNumber: "PH-BH-2002",
                address: { street: "Road No. 1", city: "Hyderabad", state: "TS", zipCode: "500034" },
                location: { type: "Point", coordinates: [78.4483, 17.4156] }, // Longitude, Latitude
                latitude: 17.4156,
                longitude: 78.4483,
                phone: "9876543211",
                rating: 4.6,
                deliveryAvailable: true,
                inventory: [
                    { medicineName: "Paracetamol", stock: 200, price: 4.50 },
                    // Missing Amoxicillin
                    { medicineName: "Cetirizine", stock: 100, price: 8.00 }
                ]
            },
            {
                name: "FarAway Pharmacy",
                licenseNumber: "PH-FA-3003",
                address: { street: "Kukatpally", city: "Hyderabad", state: "TS", zipCode: "500072" },
                location: { type: "Point", coordinates: [78.4011, 17.4843] }, // Far away
                latitude: 17.4843,
                longitude: 78.4011,
                phone: "9876543212",
                rating: 4.2,
                deliveryAvailable: false,
                inventory: [
                    { medicineName: "Amoxicillin", stock: 500, price: 12.00 },
                    { medicineName: "Paracetamol", stock: 300, price: 4.00 }
                ]
            }
        ];

        const createdPharmacies = await Pharmacy.insertMany(pharmacies);
        console.log('Seeded 3 test pharmacies successfully!');

        // Seed pharmacy inventories
        console.log('Seeding pharmacy inventories...');
        for (const created of createdPharmacies) {
          const orig = pharmacies.find(p => p.licenseNumber === created.licenseNumber);
          if (orig && orig.inventory) {
            const invDocs = orig.inventory.map(item => ({
              pharmacyId: created._id,
              medicine: item.medicineName,
              stock: item.stock,
              price: item.price,
              isAvailable: item.stock > 0
            }));
            await PharmacyInventory.insertMany(invDocs);
          }
        }
        console.log('Pharmacy inventories seeded successfully!');

        // Create geolocation index just in case
        await Pharmacy.collection.createIndex({ location: "2dsphere" });
        console.log('Ensured 2dsphere index exists.');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedPharmacies();
