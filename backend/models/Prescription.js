const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  patientId: String,
  doctorId: String,
  items: [
    {
      medicine: String,
      dosage: String,
      frequency: String,
      duration: String
    }
  ],
  status: {
    type: String,
    enum: ["PENDING", "SENT", "READY"],
    default: "PENDING"
  }
}, { timestamps: true });

module.exports = mongoose.model("Prescription", prescriptionSchema);
