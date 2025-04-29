const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Firebase UID
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
}, { timestamps: true });

favoriteSchema.index({ userId: 1, carId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);