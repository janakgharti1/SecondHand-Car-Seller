import React, { useEffect, useState, useCallback } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { Trash2, AlertCircle, CheckCircle, X, RefreshCw, Edit } from "lucide-react";
import "../UserDashboard/UploadedCar.css";

const DEFAULT_IMAGE = "/api/placeholder/400/320";

const UploadedCar = () => {
  const [cars, setCars] = useState([]);
  const [userUID, setUserUID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  const [carToEdit, setCarToEdit] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [editFormData, setEditFormData] = useState({
    carName: "",
    brand: "",
    carYear: "",
    carType: "",
    fuelType: "",
    transmission: "",
    ownership: "",
    kmsDriven: 0,
    engine: "",
    price: 0,
    location: "",
    description: "",
    sold: false,
  });

  const [activeEditTab, setActiveEditTab] = useState("basic");

  const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG", "LPG"];
  const transmissionTypes = ["Manual", "Automatic", "Semi-Automatic"];
  const ownershipTypes = ["First Owner", "Second Owner", "Third Owner", "Fourth Owner or More"];
  const carTypes = ["Sedan", "SUV", "Hatchback", "MUV", "Luxury", "Convertible", "Coupe", "Wagon", "Van", "Jeep"];

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

  const isValidImageUrl = (url) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/");
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
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

      const carsWithTimestamp = response.data.map((car) => {
        let validImages = Array.isArray(car.images) && car.images.length > 0
          ? car.images.filter((img) => isValidImageUrl(img))
          : [];
        if (validImages.length === 0) {
          validImages = [DEFAULT_IMAGE];
        }
        return {
          ...car,
          createdAt: new Date(car.createdAt || Date.now()),
          images: validImages,
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

  const handleEdit = (car) => {
    setCarToEdit(car);
    setEditFormData({
      carName: car.carName || "",
      brand: car.brand || "",
      carYear: car.carYear || "",
      carType: car.carType || "",
      fuelType: car.fuelType || "",
      transmission: car.transmission || "",
      ownership: car.ownership || "",
      kmsDriven: car.kmsDriven || 0,
      engine: car.engine || "",
      price: car.price || 0,
      location: car.location || "",
      description: car.description || "",
      sold: car.sold || false,
    });
    setActiveEditTab("basic");
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) : value,
    });
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setCarToEdit(null);
  };

  const validateEditForm = () => {
    if (!editFormData.carName || editFormData.carName.length < 2) return "Car name must be at least 2 characters.";
    if (!editFormData.brand) return "Brand is required.";
    if (!editFormData.carYear || isNaN(editFormData.carYear) || editFormData.carYear < 1900) return "Valid year is required.";
    if (!editFormData.price || isNaN(editFormData.price) || editFormData.price <= 0) return "Price must be a positive number.";
    if (!editFormData.kmsDriven || isNaN(editFormData.kmsDriven) || editFormData.kmsDriven < 0) return "Kilometers driven must be a non-negative number.";
    if (!editFormData.location) return "Location is required.";
    return null;
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!carToEdit) return;

    const validationError = validateEditForm();
    if (validationError) {
      setNotification({ show: true, message: validationError, type: "error" });
      return;
    }

    setIsActionLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.put(
        `http://localhost:4000/api/cars/${carToEdit._id}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refetch cars to ensure UI reflects server state
      await fetchUserCars();

      setNotification({
        show: true,
        message: "Car listing successfully updated",
        type: "success",
      });
      setIsEditModalOpen(false);
      setCarToEdit(null);
    } catch (error) {
      setNotification({
        show: true,
        message: "Failed to update car listing",
        type: "error",
      });
      console.error(error);
    } finally {
      setIsActionLoading(false);
    }
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
        type: "success",
      });
      setIsDeleteModalOpen(false);
      setCarToDelete(null);
    } catch (error) {
      setNotification({
        show: true,
        message: "Failed to delete car listing",
        type: "error",
      });
      console.error(error);
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "status-badge status-badge-green";
      case "rejected":
        return "status-badge status-badge-red";
      case "pending":
      default:
        return "status-badge status-badge-yellow";
    }
  };

  return (
    <div className="dashboard-container">
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
        ) : cars.length > 0 ? (
          <div className="car-grid">
            {cars.map((car) => (
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
                  {car.sold && <div className="sold-badge">SOLD</div>}
                  {car.expired && <div className="expired-badge">Listing Expired</div>}
                  <span className={getStatusBadgeClass(car.status)}>
                    {car.status ? car.status.charAt(0).toUpperCase() + car.status.slice(1) : "Pending"}
                  </span>
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
                        onClick={() => handleEdit(car)}
                        className="action-button action-button-blue"
                        disabled={isActionLoading}
                        title="Edit Listing"
                      >
                        <Edit className="action-icon" />
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
            <p className="empty-message">You haven't uploaded any cars yet.</p>
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
                <button onClick={handleCloseDetails} className="modal-close">
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
                        <span className={getStatusBadgeClass(selectedCar.status)}>
                          {selectedCar.status ? selectedCar.status.charAt(0).toUpperCase() + selectedCar.status.slice(1) : "Pending"}
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
                  onClick={() => {
                    handleCloseDetails();
                    handleEdit(selectedCar);
                  }}
                  className="modal-button button-blue"
                  disabled={isActionLoading}
                >
                  Edit Listing
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

      {/* Enhanced Edit Modal with Tabs */}
      {isEditModalOpen && carToEdit && (
        <div className="modal-overlay">
          <div className="edit-modal-container">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Edit Car Listing</h3>
                <button onClick={handleCloseEdit} className="modal-close">
                  <X className="close-icon" />
                </button>
              </div>

              <div className="edit-tabs">
                <button
                  className={`edit-tab ${activeEditTab === "basic" ? "active" : ""}`}
                  onClick={() => setActiveEditTab("basic")}
                >
                  Basic Details
                </button>
                <button
                  className={`edit-tab ${activeEditTab === "specs" ? "active" : ""}`}
                  onClick={() => setActiveEditTab("specs")}
                >
                  Specifications
                </button>
                <button
                  className={`edit-tab ${activeEditTab === "price" ? "active" : ""}`}
                  onClick={() => setActiveEditTab("price")}
                >
                  Price & Status
                </button>
              </div>

              <form onSubmit={handleSubmitEdit}>
                <div className="modal-body">
                  {/* Basic Details Tab */}
                  {activeEditTab === "basic" && (
                    <div className="edit-tab-content">
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="carName" className="form-label">Car Name <span className="required">*</span></label>
                          <input
                            type="text"
                            id="carName"
                            name="carName"
                            value={editFormData.carName}
                            onChange={handleEditFormChange}
                            className="form-input"
                            required
                          />
                        </div>
                      </div>
                      <div className="form-row two-col">
                        <div className="form-group">
                          <label htmlFor="brand" className="form-label">Brand <span className="required">*</span></label>
                          <input
                            type="text"
                            id="brand"
                            name="brand"
                            value={editFormData.brand}
                            onChange={handleEditFormChange}
                            className="form-input"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="carYear" className="form-label">Year <span className="required">*</span></label>
                          <input
                            type="text"
                            id="carYear"
                            name="carYear"
                            value={editFormData.carYear}
                            onChange={handleEditFormChange}
                            className="form-input"
                            required
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="carType" className="form-label">Car Type <span className="required">*</span></label>
                          <select
                            id="carType"
                            name="carType"
                            value={editFormData.carType}
                            onChange={handleEditFormChange}
                            className="form-select"
                            required
                          >
                            <option value="">Select Car Type</option>
                            {carTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="description" className="form-label">Description</label>
                          <textarea
                            id="description"
                            name="description"
                            value={editFormData.description}
                            onChange={handleEditFormChange}
                            className="form-textarea"
                            rows="4"
                            placeholder="Provide a detailed description of your car"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Specifications Tab */}
                  {activeEditTab === "specs" && (
                    <div className="edit-tab-content">
                      <div className="form-row two-col">
                        <div className="form-group">
                          <label htmlFor="fuelType" className="form-label">Fuel Type <span className="required">*</span></label>
                          <select
                            id="fuelType"
                            name="fuelType"
                            value={editFormData.fuelType}
                            onChange={handleEditFormChange}
                            className="form-select"
                            required
                          >
                            <option value="">Select Fuel Type</option>
                            {fuelTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="transmission" className="form-label">Transmission <span className="required">*</span></label>
                          <select
                            id="transmission"
                            name="transmission"
                            value={editFormData.transmission}
                            onChange={handleEditFormChange}
                            className="form-select"
                            required
                          >
                            <option value="">Select Transmission</option>
                            {transmissionTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="form-row two-col">
                        <div className="form-group">
                          <label htmlFor="kmsDriven" className="form-label">KMs Driven <span className="required">*</span></label>
                          <input
                            type="number"
                            id="kmsDriven"
                            name="kmsDriven"
                            value={editFormData.kmsDriven}
                            onChange={handleEditFormChange}
                            className="form-input"
                            min="0"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="ownership" className="form-label">Ownership <span className="required">*</span></label>
                          <select
                            id="ownership"
                            name="ownership"
                            value={editFormData.ownership}
                            onChange={handleEditFormChange}
                            className="form-select"
                            required
                          >
                            <option value="">Select Ownership</option>
                            {ownershipTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="engine" className="form-label">Engine</label>
                          <input
                            type="text"
                            id="engine"
                            name="engine"
                            value={editFormData.engine}
                            onChange={handleEditFormChange}
                            className="form-input"
                            placeholder="e.g. 1.5L Turbo, 2.0L Diesel"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Price & Status Tab */}
                  {activeEditTab === "price" && (
                    <div className="edit-tab-content">
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="price" className="form-label">Price (₹) <span className="required">*</span></label>
                          <input
                            type="number"
                            id="price"
                            name="price"
                            value={editFormData.price}
                            onChange={handleEditFormChange}
                            className="form-input"
                            min="0"
                            required
                          />
                          <p className="form-hint">Enter the price in Indian Rupees without commas or decimals</p>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="location" className="form-label">Location <span className="required">*</span></label>
                          <input
                            type="text"
                            id="location"
                            name="location"
                            value={editFormData.location}
                            onChange={handleEditFormChange}
                            className="form-input"
                            placeholder="e.g. Mumbai, Delhi, Bangalore"
                            required
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group form-checkbox-group">
                          <input
                            type="checkbox"
                            id="sold"
                            name="sold"
                            checked={editFormData.sold}
                            onChange={handleEditFormChange}
                            className="form-checkbox"
                          />
                          <label htmlFor="sold" className="form-checkbox-label">
                            Mark as Sold
                            <span className="checkbox-hint">Check this if the car has been sold</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer edit-modal-footer">
                  <div className="tab-navigation">
                    {activeEditTab !== "basic" && (
                      <button
                        type="button"
                        className="nav-button prev-button"
                        onClick={() => {
                          if (activeEditTab === "specs") setActiveEditTab("basic");
                          if (activeEditTab === "price") setActiveEditTab("specs");
                        }}
                      >
                        Previous
                      </button>
                    )}
                    {activeEditTab !== "price" && (
                      <button
                        type="button"
                        className="nav-button next-button"
                        onClick={() => {
                          if (activeEditTab === "basic") setActiveEditTab("specs");
                          if (activeEditTab === "specs") setActiveEditTab("price");
                        }}
                      >
                        Next
                      </button>
                    )}
                  </div>
                  <div className="action-buttons">
                    <button
                      type="button"
                      onClick={handleCloseEdit}
                      className="modal-button button-gray"
                      disabled={isActionLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="modal-button button-blue"
                      disabled={isActionLoading}
                    >
                      {isActionLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </form>
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