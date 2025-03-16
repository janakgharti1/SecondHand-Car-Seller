const Auction = require('../models/Auction');

exports.createAuction = async (req, res) => {
  try {
    const formData = req.body;
    
    // Here you would handle image uploads with something like multer
    // For now, we'll assume images are base64 strings or URLs
    const newAuction = new Auction({
      ...formData,
      images: formData.images || []
    });

    const savedAuction = await newAuction.save();
    
    res.status(201).json({
      message: 'Auction created successfully',
      auction: savedAuction
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error creating auction',
      details: error.message 
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
      details: error.message 
    });
  }
};