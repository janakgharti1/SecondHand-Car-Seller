import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Auction/AntiqueCarAuction.css'; // Import the CSS file

// Main Auction Component
const AntiqueCarAuction = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation handler for Add Antiques Car button
  const handleAddCar = () => {
    navigate('/addcarauction');
  };
  
  // Mock data - In a real app, you would fetch this from your API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAuctions([
        {
          id: 1,
          title: '1967 Ford Mustang Shelby GT500',
          description: 'Fully restored classic in excellent condition. Original engine with documentation.',
          year: 1967,
          make: 'Ford',
          model: 'Mustang Shelby GT500',
          images: ['/api/placeholder/600/400'],
          startingBid: 68000,
          currentBid: 72500,
          bidCount: 7,
          endTime: new Date(Date.now() + 86400000 * 3), // 3 days from now
          seller: 'ClassicCarLover',
          sellerRating: 4.8,
          watchers: 34,
          condition: 'Excellent'
        },
        {
          id: 2,
          title: '1955 Mercedes-Benz 300SL Gullwing',
          description: 'Rare collector item. Matching numbers, original silver paint. Museum quality.',
          year: 1955,
          make: 'Mercedes-Benz',
          model: '300SL Gullwing',
          images: ['/api/placeholder/600/400'],
          startingBid: 1200000,
          currentBid: 1350000,
          bidCount: 4,
          endTime: new Date(Date.now() + 86400000 * 5), // 5 days from now
          seller: 'VintageCollector',
          sellerRating: 5.0,
          watchers: 89,
          condition: 'Excellent'
        },
        {
          id: 3,
          title: '1970 Dodge Charger R/T',
          description: 'Numbers matching 440 V8. Restored to factory specifications. Documented history.',
          year: 1970,
          make: 'Dodge',
          model: 'Charger R/T',
          images: ['/api/placeholder/600/400'],
          startingBid: 85000,
          currentBid: 92000,
          bidCount: 12,
          endTime: new Date(Date.now() + 86400000 * 2), // 2 days from now
          seller: 'MuscleCarGarage',
          sellerRating: 4.6,
          watchers: 42,
          condition: 'Very Good'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter auctions based on search and filter criteria
  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = 
      auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.model.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'ending-soon') {
      return matchesSearch && ((auction.endTime - new Date()) / (1000 * 60 * 60 * 24)) <= 2;
    }
    if (filter === 'high-bids') {
      return matchesSearch && auction.bidCount > 10;
    }
    return matchesSearch;
  });

  // Function to place a bid (mock implementation)
  const placeBid = (auctionId, bidAmount) => {
    setAuctions(auctions.map(auction => {
      if (auction.id === auctionId && bidAmount > auction.currentBid) {
        return {
          ...auction,
          currentBid: bidAmount,
          bidCount: auction.bidCount + 1
        };
      }
      return auction;
    }));
  };

  if (loading) {
    return <div className="auction-loading">Loading auctions...</div>;
  }

  return (
    <div className="auction-container">
      <h1 className="auction-title">Antique Car Auctions</h1>
      
      {/* Add Antiques Car button */}
      <button 
        className="add-car-button" 
        onClick={handleAddCar}
      >
        Add Antiques Car
      </button>
      
      {/* Search and Filter Controls */}
      <div className="auction-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search auctions..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-container">
          <select 
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Auctions</option>
            <option value="ending-soon">Ending Soon</option>
            <option value="high-bids">Popular (10+ bids)</option>
          </select>
        </div>
      </div>
      
      {/* Auctions Grid */}
      <div className="auctions-grid">
        {filteredAuctions.map(auction => (
          <AuctionCard 
            key={auction.id} 
            auction={auction} 
            onPlaceBid={placeBid} 
          />
        ))}
      </div>
      
      {filteredAuctions.length === 0 && (
        <div className="no-results">
          <p>No auctions match your criteria</p>
        </div>
      )}
    </div>
  );
};

// Individual Auction Card Component
const AuctionCard = ({ auction, onPlaceBid }) => {
  const [bidAmount, setBidAmount] = useState(auction.currentBid + 100);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(auction.endTime));
  const [isBidding, setIsBidding] = useState(false);
  
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
  
  // Handle bid submission
  const handleBidSubmit = (e) => {
    e.preventDefault();
    setIsBidding(true);
    
    // Simulating network request
    setTimeout(() => {
      onPlaceBid(auction.id, bidAmount);
      setIsBidding(false);
      // In a real app, you'd update the bid amount after a successful bid
      setBidAmount(bidAmount + 100);
    }, 800);
  };
  
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
            <p className="bid-amount">${auction.currentBid.toLocaleString()}</p>
          </div>
          <div className="bid-count">
            <p className="bid-label">Bids</p>
            <p className="bid-value">{auction.bidCount}</p>
          </div>
        </div>
        
        {/* Bid Form */}
        {!timeLeft.ended && (
          <form onSubmit={handleBidSubmit} className="bid-form">
            <div className="bid-input-group">
              <input
                type="number"
                min={auction.currentBid + 100}
                step={100}
                value={bidAmount}
                onChange={(e) => setBidAmount(parseInt(e.target.value))}
                className="bid-input"
                disabled={isBidding}
              />
              <button
                type="submit"
                className={`bid-button ${isBidding || bidAmount <= auction.currentBid ? 'disabled' : ''}`}
                disabled={isBidding || bidAmount <= auction.currentBid}
              >
                {isBidding ? 'Bidding...' : 'Place Bid'}
              </button>
            </div>
          </form>
        )}
        
        {/* Seller Info & Watchers */}
        <div className="auction-footer">
          <div className="seller-info">
            Seller: {auction.seller} ({auction.sellerRating}★)
          </div>
          <div className="watchers-info">
            {auction.watchers} watching
          </div>
        </div>
      </div>
    </div>
  );
};

export default AntiqueCarAuction;