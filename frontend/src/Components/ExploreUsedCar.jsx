import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Styles/ExploreUsedCar.css";

const ExploreUsedCar = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]); // State to hold car data
  const [search, setSearch] = useState(""); // State for search query
  const [carTypeFilter, setCarTypeFilter] = useState(""); // State for car type filter
  const [fuelTypeFilter, setFuelTypeFilter] = useState(""); // State for fuel type filter
  const [minPrice, setMinPrice] = useState(""); // State for minimum price filter
  const [maxPrice, setMaxPrice] = useState(""); // State for maximum price filter

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
  }, []);

  // Filter cars based on search, dropdown filters, and price range
  const filteredCars = cars.filter((car) => {
    const matchesSearch = car.carName.toLowerCase().includes(search.toLowerCase());
    const matchesCarType = carTypeFilter ? car.carType === carTypeFilter : true;
    const matchesFuelType = fuelTypeFilter ? car.fuelType === fuelTypeFilter : true;
    const matchesMinPrice = minPrice ? car.price >= parseFloat(minPrice) : true;
    const matchesMaxPrice = maxPrice ? car.price <= parseFloat(maxPrice) : true;

    return matchesSearch && matchesCarType && matchesFuelType && matchesMinPrice && matchesMaxPrice;
  });

  return (
    <div className="explore">
      {/* Search and Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by car name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />

        <select
          value={carTypeFilter}
          onChange={(e) => setCarTypeFilter(e.target.value)}
          className="dropdown"
        >
          <option value="">All Car Types</option>
          <option value="SUV">SUV</option>
          <option value="Sedan">Sedan</option>
          <option value="Hatchback">Hatchback</option>
          <option value="Truck">Truck</option>
        </select>

        <select
          value={fuelTypeFilter}
          onChange={(e) => setFuelTypeFilter(e.target.value)}
          className="dropdown"
        >
          <option value="">All Fuel Types</option>
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="Electric">Electric</option>
          <option value="Hybrid">Hybrid</option>
        </select>

        {/* Price Filters */}
        <input
          type="number"
          placeholder="Min Price (in lakhs)"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="price-input"
        />
        <input
          type="number"
          placeholder="Max Price (in lakhs)"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="price-input"
        />
      </div>

      {/* Car List */}
      <div className="carlist">
        {filteredCars.length > 0 ? (
          filteredCars.map((car) => (
            <div key={car._id} className="car-card">
              <div className="card-header">
                <span className="car-type">{car.carType.toUpperCase()}</span>
                <img
                  src={
                    car.featuredImage
                      ? `http://localhost:4000/uploads/${car.featuredImage}`
                      : "https://via.placeholder.com/300x200"
                  }
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
              <button className="view-details-btn" onClick={() => navigate(`/car/${car._id}`)}>View More Details</button>
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
