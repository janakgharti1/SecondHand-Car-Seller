const Car = require("../models/Cars");

const addCar = async (req, res) => {
  try {
    const { body, files } = req;
    
    const featuredImage = files.featuredImage ? files.featuredImage[0].filename : null;
    const gallery = files.gallery ? files.gallery.map(file => file.filename) : [];
    const picWithCar = files.picWithCar ? files.picWithCar[0].filename : null;
    const verificationDoc = files.verificationDoc ? files.verificationDoc[0].filename : null;

    const finalBrand = body.brand === "Other" ? body.customBrand : body.brand;
    const finalCarType = body.carType === "Other" ? body.customCarType : body.carType;
    const finalLocation = body.location === "Other" ? body.customLocation : body.location;

    if (!finalBrand || !finalCarType || !finalLocation || !body.transmission || !body.fuelType ||
        !body.carYear || !body.ownership || !body.carName || !body.kmsDriven || !body.price ||
        !body.engine || !body.description || !featuredImage || gallery.length < 2 || !picWithCar ||
        !body.vin || !body.registrationNumber || !body.insuranceStatus) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    if (body.agreementAccepted !== "true") {
      return res.status(400).json({ message: "You must agree to the commission terms" });
    }

    const car = new Car({
      userId: req.user.uid,
      brand: finalBrand,
      carType: finalCarType,
      transmission: body.transmission,
      fuelType: body.fuelType,
      carYear: Number(body.carYear),
      ownership: body.ownership,
      carName: body.carName,
      kmsDriven: Number(body.kmsDriven),
      price: Number(body.price),
      location: finalLocation,
      engine: body.engine,
      description: body.description,
      featuredImage,
      gallery,
      picWithCar,
      vin: body.vin,
      registrationNumber: body.registrationNumber,
      insuranceStatus: body.insuranceStatus,
      verificationDoc,
      agreementAccepted: true,
      status: "pending", // Explicitly set status, though schema default works too
    });

    const savedCar = await car.save();
    res.status(201).json({ message: "Car listed successfully", car: savedCar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error listing car", error: err.message });
  }
};

const getUserCars = async (req, res) => {
  try {
    const cars = await Car.find({ userId: req.user.uid });
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user cars", error: error.message });
  }
};

const getAllCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cars", error: error.message });
  }
};

const deleteCar = async (req, res) => {
  try {
    const car = await Car.findOneAndDelete({ _id: req.params.id }); // Removed userId check
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete car", error: error.message });
  }
};

const updateCar = async (req, res) => {
  try {
    const { body, files } = req;
    
    const updatedData = {};
    if (body.brand) updatedData.brand = body.brand === "Other" ? body.customBrand : body.brand;
    if (body.carType) updatedData.carType = body.carType === "Other" ? body.customCarType : body.carType;
    if (body.location) updatedData.location = body.location === "Other" ? body.customLocation : body.location;
    
    const fields = ['transmission', 'fuelType', 'ownership', 'carName', 'engine', 'description', 
                    'vin', 'registrationNumber', 'insuranceStatus', 'status'];
    fields.forEach(field => { if (body[field]) updatedData[field] = body[field]; });
    
    if (body.carYear) updatedData.carYear = Number(body.carYear);
    if (body.kmsDriven) updatedData.kmsDriven = Number(body.kmsDriven);
    if (body.price) updatedData.price = Number(body.price);
    if (files?.featuredImage) updatedData.featuredImage = files.featuredImage[0].filename;
    if (files?.gallery) updatedData.gallery = files.gallery.map(file => file.filename);
    if (files?.picWithCar) updatedData.picWithCar = files.picWithCar[0].filename;
    if (files?.verificationDoc) updatedData.verificationDoc = files.verificationDoc[0].filename;
    if (body.agreementAccepted) updatedData.agreementAccepted = body.agreementAccepted === "true";

    const car = await Car.findOneAndUpdate(
      { _id: req.params.id }, // Removed userId check
      updatedData,
      { new: true, runValidators: true }
    );

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.status(200).json({ message: "Car updated successfully", car });
  } catch (error) {
    res.status(500).json({ message: "Failed to update car", error: error.message });
  }
};

const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const compareCars = async (req, res) => {
  try {
    const { car1, car2 } = req.query;
    if (!car1 || !car2) {
      return res.status(400).json({ message: "Two car IDs required" });
    }

    const cars = await Car.find({ _id: { $in: [car1, car2] } });
    if (cars.length !== 2) {
      return res.status(404).json({ message: "One or both cars not found" });
    }

    res.status(200).json({
      car1: cars[0].toObject(),
      car2: cars[1].toObject()
    });
  } catch (error) {
    res.status(500).json({ message: "Error comparing cars", error: error.message });
  }
};

module.exports = { addCar, getUserCars, getAllCars, deleteCar, updateCar, getCarById, compareCars };