const Car = require("../models/Cars");

// Add a new car
const addCar = async (req, res) => {
  try {
    const { body, files } = req;
    const userId = req.user.uid;

    const featuredImage = files.featuredImage ? files.featuredImage[0].filename : null;
    const gallery = files.gallery ? files.gallery.map((file) => file.filename) : [];
    const picWithCar = files.picWithCar ? files.picWithCar[0].filename : null;
    const verificationDoc = files.verificationDoc ? files.verificationDoc[0].filename : null;

    // Validation for required fields (excluding VIN length check)
    if (!body.brand || !body.carType || !body.transmission || !body.fuelType || 
        !body.carYear || !body.ownership || !body.carName || !body.kmsDriven || 
        !body.price || !body.location || !body.engine || !body.description || 
        !featuredImage || !picWithCar || !body.vin || !body.registrationNumber || 
        !body.insuranceStatus) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    if (gallery.length < 2) {
      return res.status(400).json({ message: "At least 2 gallery images are required." });
    }

    const car = new Car({
      userId,
      ...body,
      featuredImage,
      gallery,
      picWithCar,
      verificationDoc,
    });

    await car.save();
    res.status(201).json({ message: "Car details uploaded successfully!", carId: car._id });
  } catch (err) {
    console.error("Error adding car:", err);
    res.status(500).json({ message: "Error uploading car details.", error: err.message });
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
    res.status(500).json({ message: "Failed to fetch user cars.", error: error.message });
  }
};

// Get all cars (for admins or testing)
const getAllCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ message: "Failed to fetch cars.", error: error.message });
  }
};

// Delete a car
const deleteCar = async (req, res) => {
  try {
    const carId = req.params.id;
    const userId = req.user.uid;

    const car = await Car.findOne({ _id: carId, userId });
    if (!car) {
      return res.status(404).json({ message: "Car not found or not owned by user." });
    }

    await Car.findByIdAndDelete(carId);
    res.status(200).json({ message: "Car deleted successfully." });
  } catch (error) {
    console.error("Error deleting car:", error);
    res.status(500).json({ message: "Failed to delete car.", error: error.message });
  }
};

// Update a car
const updateCar = async (req, res) => {
  try {
    const carId = req.params.id;
    const { body, files } = req;
    const userId = req.user.uid;

    const car = await Car.findOne({ _id: carId, userId });
    if (!car) {
      return res.status(404).json({ message: "Car not found or not owned by user." });
    }

    const updatedCarData = { ...body };
    if (files.featuredImage) updatedCarData.featuredImage = files.featuredImage[0].filename;
    if (files.gallery) updatedCarData.gallery = files.gallery.map((file) => file.filename);
    if (files.picWithCar) updatedCarData.picWithCar = files.picWithCar[0].filename;
    if (files.verificationDoc) updatedCarData.verificationDoc = files.verificationDoc[0].filename;

    const updatedCar = await Car.findByIdAndUpdate(carId, updatedCarData, { new: true });
    res.status(200).json({ message: "Car updated successfully.", car: updatedCar });
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ message: "Failed to update car.", error: error.message });
  }
};

// Get a single car by ID
const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Car not found." });
    }
    res.status(200).json(car);
  } catch (error) {
    console.error("Error fetching car:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Compare two cars
const compareCars = async (req, res) => {
  try {
    const { car1, car2 } = req.query;

    if (!car1 || !car2) {
      return res.status(400).json({ message: "Please provide two car IDs for comparison." });
    }

    const cars = await Car.find({ _id: { $in: [car1, car2] } });
    if (cars.length !== 2) {
      return res.status(404).json({ message: "One or both cars not found." });
    }

    const [firstCar, secondCar] = cars;
    const comparison = {
      car1: {
        id: firstCar._id,
        carName: firstCar.carName,
        price: firstCar.price,
        brand: firstCar.brand,
        carType: firstCar.carType,
        carYear: firstCar.carYear,
        kmsDriven: firstCar.kmsDriven,
        fuelType: firstCar.fuelType,
        transmission: firstCar.transmission,
        engine: firstCar.engine,
        featuredImage: firstCar.featuredImage,
      },
      car2: {
        id: secondCar._id,
        carName: secondCar.carName,
        price: secondCar.price,
        brand: secondCar.brand,
        carType: secondCar.carType,
        carYear: secondCar.carYear,
        kmsDriven: secondCar.kmsDriven,
        fuelType: secondCar.fuelType,
        transmission: secondCar.transmission,
        engine: secondCar.engine,
        featuredImage: secondCar.featuredImage,
      },
    };

    res.status(200).json(comparison);
  } catch (error) {
    console.error("Error comparing cars:", error);
    res.status(500).json({ message: "Error comparing cars.", error: error.message });
  }
};

module.exports = { addCar, getUserCars, getAllCars, deleteCar, updateCar, getCarById, compareCars };