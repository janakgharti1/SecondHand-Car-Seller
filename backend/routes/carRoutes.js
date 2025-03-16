const express = require("express");
const multer = require("multer");
const { addCar, getUserCars, getAllCars, deleteCar, updateCar, getCarById, compareCars } = require("../controllers/carControllers");
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

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf/;
    const extname = fileTypes.test(file.originalname.toLowerCase().split('.').pop());
    if (extname) return cb(null, true);
    cb(new Error("Only images (JPEG, JPG, PNG) and PDFs are allowed."));
  },
});

// Routes
router.post(
  "/cars",
  authenticateUser,
  upload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "gallery", maxCount: 8 },
    { name: "picWithCar", maxCount: 1 },
    { name: "verificationDoc", maxCount: 1 },
  ]),
  addCar
);

router.get("/cars/user", authenticateUser, getUserCars);
router.get("/cars", getAllCars);
router.delete("/cars/:id", authenticateUser, deleteCar);
router.put(
  "/cars/:id",
  authenticateUser,
  upload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "gallery", maxCount: 8 },
    { name: "picWithCar", maxCount: 1 },
    { name: "verificationDoc", maxCount: 1 },
  ]),
  updateCar
);
router.get("/cars/:id", getCarById);
router.get("/cars/compare", compareCars);

module.exports = router;