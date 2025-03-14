import React, { useEffect, useState, useCallback } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { Trash2, AlertCircle, CheckCircle, X, Filter, RefreshCw } from "lucide-react";

import "../UserDashboard/UploadedCar.css";

// Define a default image to use when images are missing or invalid
const DEFAULT_IMAGE = "/api/placeholder/400/320";

const UploadedCar = () => {
  const [cars, setCars] = useState([]);
  const [userUID, setUserUID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    sold: "all", // all, yes, no
    expired: "all", // all, yes, no
  });
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid);
      } else {
        setUserUID(null);
        setCars([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Function to check if a URL is valid
  const isValidImageUrl = (url) => {
    if (!url) return false;
    
    // Check if URL is absolute (starts with http/https) or a valid path
    return url.startsWith('http://') || 
           url.startsWith('https://') || 
           url.startsWith('/');
  };

  // Function to handle image error and replace with default image
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = DEFAULT_IMAGE;
  };

  const fetchUserCars = useCallback(async () => {
    if (!userUID) return;
    
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get("http://localhost:4000/api/cars/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Add timestamp for sorting and ensure valid images
      const carsWithTimestamp = response.data.map(car => {
        // Make sure car has images array with at least one valid image
        let validImages = Array.isArray(car.images) && car.images.length > 0 
          ? car.images.filter(img => isValidImageUrl(img))
          : [];
          
        // If no valid images, use default
        if (validImages.length === 0) {
          validImages = [DEFAULT_IMAGE];
        }
        
        return {
          ...car,
          createdAt: new Date(car.createdAt || Date.now()),
          images: validImages
        };
      });
      
      setCars(carsWithTimestamp);
    } catch (error) {
      setError("Error fetching your uploaded cars. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [userUID]);

  useEffect(() => {
    fetchUserCars();
  }, [fetchUserCars]);

  const handleViewDetails = (car) => {
    setSelectedCar(car);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  const handleDelete = (car) => {
    setCarToDelete(car);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!carToDelete) return;
    
    setIsActionLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`http://localhost:4000/api/cars/${carToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setCars(cars.filter((car) => car._id !== carToDelete._id));
      setNotification({
        show: true,
        message: "Car listing successfully deleted",
        type: "success"
      });
      
      setIsDeleteModalOpen(false);
      setCarToDelete(null);
    } catch (error) {
      setNotification({
        show: true,
        message: "Failed to delete car listing",
        type: "error"
      });
      console.error(error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkAsSold = async (car) => {
    setIsActionLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.patch(
        `http://localhost:4000/api/cars/${car._id}`,
        { sold: !car.sold },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCars(cars.map((c) => (c._id === car._id ? { ...c, sold: !car.sold } : c)));
      
      setNotification({
        show: true,
        message: car.sold ? "Car marked as available" : "Car marked as sold",
        type: "success"
      });
    } catch (error) {
      setNotification({
        show: true,
        message: "Failed to update car status",
        type: "error"
      });
      console.error(error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredCars = cars.filter((car) => {
    // Filter by status
    if (filterOptions.sold !== "all" && 
        ((filterOptions.sold === "yes" && !car.sold) || 
         (filterOptions.sold === "no" && car.sold))) {
      return false;
    }
    
    if (filterOptions.expired !== "all" &&
        ((filterOptions.expired === "yes" && !car.expired) ||
         (filterOptions.expired === "no" && car.expired))) {
      return false;
    }
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        car.carName?.toLowerCase().includes(query) ||
        car.brand?.toLowerCase().includes(query) ||
        car.location?.toLowerCase().includes(query) ||
        car.description?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Sort the filtered cars
  const sortedCars = [...filteredCars].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "price":
        comparison = a.price - b.price;
        break;
      case "name":
        comparison = a.carName.localeCompare(b.carName);
        break;
      case "brand":
        comparison = a.brand.localeCompare(b.brand);
        break;
      case "year":
        comparison = a.carYear - b.carYear;
        break;
      case "date":
      default:
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
        break;
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="dashboard-container">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type === "success" ? "notification-success" : "notification-error"}`}>
          {notification.type === "success" ? (
            <CheckCircle className="notification-icon" />
          ) : (
            <AlertCircle className="notification-icon" />
          )}
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification({ ...notification, show: false })}
            className="notification-close"
          >
            <X className="close-icon" />
          </button>
        </div>
      )}

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <p>Manage all your car listings in one place</p>
          </div>
          
          <button 
            onClick={fetchUserCars} 
            className={`refresh-button ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            <RefreshCw className="button-icon" />
            Refresh
          </button>
        </div>

        {/* Filters and Search */}
        <div className="filter-container">
          <div className="filter-row">
            <div className="filter-field">
              <label htmlFor="search">Search</label>
              <input
                type="text"
                id="search"
                className="search-input"
                placeholder="Search by car name, brand, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                className="filter-select"
                value={filterOptions.sold}
                onChange={(e) => setFilterOptions({ ...filterOptions, sold: e.target.value })}
              >
                <option value="all">All Statuses</option>
                <option value="no">Available</option>
                <option value="yes">Sold</option>
              </select>
            </div>
            
            <div className="filter-field">
              <label htmlFor="expiry">Listing Status</label>
              <select
                id="expiry"
                className="filter-select"
                value={filterOptions.expired}
                onChange={(e) => setFilterOptions({ ...filterOptions, expired: e.target.value })}
              >
                <option value="all">All Listings</option>
                <option value="no">Active</option>
                <option value="yes">Expired</option>
              </select>
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-field">
              <label htmlFor="sortBy">Sort By</label>
              <select
                id="sortBy"
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Upload Date</option>
                <option value="price">Price</option>
                <option value="name">Car Name</option>
                <option value="brand">Brand</option>
                <option value="year">Year</option>
              </select>
            </div>
            
            <div className="filter-field">
              <label htmlFor="sortOrder">Order</label>
              <select
                id="sortOrder"
                className="filter-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
            
            <div className="filter-actions">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterOptions({ sold: "all", expired: "all" });
                  setSortBy("date");
                  setSortOrder("desc");
                }}
                className="reset-button"
              >
                <Filter className="button-icon" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Car Listings */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your car listings...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <AlertCircle className="error-icon" />
            <p>{error}</p>
          </div>
        ) : sortedCars.length > 0 ? (
          <div className="car-grid">
            {sortedCars.map((car) => (
              <div 
                key={car._id} 
                className={`car-card ${car.expired ? "car-card-expired" : ""}`}
              >
                <div className="card-header">
                  <span className="car-type">{car.carType.toUpperCase()}</span>
                  <img
                    src={
                      car.featuredImage
                        ? `http://localhost:4000/uploads/${car.featuredImage}`
                        : car.images[0] || "https://via.placeholder.com/300x200"
                    }
                    alt={car.carName}
                    className="car-image"
                    onError={handleImageError}
                  />
                  {car.sold && (
                    <div className="sold-badge">
                      SOLD
                    </div>
                  )}
                  {car.expired && (
                    <div className="expired-badge">
                      Listing Expired
                    </div>
                  )}
                </div>
                
                <div className="car-details">
                  <div className="car-header">
                    <div>
                      <h3 className="car-title">{car.carName}</h3>
                      <p className="car-subtitle">{car.brand} • {car.carYear}</p>
                    </div>
                    <p className="car-price">₹{car.price.toLocaleString()}</p>
                  </div>
                  
                  <div className="car-specs">
                    <div className="car-spec">
                      <span className="spec-label">Fuel:</span>
                      <span className="spec-value">{car.fuelType}</span>
                    </div>
                    <div className="car-spec">
                      <span className="spec-label">Trans:</span>
                      <span className="spec-value">{car.transmission}</span>
                    </div>
                    <div className="car-spec">
                      <span className="spec-label">KM:</span>
                      <span className="spec-value">{car.kmsDriven.toLocaleString()}</span>
                    </div>
                    <div className="car-spec">
                      <span className="spec-label">Owner:</span>
                      <span className="spec-value">{car.ownership}</span>
                    </div>
                  </div>
                  
                  <div className="car-location">
                    <span>{car.location}</span>
                  </div>
                  
                  <div className="car-actions">
                    <button
                      onClick={() => handleViewDetails(car)}
                      className="view-details-button"
                    >
                      View Details
                    </button>
                    
                    <div className="action-buttons">
                      <button
                        onClick={() => handleMarkAsSold(car)}
                        className={`action-button ${car.sold ? "action-button-green" : "action-button-blue"}`}
                        disabled={isActionLoading}
                        title={car.sold ? "Mark as Available" : "Mark as Sold"}
                      >
                        <CheckCircle className="action-icon" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(car)}
                        className="action-button action-button-red"
                        disabled={isActionLoading}
                        title="Delete Listing"
                      >
                        <Trash2 className="action-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-container">
            <div className="empty-icon-container">
              <AlertCircle className="empty-icon" />
            </div>
            <h3 className="empty-title">No cars found</h3>
            <p className="empty-message">
              You haven't uploaded any cars yet or no cars match your current filters.
            </p>
          </div>
        )}
      </div>

      {/* Car Details Modal */}
      {isDetailsOpen && selectedCar && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">{selectedCar.carName}</h3>
                <button 
                  onClick={handleCloseDetails}
                  className="modal-close"
                >
                  <X className="close-icon" />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="car-detail-grid">
                  <div className="car-gallery">
                    <div className="card-header">
                      <span className="car-type">{selectedCar.carType.toUpperCase()}</span>
                      <img 
                        src={
                          selectedCar.featuredImage
                            ? `http://localhost:4000/uploads/${selectedCar.featuredImage}`
                            : selectedCar.images[0] || "https://via.placeholder.com/300x200"
                        }
                        alt={selectedCar.carName} 
                        className="car-detail-image"
                        onError={handleImageError}
                      />
                    </div>
                    
                    <div className="car-thumbnails">
                      {selectedCar.images.slice(1, 4).map((image, index) => (
                        <img 
                          key={index}
                          src={image} 
                          alt={`${selectedCar.carName} view ${index + 2}`} 
                          className="car-thumbnail"
                          onError={handleImageError}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="car-info">
                    <div className="car-detail-price-section">
                      <p className="car-detail-price">₹{selectedCar.price.toLocaleString()}</p>
                      <p className="car-detail-location">{selectedCar.location}</p>
                      <div className="car-detail-badges">
                        <span className={`status-badge ${selectedCar.sold ? "status-badge-red" : "status-badge-green"}`}>
                          {selectedCar.sold ? "Sold" : "Available"}
                        </span>
                        
                        <span className={`status-badge ${selectedCar.expired ? "status-badge-gray" : "status-badge-blue"}`}>
                          {selectedCar.expired ? "Expired" : "Active"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="car-detail-specs">
                      <div className="car-detail-spec">
                        <p className="detail-label">Brand</p>
                        <p className="detail-value">{selectedCar.brand}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Year</p>
                        <p className="detail-value">{selectedCar.carYear}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Car Type</p>
                        <p className="detail-value">{selectedCar.carType}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Fuel Type</p>
                        <p className="detail-value">{selectedCar.fuelType}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Transmission</p>
                        <p className="detail-value">{selectedCar.transmission}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Ownership</p>
                        <p className="detail-value">{selectedCar.ownership}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">KMs Driven</p>
                        <p className="detail-value">{selectedCar.kmsDriven.toLocaleString()}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Engine</p>
                        <p className="detail-value">{selectedCar.engine}</p>
                      </div>
                    </div>
                    
                    <div className="car-detail-description">
                      <p className="detail-label">Description</p>
                      <p className="detail-value description-text">{selectedCar.description}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  onClick={() => handleMarkAsSold(selectedCar)}
                  className={`modal-button ${selectedCar.sold ? "button-green" : "button-blue"}`}
                  disabled={isActionLoading}
                >
                  {selectedCar.sold ? "Mark as Available" : "Mark as Sold"}
                </button>
                <button
                  onClick={() => {
                    handleCloseDetails();
                    handleDelete(selectedCar);
                  }}
                  className="modal-button button-red"
                  disabled={isActionLoading}
                >
                  Delete Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal-container">
            <div className="modal-content">
              <h3 className="modal-title">Delete Car Listing</h3>
              <p className="delete-confirmation-text">
                Are you sure you want to delete the listing for {carToDelete?.carName}? This action cannot be undone.
              </p>
              
              <div className="modal-footer">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="modal-button button-gray"
                  disabled={isActionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="modal-button button-red"
                  disabled={isActionLoading}
                >
                  {isActionLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadedCar;