const Favorite = require('../models/Favorite');
const Car = require('../models/Cars');

// Add a car to favorites
exports.addFavorite = async (req, res) => {
  try {
    const { carId } = req.body;
    
    // Firebase stores user ID in different places depending on token format
    // It could be in uid, sub, or user_id
    const userId = req.user.uid || req.user.sub || req.user.user_id;
    
    if (!userId) {
      console.log('User object from token:', req.user);
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({ userId, carId });
    if (existingFavorite) {
      return res.status(400).json({ error: 'Car already in favorites' });
    }

    const favorite = new Favorite({ userId, carId });
    await favorite.save();
    res.status(201).json({ message: 'Added to favorites', favorite });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Remove a car from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const { carId } = req.params;
    // Firebase stores user ID in different places depending on token format
    const userId = req.user.uid || req.user.sub || req.user.user_id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    const favorite = await Favorite.findOneAndDelete({ userId, carId });
    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Get all favorite cars for a user
exports.getFavorites = async (req, res) => {
  try {
    // Firebase stores user ID in different places depending on token format
    const userId = req.user.uid || req.user.sub || req.user.user_id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    // Find all favorites and populate with car details
    const favorites = await Favorite.find({ userId }).populate('carId');
    
    // Return only the car details
    const favoriteCars = favorites
      .filter(fav => fav.carId) // Filter out any favorites where the car was deleted
      .map(fav => fav.carId);
      
    res.json(favoriteCars);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};