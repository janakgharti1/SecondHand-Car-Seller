import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../ExploreCars/CarDetails.css";

const CarDetails = () => {
  const { id } = useParams(); // Get car ID from URL
  const navigate = useNavigate();
  const [car, setCar] = useState(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/cars/${id}`);
        setCar(response.data);
      } catch (error) {
        console.error("Error fetching car details:", error);
      }
    };
    fetchCarDetails();
  }, [id]);

  if (!car) {
    return <p>Loading car details...</p>;
  }

  return (
    <div className="car-details">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <h2>{car.carName}</h2>
      <p><strong>Brand:</strong> {car.brand}</p>
      <p><strong>Type:</strong> {car.carType} | <strong>Transmission:</strong> {car.transmission} | <strong>Fuel:</strong> {car.fuelType}</p>
      <p><strong>Year:</strong> {car.carYear} | <strong>Ownership:</strong> {car.ownership}</p>
      <p><strong>Engine:</strong> {car.engine} | <strong>KMs Driven:</strong> {car.kmsDriven}</p>
      <p className="car-price">Price: NPR {car.price} lakhs</p>
      <p><strong>Location:</strong> {car.location}</p>
      <p><strong>Description:</strong> {car.description}</p>

      {/* Image Gallery */}
      <div className="gallery">
        <img
          src={car.featuredImage ? `http://localhost:4000/uploads/${car.featuredImage}` : "https://via.placeholder.com/200"}
          alt="Featured"
          className="car-image"
        />
        {car.images && car.images.map((image, index) => (
          <img key={index} src={`http://localhost:4000/uploads/${image}`} alt={`Car ${index}`} className="car-image" />
        ))}
      </div>

      {/* Seller Information */}
      <div className="seller-info">
        <h3>Seller Information</h3>
        <p><strong>Name:</strong> {car.sellerName}</p>
        <p><strong>Contact:</strong> {car.sellerContact}</p>
        <p><strong>Location:</strong> {car.sellerLocation}</p>
      </div>

      {/* Car Inspection Report */}
      <div className="inspection-report">
        <h3>Car Inspection Report</h3>
        <p><strong>Accident History:</strong> {car.accidentHistory || "No records available"}</p>
        <p><strong>Service Records:</strong> {car.serviceRecords || "No records available"}</p>
        <p><strong>Certification:</strong> {car.certification || "Not certified"}</p>
      </div>

      {/* Buy Now Button */}
      <button className="buy-now-btn">Buy Now</button>
    </div>
  );
};

export default CarDetails;