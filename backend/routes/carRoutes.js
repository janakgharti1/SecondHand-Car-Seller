const express = require("express");
const multer = require("multer");
const { addCar, getUserCars, getAllCars } = require("../controllers/carControllers");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Routes
router.post(
  "/cars",
  authenticateUser,
  upload.fields([{ name: "featuredImage", maxCount: 1 }, { name: "gallery", maxCount: 8 }]),
  addCar
);

router.get("/cars/user", authenticateUser, getUserCars); // Fetch authenticated user's cars

router.get("/cars", getAllCars); // Fetch all cars (testing or admin)

module.exports = router;
