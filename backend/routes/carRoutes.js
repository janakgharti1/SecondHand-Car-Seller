const express = require("express");
const multer = require("multer");
const { addCar } = require("../controllers/carControllers");

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route to add a new car
router.post(
  "/cars",
  upload.fields([{ name: "featuredImage", maxCount: 1 }, { name: "gallery", maxCount: 8 }]),
  addCar
);

module.exports = router;
