import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Auction/AntiqueCarAuction.css'; // Assuming this CSS file exists

// Main Auction Component
const AntiqueCarAuction = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch auctions from the backend
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get('http://localhost:4000/api/auctions');
        
        // Assuming the API returns an array of auctions
        setAuctions(response.data.map(auction => ({
          ...auction,
          endTime: new Date(auction.endTime), // Convert endTime to Date object
        })));
      } catch (err) {
        setError('Failed to fetch auctions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []); // Runs once on mount

  if (loading) {
    return <div className="auction-loading">Loading auctions...</div>;
  }

  if (error) {
    return (
      <div className="auction-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="auction-container">
      <h1 className="auction-title">Antique Car Auctions</h1>
      
      {/* Auctions Grid */}
      <div className="auctions-grid">
        {auctions.map(auction => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>
      
      {auctions.length === 0 && (
        <div className="no-results">
          <p>No auctions available</p>
        </div>
      )}
    </div>
  );
};

// Individual Auction Card Component
const AuctionCard = ({ auction }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(auction.endTime));

  // Update the countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(auction.endTime));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [auction.endTime]);

  // Calculate time left for auction
  function calculateTimeLeft(endTime) {
    const difference = endTime - new Date();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
    }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      ended: false
    };
  }

  return (
    <div className="auction-card">
      {/* Car Image */}
      <div className="auction-image-container">
        <img 
          src={auction.images[0]} 
          alt={auction.title} 
          className="auction-image"
        />
        <div className={`auction-timer ${timeLeft.ended ? 'ended' : ''}`}>
          {timeLeft.ended ? 'Ended' : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`}
        </div>
      </div>
      
      {/* Auction Details */}
      <div className="auction-details">
        <h2 className="auction-car-title">{auction.title}</h2>
        <p className="auction-description">{auction.description}</p>
        
        <div className="car-specs">
          <div className="car-spec-item">
            <p className="spec-label">Year</p>
            <p className="spec-value">{auction.year}</p>
          </div>
          <div className="car-spec-item">
            <p className="spec-label">Make</p>
            <p className="spec-value">{auction.make}</p>
          </div>
          <div className="car-spec-item">
            <p className="spec-label">Model</p>
            <p className="spec-value">{auction.model}</p>
          </div>
        </div>
        
        <div className="bid-info">
          <div className="current-bid">
            <p className="bid-label">Current Bid</p>
            <p className="bid-amount">रू{auction.currentBid ? auction.currentBid.toLocaleString() : auction.startingBid.toLocaleString()}</p>
          </div>
          <div className="bid-count">
            <p className="bid-label">Bids</p>
            <p className="bid-value">{auction.bidCount || 0}</p>
          </div>
        </div>
        
        {/* Seller Info & Watchers */}
        <div className="auction-footer">
          <div className="seller-info">
            Seller: {auction.seller} ({auction.sellerRating || 'N/A'}★)
          </div>
          <div className="watchers-info">
            {auction.watchers || 0} watching
          </div>
        </div>
      </div>
    </div>
  );
};

export default AntiqueCarAuction;
