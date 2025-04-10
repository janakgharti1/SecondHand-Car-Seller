import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase"; // Assuming you have this configured
import { onAuthStateChanged } from "firebase/auth";
import "../Styles/ExploreUsedCar.css";

const ExploreUsedCar = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [carTypeFilter, setCarTypeFilter] = useState("");
  const [fuelTypeFilter, setFuelTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [transmissionFilter, setTransmissionFilter] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [minYear, setMinYear] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [userUID, setUserUID] = useState(null); // Added to track current user
  const carsPerPage = 6;

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserUID(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:4000/api/cars");
        // Filter approved cars and exclude current user's cars
        const approvedCars = response.data.filter(car => 
          car.status === "approved" && 
          car.userId !== userUID // Assuming your car objects have a userId field
        );
        setCars(approvedCars);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();
  }, [userUID]); // Added userUID as dependency

  const uniqueLocations = [...new Set(cars.map(car => car.location))].sort();
  const uniqueCarTypes = [...new Set(cars.map(car => car.carType))].sort();
  const uniqueFuelTypes = [...new Set(cars.map(car => car.fuelType))].sort();
  const uniqueTransmissions = [...new Set(cars.map(car => car.transmission))].sort();

  const filteredCars = cars.filter((car) => {
    const matchesSearch = car.carName.toLowerCase().includes(search.toLowerCase()) ||
                          car.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCarType = carTypeFilter ? car.carType === carTypeFilter : true;
    const matchesFuelType = fuelTypeFilter ? car.fuelType === fuelTypeFilter : true;
    const matchesLocation = locationFilter ? car.location === locationFilter : true;
    const matchesTransmission = transmissionFilter ? car.transmission === transmissionFilter : true;
    const matchesBudget = maxBudget ? car.price <= parseFloat(maxBudget) : true;
    const matchesYear = minYear ? car.carYear >= parseInt(minYear) : true;

    return matchesSearch && matchesCarType && matchesFuelType && matchesLocation && 
           matchesTransmission && matchesBudget && matchesYear;
  });

  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar);
  const totalPages = Math.ceil(filteredCars.length / carsPerPage);

  const resetFilters = () => {
    setSearch("");
    setCarTypeFilter("");
    setFuelTypeFilter("");
    setLocationFilter("");
    setTransmissionFilter("");
    setMaxBudget("");
    setMinYear("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="explore">
      <div className="explore-header">
        <h1>Find Your Perfect Used Car</h1>
        <p>Browse our collection of quality pre-owned vehicles</p>
      </div>

      <div className="filters-container">
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="text"
              placeholder="Search by Name or Brand"
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
              {uniqueCarTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
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
              {uniqueFuelTypes.map(fuel => (
                <option key={fuel} value={fuel}>{fuel}</option>
              ))}
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
            <label htmlFor="transmission">Transmission</label>
            <select
              id="transmission"
              value={transmissionFilter}
              onChange={(e) => setTransmissionFilter(e.target.value)}
              className="dropdown"
            >
              <option value="">All Transmissions</option>
              {uniqueTransmissions.map(trans => (
                <option key={trans} value={trans}>{trans}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="budget">Max Budget</label>
            <input
              id="budget"
              type="number"
              placeholder="Max budget (NPR)"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="price-input"
              min="0"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="minYear">Min Year</label>
            <input
              id="minYear"
              type="number"
              placeholder="Min year (e.g., 2010)"
              value={minYear}
              onChange={(e) => setMinYear(e.target.value)}
              className="year-input"
              min="1990"
              max={new Date().getFullYear()}
            />
          </div>

          <button onClick={resetFilters} className="reset-filters-btn">
            Reset Filters
          </button>
        </div>
      </div>

      <div className="results-summary">
        <h2>Found {filteredCars.length} cars matching your criteria</h2>
      </div>

      <div className="carlist">
        {isLoading ? (
          <div className="no-results">
            <p>Loading cars...</p>
            <i className="fa fa-spinner fa-spin"></i>
          </div>
        ) : currentCars.length > 0 ? (
          currentCars.map((car) => (
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
                  onError={(e) => (e.target.src = "https://via.placeholder.com/300x200")}
                />
              </div>
              <div className="card-body">
                <h3 className="car-name">{car.brand} {car.carName} ({car.carYear})</h3>
                <div className="car-details">
                  <p className="car-detail">
                    <i className="fa fa-gas-pump"></i> {car.fuelType}
                  </p>
                  <p className="car-detail">
                    <i className="fa fa-cogs"></i> {car.transmission}
                  </p>
                  <p className="car-detail">
                    <i className="fa fa-map-marker-alt"></i> {car.location}
                  </p>
                  <p className="car-detail">
                    <i className="fa fa-road"></i> {car.kmsDriven.toLocaleString()} km
                  </p>
                  <p className="car-detail">
                    <i className="fa fa-user"></i> {car.ownership}
                  </p>
                </div>
                <p className="car-price">NPR {car.price.toLocaleString()}</p>
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

      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="page-btn"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`page-btn ${currentPage === page ? "active" : ""}`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ExploreUsedCar;