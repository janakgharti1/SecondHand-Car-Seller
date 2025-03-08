const express = require('express');
const multer = require('multer');
const admin = require("firebase-admin");
const { addVerification, getUserVerifications } = require('../controllers/verificationController');

const router = express.Router();

// Set up Multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Middleware to verify Firebase token
async function verifyToken(req, res, next) {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = req.headers.authorization.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = { uid: decodedToken.uid };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// Save Vehicle Verification Data
router.post('/', verifyToken, upload.fields([{ name: 'documentImages' }, { name: 'selfieWithCar', maxCount: 1 }]), addVerification);

// Get user verifications
router.get('/', verifyToken, getUserVerifications);

module.exports = router;
