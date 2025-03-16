const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const carRoutes = require("./routes/carRoutes");
const path = require("path");

const auctionRoutes = require('./routes/auctionRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase JSON payload limit to 50MB
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increase URL-encoded payload limit to 50MB
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded images

// Routes
app.use("/api", carRoutes);
app.use('/api', auctionRoutes);

// Error handling middleware (optional, for better error reporting)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'File upload error', details: err.message });
  } else if (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
  next();
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));