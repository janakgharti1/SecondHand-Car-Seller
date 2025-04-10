import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CarListingManagement.css";

const CarListingsManagement = () => {
  const [cars, setCars] = useState([]);
  const [formData, setFormData] = useState({
    brand: "",
    customBrand: "",
    carType: "",
    customCarType: "",
    transmission: "",
    fuelType: "",
    carYear: "",
    ownership: "",
    carName: "",
    kmsDriven: "",
    price: "",
    location: "",
    customLocation: "",
    engine: "",
    description: "",
    featuredImage: null,
    gallery: Array(8).fill(null),
    picWithCar: null,
    vin: "",
    registrationNumber: "",
    insuranceStatus: "",
    status: "pending",
    sold: false,
    expired: false,
  });
  const [editingCarId, setEditingCarId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:4000/api/cars");
      setCars(response.data);
    } catch (error) {
      setError("Failed to fetch cars. Please try again.");
      console.error("Error fetching cars:", error);
    } finally {
      setLoading(false);
    }
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };
  const handleRefresh = debounce(fetchCars, 500);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.carName || formData.carName.length < 2) return "Car name must be at least 2 characters.";
    if (!formData.price || isNaN(formData.price) || formData.price <= 0) return "Price must be a positive number.";
    if (!formData.kmsDriven || isNaN(formData.kmsDriven) || formData.kmsDriven < 0) return "Kilometers driven must be a non-negative number.";
    if (!["pending", "approved", "rejected"].includes(formData.status)) return "Invalid status value.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      if (editingCarId) {
        await axios.put(`http://localhost:4000/api/cars/${editingCarId}`, formData);
        fetchCars();
        resetForm();
      }
    } catch (error) {
      setError("Error updating car. Please try again.");
      console.error("Error updating car:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      brand: "",
      customBrand: "",
      carType: "",
      customCarType: "",
      transmission: "",
      fuelType: "",
      carYear: "",
      ownership: "",
      carName: "",
      kmsDriven: "",
      price: "",
      location: "",
      customLocation: "",
      engine: "",
      description: "",
      featuredImage: null,
      gallery: Array(8).fill(null),
      picWithCar: null,
      vin: "",
      registrationNumber: "",
      insuranceStatus: "",
      status: "pending",
      sold: false,
      expired: false,
    });
    setEditingCarId(null);
    setError(null);
  };

  const handleEdit = (car) => {
    setFormData(car);
    setEditingCarId(car._id);
    setError(null);
    setIsDetailsOpen(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:4000/api/cars/${id}`); 
      fetchCars();
    } catch (error) {
      setError("Error deleting car. Please try again.");
      console.error("Error deleting car:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (car) => {
    setSelectedCar(car);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedCar(null);
  };

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      await axios.put(`http://localhost:4000/api/cars/${id}`, { status: "approved" });
      fetchCars();
    } catch (error) {
      setError("Error approving car. Please try again.");
      console.error("Error approving car:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    setLoading(true);
    try {
      await axios.put(`http://localhost:4000/api/cars/${id}`, { status: "rejected" });
      fetchCars();
    } catch (error) {
      setError("Error rejecting car. Please try again.");
      console.error("Error rejecting car:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/300x200";
  };

  return (
    <div className="car-listings-management">
      <h2>Car Listings Management</h2>
      <button onClick={handleRefresh} className="refresh-btn" disabled={loading}>
        {loading ? "Refreshing..." : "Refresh"}
      </button>
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {editingCarId && (
        <form onSubmit={handleSubmit} className="car-form">
          <input type="text" name="carName" placeholder="Car Name" value={formData.carName} onChange={handleInputChange} required />
          <input type="text" name="brand" placeholder="Brand" value={formData.brand} onChange={handleInputChange} />
          <input type="text" name="customBrand" placeholder="Custom Brand" value={formData.customBrand} onChange={handleInputChange} />
          <input type="text" name="carType" placeholder="Car Type" value={formData.carType} onChange={handleInputChange} required />
          <input type="text" name="customCarType" placeholder="Custom Car Type" value={formData.customCarType} onChange={handleInputChange} />
          <input type="text" name="transmission" placeholder="Transmission" value={formData.transmission} onChange={handleInputChange} />
          <input type="text" name="fuelType" placeholder="Fuel Type" value={formData.fuelType} onChange={handleInputChange} required />
          <input type="number" name="carYear" placeholder="Year" value={formData.carYear} onChange={handleInputChange} />
          <input type="text" name="ownership" placeholder="Ownership" value={formData.ownership} onChange={handleInputChange} />
          <input type="number" name="kmsDriven" placeholder="Kilometers Driven" value={formData.kmsDriven} onChange={handleInputChange} required />
          <input type="number" name="price" placeholder="Price in Lakhs" value={formData.price} onChange={handleInputChange} required />
          <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} required />
          <input type="text" name="customLocation" placeholder="Custom Location" value={formData.customLocation} onChange={handleInputChange} />
          <input type="text" name="engine" placeholder="Engine" value={formData.engine} onChange={handleInputChange} />
          <input type="text" name="featuredImage" placeholder="Featured Image Filename" value={formData.featuredImage} onChange={handleInputChange} required />
          <input type="text" name="vin" placeholder="VIN" value={formData.vin} onChange={handleInputChange} />
          <input type="text" name="registrationNumber" placeholder="Registration Number" value={formData.registrationNumber} onChange={handleInputChange} />
          <input type="text" name="insuranceStatus" placeholder="Insurance Status" value={formData.insuranceStatus} onChange={handleInputChange} />
          <select name="status" value={formData.status} onChange={handleInputChange} required>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} />
          <button type="submit" className="action-btn" disabled={loading}>Update Car</button>
        </form>
      )}

      <table className="car-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Type</th>
            <th>Fuel</th>
            <th>Price (Lakhs)</th>
            <th>KMs Driven</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cars.length > 0 ? (
            cars.map((car) => (
              <tr key={car._id}>
                <td>
                  <img
                    src={`http://localhost:4000/uploads/${car.featuredImage}`}
                    alt={car.carName}
                    className="car-image"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/100")}
                  />
                </td>
                <td>{car.carName}</td>
                <td>{car.carType}</td>
                <td>{car.fuelType}</td>
                <td>{car.price}</td>
                <td>{car.kmsDriven}</td>
                <td>{car.location}</td>
                <td>{car.status || "Pending"}</td>
                <td>
                  <button onClick={() => handleViewDetails(car)} className="action-btn">View Details</button>
                  <button onClick={() => handleEdit(car)} className="action-btn">Edit</button>
                  <button onClick={() => handleDelete(car._id)} className="action-btn delete-btn">Delete</button>
                  <button onClick={() => handleApprove(car._id)} className="action-btn approve-btn" disabled={car.status === "approved" || loading}>Approve</button>
                  <button onClick={() => handleReject(car._id)} className="action-btn reject-btn" disabled={car.status === "rejected" || loading}>Reject</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9">{loading ? "Loading..." : "No car listings found"}</td>
            </tr>
          )}
        </tbody>
      </table>

      {isDetailsOpen && selectedCar && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">{selectedCar.carName}</h3>
                <button onClick={handleCloseDetails} className="modal-close">X</button>
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
                            : "https://via.placeholder.com/300x200"
                        }
                        alt={selectedCar.carName}
                        className="car-detail-image"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="car-thumbnails">
                      {(selectedCar.gallery || []).filter(Boolean).slice(0, 4).map((image, index) => (
                        <img
                          key={index}
                          src={`http://localhost:4000/uploads/${image}`}
                          alt={`${selectedCar.carName} view ${index + 1}`}
                          className="car-thumbnail"
                          onError={handleImageError}
                        />
                      ))}
                      {selectedCar.picWithCar && (
                        <img
                          src={`http://localhost:4000/uploads/${selectedCar.picWithCar}`}
                          alt={`${selectedCar.carName} with owner`}
                          className="car-thumbnail"
                          onError={handleImageError}
                        />
                      )}
                    </div>
                  </div>

                  <div className="car-info">
                    <div className="car-detail-price-section">
                      <p className="car-detail-price">₹{Number(selectedCar.price).toLocaleString()}</p>
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
                        <p className="detail-value">{selectedCar.brand || "N/A"}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Custom Brand</p>
                        <p className="detail-value">{selectedCar.customBrand || "N/A"}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Car Type</p>
                        <p className="detail-value">{selectedCar.carType}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Custom Car Type</p>
                        <p className="detail-value">{selectedCar.customCarType || "N/A"}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Transmission</p>
                        <p className="detail-value">{selectedCar.transmission || "N/A"}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Fuel Type</p>
                        <p className="detail-value">{selectedCar.fuelType}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Year</p>
                        <p className="detail-value">{selectedCar.carYear || "N/A"}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Ownership</p>
                        <p className="detail-value">{selectedCar.ownership || "N/A"}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">KMs Driven</p>
                        <p className="detail-value">{Number(selectedCar.kmsDriven).toLocaleString()}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Engine</p>
                        <p className="detail-value">{selectedCar.engine || "N/A"}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Custom Location</p>
                        <p className="detail-value">{selectedCar.customLocation || "N/A"}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">VIN</p>
                        <p className="detail-value">{selectedCar.vin || "N/A"}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Registration Number</p>
                        <p className="detail-value">{selectedCar.registrationNumber || "N/A"}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Insurance Status</p>
                        <p className="detail-value">{selectedCar.insuranceStatus || "N/A"}</p>
                      </div>
                      <div className="car-detail-spec">
                        <p className="detail-label">Status</p>
                        <p className="detail-value">{selectedCar.status || "Pending"}</p>
                      </div>
                    </div>

                    <div className="car-detail-description">
                      <p className="detail-label">Description</p>
                      <p className="detail-value description-text">{selectedCar.description || "No description available."}</p>
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
                  disabled={loading}
                >
                  Edit Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarListingsManagement;