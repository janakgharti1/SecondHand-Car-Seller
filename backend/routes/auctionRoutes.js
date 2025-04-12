const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (JPEG, PNG, WebP) are allowed'));
  },
});

// Routes
router.post('/auctions', upload.array('images', 20), auctionController.createAuction);
router.get('/auctions', auctionController.getAuctions);
router.get('/auctions/:id', auctionController.getAuctionById);
router.post('/auctions/:id/bid', auctionController.placeBid);
router.post('/auctions/:id/buy-now', auctionController.buyNow);

module.exports = router;