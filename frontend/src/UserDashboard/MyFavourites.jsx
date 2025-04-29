import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../firebase';
import './MyFavourites.css'; // We'll create this CSS file next

const MyFavourites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!auth.currentUser) {
          setError('You must be logged in to view favorites');
          setLoading(false);
          return;
        }

        const token = await auth.currentUser.getIdToken();
        const response = await axios.get('http://localhost:4000/api/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFavorites(response.data);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load your favorites. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const removeFavorite = async (carId) => {
    try {
      if (!auth.currentUser) return;
      
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`http://localhost:4000/api/favorites/${carId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Remove from local state
      setFavorites(favorites.filter(car => car._id !== carId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      alert('Failed to remove from favorites. Please try again.');
    }
  };

  const handleViewDetails = (carId) => {
    navigate(`/car/${carId}`);
  };

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading-indicator">
          <i className="fa fa-spinner fa-spin"></i>
          <p>Loading your favorite cars...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-container">
        <div className="error-message">
          <i className="fa fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="favorites-container">
        <div className="no-favorites">
          <i className="fa fa-heart-o"></i>
          <h3>No Favorite Cars Yet</h3>
          <p>Cars you add to favorites will appear here.</p>
          <button onClick={() => navigate('/usedcar')}>Explore Cars</button>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <h2 className="favorites-title">My Favorite Cars</h2>
      <div className="favorites-grid">
        {favorites.map((car) => (
          <div key={car._id} className="favorite-card">
            <div className="favorite-image">
              <img 
                src={`http://localhost:4000/uploads/${car.featuredImage}`} 
                alt={`${car.brand} ${car.carName}`}
                onError={(e) => e.target.src = "https://via.placeholder.com/300x200?text=No+Image"}
              />
              <button 
                className="remove-favorite" 
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(car._id);
                }}
              >
                <i className="fa fa-heart"></i>
              </button>
            </div>
            <div className="favorite-details" onClick={() => handleViewDetails(car._id)}>
              <h3>{car.brand} {car.carName}</h3>
              <div className="favorite-specs">
                <span><i className="fa fa-calendar"></i> {car.carYear}</span>
                <span><i className="fa fa-road"></i> {car.kmsDriven.toLocaleString()} km</span>
                <span><i className="fa fa-gas-pump"></i> {car.fuelType}</span>
              </div>
              <div className="favorite-price">
                <p>NPR {car.price.toLocaleString()}</p>
                <button className="view-details">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyFavourites;
