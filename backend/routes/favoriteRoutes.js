const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favoriteController');
const { authenticateUser } = require('../middlewares/authMiddleware');

// Routes for favorites
router.post('/favorites', authenticateUser, addFavorite);
router.delete('/favorites/:carId', authenticateUser, removeFavorite);
router.get('/favorites', authenticateUser, getFavorites);

module.exports = router;