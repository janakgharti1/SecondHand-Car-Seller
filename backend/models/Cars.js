const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  carID: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Uses MongoDB’s ObjectId
  userId: { type: String, required: true }, // Store Firebase UID to link with the user
  brand: String,
  carType: String,
  transmission: String,
  fuelType: String,
  carYear: Number,
  ownership: String,
  carName: String,
  kmsDriven: Number,
  price: Number,
  location: String,
  engine: String,
  description: String,
  featuredImage: String,
  gallery: [String],
}, { timestamps: true });

const Car = mongoose.model("Car", carSchema);
module.exports = Car;
