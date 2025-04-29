const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const carRoutes = require("./routes/carRoutes");
const path = require("path");
const multer = require("multer");
const auctionRoutes = require('./routes/auctionRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// Routes
app.use("/api", carRoutes);
app.use('/api', auctionRoutes);
app.use('/api', favoriteRoutes);

// Error handling middleware
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