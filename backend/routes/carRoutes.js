const express = require("express");
const multer = require("multer");
const { addCar, getUserCars, getAllCars, deleteCar, updateCar, getCarById, compareCars } = require("../controllers/carControllers");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf/;
    const extname = fileTypes.test(file.originalname.toLowerCase().split('.').pop());
    if (extname) return cb(null, true);
    cb(new Error("Only images (JPEG, JPG, PNG) and PDFs allowed"));
  },
});

const uploadFields = upload.fields([
  { name: "featuredImage", maxCount: 1 },
  { name: "gallery", maxCount: 8 },
  { name: "picWithCar", maxCount: 1 },
  { name: "verificationDoc", maxCount: 1 },
]);

router.post("/cars", authenticateUser, uploadFields, addCar);
router.get("/cars/user", authenticateUser, getUserCars);
router.get("/cars", getAllCars);
router.delete("/cars/:id", authenticateUser, deleteCar);
router.put("/cars/:id", authenticateUser, uploadFields, updateCar);
router.get("/cars/:id", getCarById);
router.get("/cars/compare", compareCars);

module.exports = router;