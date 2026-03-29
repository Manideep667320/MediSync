require('dotenv').config();
const mongoose = require('mongoose');

const Pharmacy = require('./models/Pharmacy');
const PharmacyInventory = require('./models/PharmacyInventory');

async function testCreate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const pharmacy = await Pharmacy.findOne();
        const inventoryData = {
            medicine: 'Test Medicine ' + Date.now(),
            stock: 10,
            price: 5.99,
            pharmacyId: pharmacy._id
        };

        const inventory = await PharmacyInventory.create(inventoryData);
        console.log('Successfully created');

        process.exit(0);
    } catch (error) {
        console.log('=== ERROR MESSAGE ===');
        console.log(error.message);
        if (error.errors) {
            console.log('=== VALIDATION ERRORS ===');
            console.log(Object.keys(error.errors).map(k => error.errors[k].message));
        }
        process.exit(1);
    }
}

testCreate();
