import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CarDetails.css";

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    const fetchCarDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:4000/api/cars/${id}`);
        setCar(response.data);
      } catch (error) {
        console.error("Error fetching car details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  const handlePrevImage = () => {
    if (car && car.images && car.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? car.images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleNextImage = () => {
    if (car && car.images && car.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === car.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/api/inquiries", {
        carId: id,
        ...contactForm,
      });
      alert("Your inquiry has been sent successfully!");
      setShowContactForm(false);
      setContactForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending inquiry:", error);
      alert("Failed to send inquiry. Please try again later.");
    }
  };

  if (isLoading) {
    return (
      <div className="car-details-container">
        <div className="loading">
          <p>Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="car-details-container">
        <div className="error">
          <h2>Car Not Found</h2>
          <p>The car you're looking for doesn't exist or has been removed.</p>
          <button className="back-button" onClick={() => navigate("/explore-used-car")}>
            Back to All Cars
          </button>
        </div>
      </div>
    );
  }

  // Determine image to display (featuredImage as fallback)
  const displayImage = car.images && car.images.length > 0
    ? `http://localhost:4000/uploads/${car.images[currentImageIndex]}`
    : car.featuredImage
      ? `http://localhost:4000/uploads/${car.featuredImage}`
      : "https://via.placeholder.com/800x500";

  return (
    <div className="car-details-container">
      <div className="car-details-header">
        <button className="back-button" onClick={() => navigate("/usedcar")}>
          <i className="fa fa-arrow-left"></i> Back to Cars
        </button>
        <h1>{car.carName}</h1>
        <p className="car-location">
          <i className="fa fa-map-marker-alt"></i> {car.location}
        </p>
      </div>

      <div className="car-details-content">
        <div className="image-gallery">
          <div className="main-image-container">
            <button className="gallery-nav prev" onClick={handlePrevImage}>
              <i className="fa fa-chevron-left"></i>
            </button>
            <img src={displayImage} alt={car.carName} className="main-image" />
            <button className="gallery-nav next" onClick={handleNextImage}>
              <i className="fa fa-chevron-right"></i>
            </button>
          </div>
          {car.images && car.images.length > 0 && (
            <div className="thumbnail-container">
              {car.images.map((image, index) => (
                <img
                  key={index}
                  src={`http://localhost:4000/uploads/${image}`}
                  alt={`${car.carName} - view ${index + 1}`}
                  className={`thumbnail ${index === currentImageIndex ? "active" : ""}`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="car-info">
          <div className="price-action">
            <div className="price-box">
              <h2 className="price">NPR {car.price} lakhs</h2>
              <p className="price-note">
                EMI from NPR {(car.price * 10000 * 0.01).toFixed(2)}/month*
              </p>
            </div>
            <button
              className="contact-seller-btn"
              onClick={() => setShowContactForm(!showContactForm)}
            >
              Contact Seller
            </button>
          </div>

          <div className="key-specs">
            <div className="spec-item">
              <i className="fa fa-calendar"></i>
              <div className="spec-details">
                <span className="spec-label">Year</span>
                <span className="spec-value">{car.year}</span>
              </div>
            </div>
            <div className="spec-item">
              <i className="fa fa-road"></i>
              <div className="spec-details">
                <span className="spec-label">Kms Driven</span>
                <span className="spec-value">{car.kmsDriven} km</span>
              </div>
            </div>
            <div className="spec-item">
              <i className="fa fa-gas-pump"></i>
              <div className="spec-details">
                <span className="spec-label">Fuel Type</span>
                <span className="spec-value">{car.fuelType}</span>
              </div>
            </div>
            <div className="spec-item">
              <i className="fa fa-car"></i>
              <div className="spec-details">
                <span className="spec-label">Car Type</span>
                <span className="spec-value">{car.carType}</span>
              </div>
            </div>
          </div>

          <div className="car-description">
            <h3>About This Car</h3>
            <p>{car.description || "No description available for this car."}</p>
          </div>

          <div className="additional-details">
            <h3>Additional Details</h3>
            <table className="details-table">
              <tbody>
                <tr>
                  <td>Transmission</td>
                  <td>{car.transmission || "N/A"}</td>
                </tr>
                <tr>
                  <td>Engine Capacity</td>
                  <td>{car.engineCapacity ? `${car.engineCapacity} cc` : "N/A"}</td>
                </tr>
                <tr>
                  <td>Registration</td>
                  <td>{car.registrationNumber || "N/A"}</td>
                </tr>
                <tr>
                  <td>Color</td>
                  <td>{car.color || "N/A"}</td>
                </tr>
                <tr>
                  <td>Ownership</td>
                  <td>{car.ownership || "N/A"}</td>
                </tr>
                <tr>
                  <td>Service History</td>
                  <td>{car.serviceHistory ? "Available" : "Not Available"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {car.features && car.features.length > 0 && (
            <div className="features">
              <h3>Features</h3>
              <div className="features-list">
                {car.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <i className="fa fa-check"></i> {feature}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showContactForm && (
        <div className="contact-form-overlay">
          <div className="contact-form-container">
            <button
              className="close-form-btn"
              onClick={() => setShowContactForm(false)}
            >
              <i className="fa fa-times"></i>
            </button>
            <h3>Contact Seller about {car.carName}</h3>
            <form onSubmit={handleContactFormSubmit}>
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleContactFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactFormChange}
                  rows="4"
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-form-btn">
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="similar-cars">
        <h3>You might also like</h3>
        {/* This would be populated with similar cars based on type/price/etc */}
        <p className="coming-soon">Similar cars suggestions coming soon!</p>
      </div>
    </div>
  );
};

export default CarDetails;