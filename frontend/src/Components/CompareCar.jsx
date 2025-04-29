import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth"; // Import onAuthStateChanged
import "../Styles/CompareCar.css";

const CompareCars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [selectedCar1, setSelectedCar1] = useState(null);
  const [selectedCar2, setSelectedCar2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparisonHistory, setComparisonHistory] = useState([]);
  const [filterBrand, setFilterBrand] = useState("");
  const [filterType, setFilterType] = useState("");
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [userUID, setUserUID] = useState(null); // Add state for current user

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserUID(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:4000/api/cars");
        
        // Filter cars to exclude those uploaded by the current user
        const filteredCars = response.data.filter(car => 
          car.userId !== userUID // Exclude current user's cars
        );
        
        setCars(filteredCars);
        
        // Extract unique brands and types for filters
        const brands = [...new Set(filteredCars.map(car => car.brand))];
        const types = [...new Set(filteredCars.map(car => car.carType))];
        setAvailableBrands(brands);
        setAvailableTypes(types);
        
        // Load comparison history from localStorage
        const savedHistory = localStorage.getItem('comparisonHistory');
        if (savedHistory) {
          setComparisonHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, [userUID]); // Add userUID as dependency to re-fetch when user changes

  const calculatePerformanceScore = (car) => {
    if (!car) return 0;
    return (car.engine / car.price).toFixed(2);
  };

  const calculateFuelEfficiency = (car) => {
    if (!car) return "N/A";
    // Simple calculation based on common metrics
    // Lower is better for fuel consumption
    const efficiency = car.carType === "Electric" ? "N/A" : (car.price / car.carYear * 0.8).toFixed(1);
    return efficiency === "N/A" ? efficiency : `${efficiency} km/l`;
  };

  const calculateMaintenanceIndex = (car) => {
    if (!car) return 0;
    // Higher means more expensive to maintain
    const age = new Date().getFullYear() - car.carYear;
    const kmFactor = car.kmsDriven / 10000;
    return (age * 0.6 + kmFactor * 0.4).toFixed(1);
  };

  const saveComparison = () => {
    if (selectedCar1 && selectedCar2) {
      const newComparison = {
        id: Date.now(),
        car1: selectedCar1.carName,
        car2: selectedCar2.carName,
        date: new Date().toLocaleDateString()
      };
      
      const updatedHistory = [newComparison, ...comparisonHistory].slice(0, 5);
      setComparisonHistory(updatedHistory);
      localStorage.setItem('comparisonHistory', JSON.stringify(updatedHistory));
    }
  };

  const clearComparison = () => {
    setSelectedCar1(null);
    setSelectedCar2(null);
  };

  const filteredCars = cars.filter(car => {
    return (!filterBrand || car.brand === filterBrand) && 
           (!filterType || car.carType === filterType);
  });

  const highlightBetterValue = (value1, value2, higherIsBetter = true) => {
    if (value1 === value2) return "tie";
    if (value1 === "N/A" || value2 === "N/A") return "tie";
    
    const num1 = parseFloat(value1);
    const num2 = parseFloat(value2);
    
    if (isNaN(num1) || isNaN(num2)) return "tie";
    
    if (higherIsBetter) {
      return num1 > num2 ? "better-1" : "better-2";
    } else {
      return num1 < num2 ? "better-1" : "better-2";
    }
  };

  return (
    <div className="compare-cars">
      <button className="back-btn" onClick={() => navigate("/")}>
        <i className="fa fa-arrow-left"></i> Back to Home
      </button>
      <h2>
        <i className="fa fa-car"></i> Compare Cars
      </h2>

      {loading ? (
        <div className="loading">
          <i className="fa fa-spinner fa-spin"></i> Loading cars...
        </div>
      ) : (
        <>
          <div className="filters">
            <div className="filter-group">
              <label><i className="fa fa-filter"></i> Filter by:</label>
              <select 
                value={filterBrand} 
                onChange={(e) => setFilterBrand(e.target.value)}
              >
                <option value="">All Brands</option>
                {availableBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                {availableTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <button className="reset-btn" onClick={() => {
                setFilterBrand("");
                setFilterType("");
              }}>
                <i className="fa fa-times"></i> Reset Filters
              </button>
            </div>
          </div>

          <div className="car-selection">
            <select onChange={(e) => setSelectedCar1(cars.find(car => car._id === e.target.value))}>
              <option value="">Select First Car</option>
              {filteredCars.map(car => (
                <option key={car._id} value={car._id}>{car.carName} - {car.brand} ({car.carYear})</option>
              ))}
            </select>

            <select onChange={(e) => setSelectedCar2(cars.find(car => car._id === e.target.value))}>
              <option value="">Select Second Car</option>
              {filteredCars.map(car => (
                <option key={car._id} value={car._id}>{car.carName} - {car.brand} ({car.carYear})</option>
              ))}
            </select>
          </div>

          {!selectedCar1 && !selectedCar2 && comparisonHistory.length > 0 && (
            <div className="comparison-history">
              <h3><i className="fa fa-history"></i> Recent Comparisons</h3>
              <ul>
                {comparisonHistory.map(comp => (
                  <li key={comp.id}>
                    <span>{comp.car1} vs {comp.car2}</span>
                    <span className="history-date">{comp.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!selectedCar1 && !selectedCar2 && (
            <div className="instructions">
              <i className="fa fa-info-circle"></i> Select two cars from the dropdown menus above to compare their specifications.
            </div>
          )}

          {selectedCar1 && selectedCar2 && (
            <>
              <div className="comparison-actions">
                <button className="save-btn" onClick={saveComparison}>
                  <i className="fa fa-save"></i> Save Comparison
                </button>
                <button className="clear-btn" onClick={clearComparison}>
                  <i className="fa fa-trash"></i> Clear Selection
                </button>
              </div>
            
              <div className="comparison-table">
                <table>
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>{selectedCar1.carName}</th>
                      <th>{selectedCar2.carName}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><i className="fa fa-image"></i> Image</td>
                      <td><img src={`http://localhost:4000/uploads/${selectedCar1.featuredImage}`} alt={selectedCar1.carName} className="car-image" /></td>
                      <td><img src={`http://localhost:4000/uploads/${selectedCar2.featuredImage}`} alt={selectedCar2.carName} className="car-image" /></td>
                    </tr>
                    <tr>
                      <td><i className="fa fa-car"></i> Brand</td>
                      <td>{selectedCar1.brand}</td>
                      <td>{selectedCar2.brand}</td>
                    </tr>
                    <tr>
                      <td><i className="fa fa-list"></i> Type</td>
                      <td>{selectedCar1.carType}</td>
                      <td>{selectedCar2.carType}</td>
                    </tr>
                    <tr>
                      <td><i className="fa fa-cogs"></i> Transmission</td>
                      <td>{selectedCar1.transmission}</td>
                      <td>{selectedCar2.transmission}</td>
                    </tr>
                    <tr>
                      <td><i className="fa fa-gas-pump"></i> Fuel Type</td>
                      <td>{selectedCar1.fuelType}</td>
                      <td>{selectedCar2.fuelType}</td>
                    </tr>
                    <tr>
                      <td><i className="fa fa-calendar"></i> Year</td>
                      <td className={highlightBetterValue(selectedCar1.carYear, selectedCar2.carYear, true)}>
                        {selectedCar1.carYear}
                      </td>
                      <td className={highlightBetterValue(selectedCar2.carYear, selectedCar1.carYear, true)}>
                        {selectedCar2.carYear}
                      </td>
                    </tr>
                    <tr>
                      <td><i className="fa fa-dollar-sign"></i> Price</td>
                      <td className={highlightBetterValue(selectedCar1.price, selectedCar2.price, false)}>
                        NPR {selectedCar1.price} lakhs
                      </td>
                      <td className={highlightBetterValue(selectedCar2.price, selectedCar1.price, false)}>
                        NPR {selectedCar2.price} lakhs
                      </td>
                    </tr>
                    <tr>
                      <td><i className="fa fa-road"></i> KMs Driven</td>
                      <td className={highlightBetterValue(selectedCar1.kmsDriven, selectedCar2.kmsDriven, false)}>
                        {selectedCar1.kmsDriven.toLocaleString()} km
                      </td>
                      <td className={highlightBetterValue(selectedCar2.kmsDriven, selectedCar1.kmsDriven, false)}>
                        {selectedCar2.kmsDriven.toLocaleString()} km
                      </td>
                    </tr>
                    <tr>
                      <td><i className="fa fa-map-marker-alt"></i> Location</td>
                      <td>{selectedCar1.location}</td>
                      <td>{selectedCar2.location}</td>
                    </tr>
                    <tr>
                      <td><i className="fa fa-tachometer-alt"></i> Performance Score</td>
                      <td className={highlightBetterValue(calculatePerformanceScore(selectedCar1), calculatePerformanceScore(selectedCar2), true)}>
                        {calculatePerformanceScore(selectedCar1)}
                      </td>
                      <td className={highlightBetterValue(calculatePerformanceScore(selectedCar2), calculatePerformanceScore(selectedCar1), true)}>
                        {calculatePerformanceScore(selectedCar2)}
                      </td>
                    </tr>
                    <tr>
                      <td><i className="fa fa-gas-pump"></i> Fuel Efficiency</td>
                      <td className={highlightBetterValue(calculateFuelEfficiency(selectedCar1), calculateFuelEfficiency(selectedCar2), true)}>
                        {calculateFuelEfficiency(selectedCar1)}
                      </td>
                      <td className={highlightBetterValue(calculateFuelEfficiency(selectedCar2), calculateFuelEfficiency(selectedCar1), true)}>
                        {calculateFuelEfficiency(selectedCar2)}
                      </td>
                    </tr>
                    <tr>
                      <td><i className="fa fa-wrench"></i> Maintenance Index</td>
                      <td className={highlightBetterValue(calculateMaintenanceIndex(selectedCar1), calculateMaintenanceIndex(selectedCar2), false)}>
                        {calculateMaintenanceIndex(selectedCar1)}
                      </td>
                      <td className={highlightBetterValue(calculateMaintenanceIndex(selectedCar2), calculateMaintenanceIndex(selectedCar1), false)}>
                        {calculateMaintenanceIndex(selectedCar2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="verdict-section">
                  <h3><i className="fa fa-balance-scale"></i> Quick Verdict</h3>
                  <div className="verdict-content">
                    {selectedCar1 && selectedCar2 && (
                      <div className="verdict-text">
                        <p>
                          <strong>Value for Money:</strong> {
                            selectedCar1.price < selectedCar2.price ? 
                              `${selectedCar1.carName} is more affordable by NPR ${(selectedCar2.price - selectedCar1.price).toFixed(2)} lakhs.` : 
                              `${selectedCar2.carName} is more affordable by NPR ${(selectedCar1.price - selectedCar2.price).toFixed(2)} lakhs.`
                          }
                        </p>
                        <p>
                          <strong>Age and Usage:</strong> {
                            selectedCar1.carYear > selectedCar2.carYear ? 
                              `${selectedCar1.carName} is newer by ${selectedCar1.carYear - selectedCar2.carYear} years.` : 
                              selectedCar1.carYear < selectedCar2.carYear ?
                                `${selectedCar2.carName} is newer by ${selectedCar2.carYear - selectedCar1.carYear} years.` :
                                "Both cars are from the same year."
                          }
                        </p>
                        <p>
                          <strong>Overall Recommendation:</strong> {
                            calculatePerformanceScore(selectedCar1) > calculatePerformanceScore(selectedCar2) ?
                              `${selectedCar1.carName} offers better overall performance for the price.` :
                              `${selectedCar2.carName} offers better overall performance for the price.`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CompareCars;