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
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarCars, setSimilarCars] = useState([]);

  useEffect(() => {
    const fetchCarDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:4000/api/cars/${id}`);
        setCar(response.data);

        const similarResponse = await axios.get(
          `http://localhost:4000/api/cars/similar?type=${response.data.carType}&priceRange=${response.data.price}`
        );
        setSimilarCars(similarResponse.data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching car details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  const handlePrevImage = () => {
    if (car && car.gallery && car.gallery.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? car.gallery.length - 1 : prevIndex - 1
      );
    }
  };

  const handleNextImage = () => {
    if (car && car.gallery && car.gallery.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === car.gallery.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handleContactSeller = () => {
    const autoMessage = `Dear Seller, I my interest in your ${car.brand} ${car.carName} (${car.carYear}), listed at NPR ${car.price.toLocaleString()}. Could you please provide additional information regarding its condition, service history, and availability for viewing?`;
    navigate("/contactwithadmin", {
      state: {
        carId: id,
        autoMessage: autoMessage,
        carDetails: {
          brand: car.brand,
          name: car.carName,
          year: car.carYear,
          price: car.price,
        },
      },
    });
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="car-details-container">
        <div className="loading">
          <i className="fa fa-spinner fa-spin"></i>
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
          <button className="back-button" onClick={() => navigate("/usedcar")}>
            Back to All Cars
          </button>
        </div>
      </div>
    );
  }

  const allImages = car.gallery && car.gallery.length > 0 ? car.gallery : [car.featuredImage];
  const displayImage =
    allImages.length > 0
      ? `http://localhost:4000/uploads/${allImages[currentImageIndex]}`
      : "https://via.placeholder.com/800x500";

  return (
    <div className="car-details-container">
      <div className="car-details-header">
        <button className="back-button" onClick={() => navigate("/usedcar")}>
          <i className="fa fa-arrow-left"></i> Back to Cars
        </button>
        <h1>
          {car.brand} {car.carName} ({car.carYear})
          {car.isCertified && <span className="certified-badge">Certified</span>}
        </h1>
        <p className="car-location">
          <i className="fa fa-map-marker-alt"></i> {car.location}
        </p>
      </div>

      <div className="car-details-content">
        <div className="image-gallery">
          <div className="main-image-container">
            <button
              className="gallery-nav prev"
              onClick={handlePrevImage}
              disabled={allImages.length <= 1}
            >
              <i className="fa fa-chevron-left"></i>
            </button>
            <img
              src={displayImage}
              alt={`${car.carName} - view ${currentImageIndex + 1}`}
              className="main-image"
              onError={(e) => (e.target.src = "https://via.placeholder.com/800x500")}
            />
            <button
              className="gallery-nav next"
              onClick={handleNextImage}
              disabled={allImages.length <= 1}
            >
              <i className="fa fa-chevron-right"></i>
            </button>
          </div>
          {allImages.length > 1 && (
            <div className="thumbnail-container">
              {allImages.map((image, index) => (
                <img
                  key={index}
                  src={`http://localhost:4000/uploads/${image}`}
                  alt={`${car.carName} - thumbnail ${index + 1}`}
                  className={`thumbnail ${index === currentImageIndex ? "active" : ""}`}
                  onClick={() => setCurrentImageIndex(index)}
                  onError={(e) => (e.target.src = "https://via.placeholder.com/100x60")}
                />
              ))}
            </div>
          )}
        </div>

        <div className="car-info">
          <div className="price-action">
            <div className="price-box">
              <h2 className="price">NPR {car.price.toLocaleString()}</h2>
              {car.priceNegotiable && <span className="negotiable">Negotiable</span>}
            </div>
            <div className="action-buttons">
              <button className="contact-seller-btn" onClick={handleContactSeller}>
                Contact Seller
              </button>
              <button className="favorite-btn" onClick={toggleFavorite}>
                <i className={`fa fa-heart ${isFavorite ? "filled" : "outline"}`}></i>
              </button>
              <button className="share-btn" onClick={handleShare}>
                <i className="fa fa-share-alt"></i>
              </button>
            </div>
          </div>

          <div className="key-specs">
            <div className="spec-item">
              <i className="fa fa-calendar"></i>
              <div className="spec-details">
                <span className="spec-label">Year</span>
                <span className="spec-value">{car.carYear}</span>
              </div>
            </div>
            <div className="spec-item">
              <i className="fa fa-road"></i>
              <div className="spec-details">
                <span className="spec-label">Kms Driven</span>
                <span className="spec-value">{car.kmsDriven.toLocaleString()} km</span>
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
              <i className="fa fa-cogs"></i>
              <div className="spec-details">
                <span className="spec-label">Transmission</span>
                <span className="spec-value">{car.transmission}</span>
              </div>
            </div>
            <div className="spec-item">
              <i className="fa fa-car"></i>
              <div className="spec-details">
                <span className="spec-label">Car Type</span>
                <span className="spec-value">{car.carType}</span>
              </div>
            </div>
            <div className="spec-item">
              <i className="fa fa-user"></i>
              <div className="spec-details">
                <span className="spec-label">Ownership</span>
                <span className="spec-value">{car.ownership}</span>
              </div>
            </div>
          </div>

          <div className="condition-report">
            <h3>Condition Report</h3>
            <p>{car.condition || "Good condition, minor wear and tear."}</p>
            {car.serviceHistory && (
              <div className="service-history">
                <h4>Service History</h4>
                <p>{car.serviceHistory}</p>
              </div>
            )}
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
                  <td>Engine</td>
                  <td>{car.engine || "N/A"}</td>
                </tr>
                <tr>
                  <td>VIN</td>
                  <td>{car.vin || "N/A"}</td>
                </tr>
                <tr>
                  <td>Registration Number</td>
                  <td>{car.registrationNumber || "N/A"}</td>
                </tr>
                <tr>
                  <td>Insurance Status</td>
                  <td>{car.insuranceStatus || "N/A"}</td>
                </tr>
                <tr>
                  <td>Last Inspected</td>
                  <td>{car.lastInspected || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="similar-cars">
        <h3>You Might Also Like</h3>
        {similarCars.length > 0 ? (
          <div className="similar-cars-list">
            {similarCars.map((similarCar) => (
              <div
                key={similarCar._id}
                className="similar-car-card"
                onClick={() => navigate(`/car/${similarCar._id}`)}
              >
                <img
                  src={`http://localhost:4000/uploads/${similarCar.featuredImage}`}
                  alt={similarCar.carName}
                  onError={(e) => (e.target.src = "https://via.placeholder.com/200x120")}
                />
                <div className="similar-car-info">
                  <h4>{similarCar.brand} {similarCar.carName}</h4>
                  <p>NPR {similarCar.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-similar">No similar cars found.</p>
        )}
      </div>

      <div className="footer-actions">
        <button className="report-btn" onClick={() => alert("Report submitted!")}>
          Report This Listing
        </button>
      </div>
    </div>
  );
};

export default CarDetails;