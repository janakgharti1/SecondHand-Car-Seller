const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
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
});

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
