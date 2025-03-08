import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Styles/ExploreUsedCar.css";

const ExploreUsedCar = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [carTypeFilter, setCarTypeFilter] = useState("");
  const [fuelTypeFilter, setFuelTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch car data from the backend
  useEffect(() => {
    const fetchCars = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:4000/api/cars");
        setCars(response.data);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Get unique locations for dropdown
  const uniqueLocations = [...new Set(cars.map(car => car.location))].sort();

  // Apply filters
  const filteredCars = cars.filter((car) => {
    const matchesSearch = car.carName.toLowerCase().includes(search.toLowerCase());
    const matchesCarType = carTypeFilter ? car.carType === carTypeFilter : true;
    const matchesFuelType = fuelTypeFilter ? car.fuelType === fuelTypeFilter : true;
    const matchesLocation = locationFilter ? car.location === locationFilter : true;
    const matchesBudget = maxBudget ? car.price <= parseFloat(maxBudget) : true;

    return matchesSearch && matchesCarType && matchesFuelType && matchesLocation && matchesBudget;
  });

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setCarTypeFilter("");
    setFuelTypeFilter("");
    setLocationFilter("");
    setMaxBudget("");
  };

  return (
    <div className="explore">
      <div className="explore-header">
        <h1>Find Your Perfect Used Car</h1>
        <p>Browse our collection of quality pre-owned vehicles</p>
      </div>
      
      {/* Search and Filters */}
      <div className="filters-container">
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="text"
              placeholder="Search (Name)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-bar"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="carType">Car Type</label>
            <select
              id="carType"
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
          </div>

          <div className="filter-group">
            <label htmlFor="fuelType">Fuel Type</label>
            <select
              id="fuelType"
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
          </div>

          <div className="filter-group">
            <label htmlFor="location">Location</label>
            <select
              id="location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="dropdown"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="budget">Your Budget</label>
            <input
              id="budget"
              type="number"
              placeholder="Max budget (in lakhs)"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="price-input"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <h2>Found {filteredCars.length} cars matching your criteria</h2>
      </div>

      {/* Car List */}
      <div className="carlist">
        {isLoading ? (
          <div className="no-results">
            <p>Loading cars...</p>
          </div>
        ) : filteredCars.length > 0 ? (
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
                <div className="car-details">
                  <p className="car-detail">
                    <i className="fa fa-gas-pump"></i> {car.fuelType}
                  </p>
                  <p className="car-detail">
                    <i className="fa fa-map-marker-alt"></i> {car.location}
                  </p>
                  <p className="car-detail">
                    <i className="fa fa-road"></i> {car.kmsDriven} km
                  </p>
                </div>
                <p className="car-price">NPR {car.price} lakhs</p>
              </div>
              <button 
                className="view-details-btn" 
                onClick={() => navigate(`/car/${car._id}`)}
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <div className="no-results">
            <i className="fa fa-search"></i>
            <p>No cars found matching your criteria</p>
            <button onClick={resetFilters} className="reset-filters-btn">
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreUsedCar;