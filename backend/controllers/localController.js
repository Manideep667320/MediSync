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
    const reqMedicines = medicines || [];
    const pharmaciesWithDetails = pharmacies.map(pharmacy => {
      const lon = pharmacy.location.coordinates[0];
      const lat = pharmacy.location.coordinates[1];
      const distance = calculateDistance(
        latitude,
        longitude,
        lat,
        lon
      );

      // Check Real Inventory
      let availableCount = 0;
      let totalPrice = 0;
      const pharmacyInventory = pharmacy.inventory || [];

      const availabilityDetails = reqMedicines.map(reqMed => {
        const inStockMatch = pharmacyInventory.find(inv =>
          inv.medicineName.toLowerCase() === reqMed.medicineName.toLowerCase() &&
          inv.stock >= (reqMed.quantity || 1)
        );

        if (inStockMatch) {
          availableCount++;
          totalPrice += inStockMatch.price * (reqMed.quantity || 1);
          return { ...reqMed, available: true, price: inStockMatch.price };
        }
        return { ...reqMed, available: false, price: 0 };
      });

      let availabilityStatus = 'none_available';
      if (reqMedicines.length > 0) {
        if (availableCount === reqMedicines.length) availabilityStatus = 'all_available';
        else if (availableCount > 0) availabilityStatus = 'partial_available';
      } else {
        availabilityStatus = 'all_available'; // If no specific meds requested, show nearby
      }

      return {
        id: pharmacy._id,
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        distance: parseFloat(distance.toFixed(1)),
        rating: pharmacy.rating,
        features: pharmacy.features,
        deliveryAvailable: pharmacy.deliveryAvailable,
        availabilityStatus,
        availableMedicinesCount: availableCount,
        totalRequestedMedicines: reqMedicines.length,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        estimatedTime: 20 + Math.floor(Math.random() * 20) // Simple distance/prep time calc
      };
    });

    // Filter out pharmacies with 0 matches if medicines were requested
    const validPharmacies = reqMedicines.length > 0
      ? pharmaciesWithDetails.filter(p => p.availableMedicinesCount > 0)
      : pharmaciesWithDetails;

    // Sort: All Available first, then by distance
    validPharmacies.sort((a, b) => {
      if (a.availabilityStatus === 'all_available' && b.availabilityStatus !== 'all_available') return -1;
      if (b.availabilityStatus === 'all_available' && a.availabilityStatus !== 'all_available') return 1;
      return a.distance - b.distance;
    });

    res.json({
      success: true,
      data: validPharmacies
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
