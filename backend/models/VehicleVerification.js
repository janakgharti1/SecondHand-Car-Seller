const mongoose = require('mongoose');

const VehicleVerificationSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true },
  chassisNumber: { type: String, required: true },
  engineNumber: { type: String, required: true },
  registrationDate: { type: Date, required: true },
  insuranceStatus: { type: String, enum: ['valid', 'expired', 'none'], required: true },
  ownershipHistory: { type: String, required: true },
  documentImages: [String], // URLs of uploaded images
  selfieWithCar: String, // URL of uploaded selfie
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' }, // Reference to car details
  userId: { type: String, required: true } // Firebase user ID
}, { timestamps: true });

module.exports = mongoose.model('VehicleVerification', VehicleVerificationSchema);
