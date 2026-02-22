const Pharmacy = require('../models/Pharmacy');
const Prescription = require('../models/Prescription');

// Upload and process prescription image (OCR simulation)
exports.uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Simulate OCR processing (in production, integrate with OCR service)
    const mockExtractedData = {
      patientName: 'John Doe',
      patientAge: 34,
      patientGender: 'Male',
      diagnosis: 'Upper Respiratory Tract Infection',
      symptoms: 'Fever, cough, sore throat',
      medicines: [
        {
          medicineName: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'Three times daily',
          duration: '7 days',
          quantity: 21,
          instructions: 'Take after meals with water'
        },
        {
          medicineName: 'Paracetamol',
          dosage: '650mg',
          frequency: 'As needed for fever',
          duration: '5 days',
          quantity: 20,
          instructions: 'Maximum 4 times per day'
        }
      ],
      doctorNotes: 'Rest and stay hydrated. Avoid cold drinks.',
      date: new Date().toISOString().split('T')[0]
    };

    res.json({
      success: true,
      message: 'Prescription processed successfully',
      data: {
        prescription: mockExtractedData,
        imageUrl: `/uploads/prescriptions/${req.file.filename}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Find nearby pharmacies
exports.findNearbyPharmacies = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5, medicines } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Find pharmacies within radius (in kilometers)
    const pharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      },
      isActive: true
    }).limit(20);

    // Calculate distance and add availability info
    const pharmaciesWithDetails = pharmacies.map(pharmacy => {
      const [lon, lat] = pharmacy.location.coordinates;
      const distance = calculateDistance(
        latitude,
        longitude,
        lat,
        lon
      );

      // Mock availability and pricing (in production, check actual inventory)
      const allAvailable = Math.random() > 0.3;
      const basePrice = 25 + Math.random() * 40;

      return {
        id: pharmacy._id,
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        distance: parseFloat(distance.toFixed(1)),
        rating: pharmacy.rating,
        features: pharmacy.features,
        deliveryAvailable: pharmacy.deliveryAvailable,
        availabilityStatus: allAvailable ? 'all_available' : 'partial_available',
        totalPrice: allAvailable ? parseFloat(basePrice.toFixed(2)) : 0,
        estimatedTime: 20 + Math.floor(Math.random() * 20)
      };
    });

    // Sort by distance
    pharmaciesWithDetails.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      data: pharmaciesWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

// Save digital prescription (for local users)
exports.savePrescription = async (req, res) => {
  try {
    const prescriptionData = {
      ...req.body,
      isDigital: true,
      status: 'active'
    };

    // For local users without doctor, create a simplified prescription
    const prescription = await Prescription.create(prescriptionData);

    res.status(201).json({
      success: true,
      message: 'Prescription saved successfully',
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get prescription details (public access for local users)
exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
