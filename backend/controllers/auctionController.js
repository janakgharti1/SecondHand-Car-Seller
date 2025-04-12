const Auction = require('../models/Auction');
const path = require('path');

exports.createAuction = async (req, res) => {
  try {
    const formData = req.body;
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    // Calculate end time based on duration (in days)
    const durationInDays = parseInt(formData.duration);
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + durationInDays);

    const newAuction = new Auction({
      ...formData,
      images,
      endTime,
      currentBid: formData.startingBid,
      status: 'active', // Start as active
    });

    const savedAuction = await newAuction.save();
    res.status(201).json({
      message: 'Auction created successfully',
      auction: savedAuction,
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error creating auction',
      details: error.message,
    });
  }
};

exports.getAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find();
    res.status(200).json(auctions);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error fetching auctions',
      details: error.message,
    });
  }
};

exports.getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    res.status(200).json(auction);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error fetching auction',
      details: error.message,
    });
  }
};

exports.placeBid = async (req, res) => {
  try {
    const { amount, user } = req.body;
    const auction = await Auction.findById(req.params.id);

    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.status !== 'active') return res.status(400).json({ message: 'Auction is not active' });
    if (amount <= auction.currentBid) return res.status(400).json({ message: 'Bid must be higher than current bid' });

    auction.currentBid = amount;
    auction.highestBidder = user;
    auction.bids.push({ user, amount });
    await auction.save();

    res.status(200).json({
      message: 'Bid placed successfully',
      auction,
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error placing bid',
      details: error.message,
    });
  }
};

exports.buyNow = async (req, res) => {
  try {
    const { user } = req.body;
    const auction = await Auction.findById(req.params.id);

    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.status !== 'active') return res.status(400).json({ message: 'Auction is not active' });

    auction.status = 'completed';
    auction.highestBidder = user;
    await auction.save();

    res.status(200).json({
      message: 'Car purchased successfully',
      auction,
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error processing buy now',
      details: error.message,
    });
  }
};