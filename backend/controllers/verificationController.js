const VehicleVerification = require("../models/VehicleVerification");

// Add vehicle verification
const addVerification = async (req, res) => {
  try {
    const { body, files } = req;
    const documentImages = files.documentImages 
      ? files.documentImages.map((file) => file.path) 
      : [];
    const selfieWithCar = files.selfieWithCar 
      ? files.selfieWithCar[0].path 
      : null;

    const userId = req.user.uid; // Fetch Firebase UID from request

    // Validate required fields
    if (!body.registrationNumber || !body.chassisNumber || !body.engineNumber) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    const verification = new VehicleVerification({
      userId,
      ...body,
      documentImages,
      selfieWithCar,
    });

    await verification.save();
    res.status(201).json({ message: "Vehicle verification submitted successfully!", verification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting vehicle verification." });
  }
};

// Get verifications for authenticated user
const getUserVerifications = async (req, res) => {
  try {
    const userId = req.user.uid;
    const verifications = await VehicleVerification.find({ userId });
    res.status(200).json(verifications);
  } catch (error) {
    console.error("Error fetching user verifications:", error);
    res.status(500).json({ message: "Failed to fetch user verifications." });
  }
};

module.exports = { addVerification, getUserVerifications };
