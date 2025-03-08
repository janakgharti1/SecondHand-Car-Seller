import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/CompareCar.css";

const CompareCars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [selectedCar1, setSelectedCar1] = useState(null);
  const [selectedCar2, setSelectedCar2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:4000/api/cars");
        setCars(response.data);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const calculatePerformanceScore = (car) => {
    if (!car) return 0;
    return (car.engine / car.price).toFixed(2);
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
          <div className="car-selection">
            <select onChange={(e) => setSelectedCar1(cars.find(car => car._id === e.target.value))}>
              <option value="">Select First Car</option>
              {cars.map(car => (
                <option key={car._id} value={car._id}>{car.carName} - {car.brand} ({car.carYear})</option>
              ))}
            </select>

            <select onChange={(e) => setSelectedCar2(cars.find(car => car._id === e.target.value))}>
              <option value="">Select Second Car</option>
              {cars.map(car => (
                <option key={car._id} value={car._id}>{car.carName} - {car.brand} ({car.carYear})</option>
              ))}
            </select>
          </div>

          {!selectedCar1 && !selectedCar2 && (
            <div className="instructions">
              <i className="fa fa-info-circle"></i> Select two cars from the dropdown menus above to compare their specifications.
            </div>
          )}

          {selectedCar1 && selectedCar2 && (
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
                    <td>{selectedCar1.carYear}</td>
                    <td>{selectedCar2.carYear}</td>
                  </tr>
                  <tr>
                    <td><i className="fa fa-dollar-sign"></i> Price</td>
                    <td>NPR {selectedCar1.price} lakhs</td>
                    <td>NPR {selectedCar2.price} lakhs</td>
                  </tr>
                  <tr>
                    <td><i className="fa fa-road"></i> KMs Driven</td>
                    <td>{selectedCar1.kmsDriven.toLocaleString()} km</td>
                    <td>{selectedCar2.kmsDriven.toLocaleString()} km</td>
                  </tr>
                  <tr>
                    <td><i className="fa fa-map-marker-alt"></i> Location</td>
                    <td>{selectedCar1.location}</td>
                    <td>{selectedCar2.location}</td>
                  </tr>
                  <tr>
                    <td><i className="fa fa-tachometer-alt"></i> Performance Score</td>
                    <td>{calculatePerformanceScore(selectedCar1)}</td>
                    <td>{calculatePerformanceScore(selectedCar2)}</td>
                  </tr>
                </tbody>
              </table>
              
              <button 
                className={`copy-link-btn ${copySuccess ? 'success' : ''}`} 
                onClick={handleCopyLink}
              >
                <i className="fa fa-copy"></i> {copySuccess ? 'Link Copied!' : 'Copy Comparison Link'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CompareCars;