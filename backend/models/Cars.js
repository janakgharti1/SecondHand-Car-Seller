const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  brand: { type: String, required: true },
  carType: { type: String, required: true },
  transmission: { type: String, required: true },
  fuelType: { type: String, required: true },
  carYear: { type: Number, required: true, min: 1990, max: new Date().getFullYear() },
  ownership: { type: String, required: true },
  carName: { type: String, required: true },
  kmsDriven: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 1000 },
  location: { type: String, required: true },
  engine: { type: String, required: true },
  description: { type: String, required: true },
  featuredImage: { type: String, required: true },
  gallery: { type: [String], required: true, validate: [arr => arr.length >= 2, "At least 2 gallery images required."] },
  picWithCar: { type: String, required: true },
  vin: { type: String, required: true }, // Removed match constraint since frontend handles it
  registrationNumber: { type: String, required: true },
  insuranceStatus: { type: String, required: true, enum: ["Active", "Expired", "Not Insured"] },
  verificationDoc: { type: String },
}, { timestamps: true });

const Car = mongoose.model("Car", carSchema);
module.exports = Car;