const Car = require("../models/Cars");

// Add a new car
const addCar = async (req, res) => {
  try {
    const { body, files } = req;
    const featuredImage = files.featuredImage ? files.featuredImage[0].filename : null;
    const gallery = files.gallery ? files.gallery.map((file) => file.filename) : [];

    if (gallery.length < 2) {
      return res.status(400).json({ message: "At least 2 gallery images are required." });
    }

    const userId = req.user.uid; // Fetch Firebase UID from request

    const car = new Car({
      userId,
      ...body,
      featuredImage,
      gallery,
    });

    await car.save();
    res.status(201).json({ message: "Car details uploaded successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error uploading car details." });
  }
};

// Get cars for the authenticated user
const getUserCars = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userCars = await Car.find({ userId });
    res.status(200).json(userCars);
  } catch (error) {
    console.error("Error fetching user cars:", error);
    res.status(500).json({ message: "Failed to fetch user cars." });
  }
};

// Get all cars (for admins, testing, etc.)
const getAllCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ message: "Failed to fetch cars" });
  }
};

module.exports = { addCar, getUserCars, getAllCars };
