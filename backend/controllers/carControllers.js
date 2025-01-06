const Car = require("../models/Cars");

// Add new car
const addCar = async (req, res) => {
    try {
        const { body, files } = req;
        const featuredImage = files.featuredImage ? files.featuredImage[0].filename : null;
        const gallery = files.gallery ? files.gallery.map((file) => file.filename) : [];

        if (gallery.length < 2) {
            return res.status(400).json({ message: "At least 2 gallery images are required." });
        }

        const car = new Car({
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

// Controller to fetch all cars
const getAllCars = async (req, res) => {
    try {
        const cars = await Car.find(); // Fetch all cars from the database
        res.status(200).json(cars); // Send cars as a response
    } catch (error) {
        console.error("Error fetching cars:", error);
        res.status(500).json({ message: "Failed to fetch cars" });
    }
};

module.exports = { addCar };
