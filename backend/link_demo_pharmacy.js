require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Pharmacy = require('./models/Pharmacy');

async function linkDemoPharmacy() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find the demo pharmacy user
        const user = await User.findOne({ email: 'pharmacy@demo.com' });
        if (!user) {
            console.log('User pharmacy@demo.com not found. Please register first.');
            process.exit(1);
        }

        // See if they already have a profile
        let profile = await Pharmacy.findOne({ userId: user._id });
        if (profile) {
            console.log('Pharmacy profile is already linked directly to this user!');
            process.exit(0);
        }

        // If no specific profile exists for the user, grab the first seeded pharmacy without a user and link it
        profile = await Pharmacy.findOne({ userId: { $exists: false } });

        if (!profile) {
            // If all existing pharmacies have users (or there are none), create a new one for this user
            console.log('No unassigned pharmacies found, creating a new profile for demo user...');
            profile = await Pharmacy.create({
                userId: user._id,
                name: 'Demo Health Pharmacy',
                licenseNumber: 'DEMO-PH-100',
                address: {
                    street: '123 Test Street',
                    city: 'Test City',
                },
                location: {
                    type: 'Point',
                    coordinates: [0, 0]
                },
                phone: '123-456-7890',
                email: 'pharmacy@demo.com'
            });
            console.log('Newly created and linked Pharmacy profile:', profile.name);
        } else {
            profile.userId = user._id;
            await profile.save();
            console.log('Linked existing Pharmacy profile:', profile.name, 'to user', user.email);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error linking pharmacy:', error);
        process.exit(1);
    }
}

linkDemoPharmacy();
