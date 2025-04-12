const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  mileage: { type: Number, required: true },
  vinNumber: { type: String },
  description: { type: String, required: true },
  condition: { 
    type: String, 
    enum: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'], 
    default: 'Good' 
  },
  startingBid: { type: Number, required: true },
  reservePrice: { type: Number },
  buyNowPrice: { type: Number },
  duration: { type: Number, required: true }, // Duration in days
  endTime: { type: Date }, // Calculated end time
  location: { type: String, required: true },
  images: [{ type: String }], // File paths of uploaded images
  createdAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'completed'], 
    default: 'pending' 
  },
  currentBid: { type: Number, default: 0 },
  highestBidder: { type: String },
  bids: [{
    user: String,
    amount: Number,
    time: { type: Date, default: Date.now },
  }],
});

module.exports = mongoose.model('Auction', auctionSchema);