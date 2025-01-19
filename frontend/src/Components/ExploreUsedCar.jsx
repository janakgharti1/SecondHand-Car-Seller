import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/ExploreUsedCar.css";

const ExploreUsedCar = () => {
  const [cars, setCars] = useState([]); // State to hold car data from MongoDB
  const [search] = useState(""); // State to hold search query

  // Fetch car data from the backend when the component mounts
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/cars");
        setCars(response.data); // Set the cars data into state
      } catch (error) {
        console.error("Error fetching cars:", error);
      }
    };

    fetchCars();
  }, []); // Empty dependency array to run once when the component mounts

  // Filter cars based on the search query
  const filteredCars = cars.filter((car) =>
    car.carName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="explore">
      <div className="carlist">
        {filteredCars.length > 0 ? (
          filteredCars.map((car) => (
            <div key={car._id} className="car-card">
              <div className="card-header">
                <span className="car-type">{car.carType.toUpperCase()}</span>
                <img
                  src={car.featuredImage ? `http://localhost:4000/uploads/${car.featuredImage}` : "https://via.placeholder.com/300x200"}
                  alt={car.carName}
                  className="car-image"
                />
              </div>
              <div className="card-body">
                <h3 className="car-name">{car.carName}</h3>
                <p>
                  <i className="fa fa-gas-pump"></i> {car.fuelType} &nbsp; | &nbsp;
                  <i className="fa fa-map-marker-alt"></i> {car.location}
                </p>
                <p>
                  <i className="fa fa-road"></i> {car.kmsDriven} km
                </p>
                <p className="car-price">Price: NPR {car.price} lakhs</p>
              </div>
              <button className="view-details-btn">View More Details</button>
            </div>
          ))
        ) : (
          <p>No cars found</p>
        )}
      </div>
    </div>
  );
};

export default ExploreUsedCar;
