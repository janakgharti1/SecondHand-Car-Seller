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

const deleteCar = async (req, res) => {
  try {
    const carId = req.params.id;
    const deletedCar = await Car.findByIdAndDelete(carId);

    if (!deletedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error("Error deleting car:", error);
    res.status(500).json({ message: "Failed to delete car" });
  }
};

const updateCar = async (req, res) => {
  try {
    const carId = req.params.id;
    const { body, files } = req;
    const featuredImage = files?.featuredImage ? files.featuredImage[0].filename : null;
    const gallery = files?.gallery ? files.gallery.map((file) => file.filename) : [];

    const updatedCarData = { ...body };
    
    if (featuredImage) updatedCarData.featuredImage = featuredImage;
    if (gallery.length > 0) updatedCarData.gallery = gallery;

    const updatedCar = await Car.findByIdAndUpdate(carId, updatedCarData, { new: true });

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json({ message: "Car updated successfully", updatedCar });
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ message: "Failed to update car" });
  }
};

// Get a single car by ID
const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Compare two cars
const compareCars = async (req, res) => {
  try {
    const { car1, car2 } = req.query;

    if (!car1 || !car2) {
      return res.status(400).json({ message: "Please provide two car IDs for comparison." });
    }

    // Fetch the cars from the database
    const cars = await Car.find({ _id: { $in: [car1, car2] } });

    if (cars.length !== 2) {
      return res.status(404).json({ message: "One or both cars not found." });
    }

    // Structure the response with key attributes for comparison
    const [firstCar, secondCar] = cars;
    const comparison = {
      car1: {
        id: firstCar._id,
        name: firstCar.name,
        price: firstCar.price,
        brand: firstCar.brand,
        model: firstCar.model,
        year: firstCar.year,
        mileage: firstCar.mileage,
        fuelType: firstCar.fuelType,
        transmission: firstCar.transmission,
        engine: firstCar.engine,
        horsepower: firstCar.horsepower,
        featuredImage: firstCar.featuredImage,
      },
      car2: {
        id: secondCar._id,
        name: secondCar.name,
        price: secondCar.price,
        brand: secondCar.brand,
        model: secondCar.model,
        year: secondCar.year,
        mileage: secondCar.mileage,
        fuelType: secondCar.fuelType,
        transmission: secondCar.transmission,
        engine: secondCar.engine,
        horsepower: secondCar.horsepower,
        featuredImage: secondCar.featuredImage,
      },
    };

    res.status(200).json(comparison);
  } catch (error) {
    console.error("Error comparing cars:", error);
    res.status(500).json({ message: "Error comparing cars.", error: error.message });
  }
};

module.exports = { addCar, getUserCars, getAllCars, deleteCar, updateCar, getCarById, compareCars};
