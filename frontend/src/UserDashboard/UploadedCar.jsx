import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "../UserDashboard/UploadedCar.css";

const UploadedCar = () => {
  const [cars, setCars] = useState([]);
  const [userUID, setUserUID] = useState(null);
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null); // For error state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserCars = useCallback(async () => {
    if (!userUID) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get("http://localhost:4000/api/cars/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCars(response.data);
    } catch (error) {
      setError("Error fetching user cars.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [userUID]);

  useEffect(() => {
    fetchUserCars();
  }, [fetchUserCars]);

  return (
    <div className="container">
      <div className="header">
        <h2>My Uploaded Cars</h2>
      </div>

      {loading ? (
        <p>Loading cars...</p>
      ) : error ? (
        <p>{error}</p>
      ) : cars.length > 0 ? (
        <table className="car-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Brand</th>
              <th>Car Type</th>
              <th>Fuel Type</th>
              <th>Transmission</th>
              <th>Year</th>
              <th>Ownership</th>
              <th>Kms Driven</th>
              <th>Engine</th>
              <th>Location</th>
              <th>Price</th>
              <th>Description</th>
              <th>Sold</th>
              <th>Expired</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car._id}>
                <td>{car.carName}</td>
                <td>{car.brand}</td>
                <td>{car.carType}</td>
                <td>{car.fuelType}</td>
                <td>{car.transmission}</td>
                <td>{car.carYear}</td>
                <td>{car.ownership}</td>
                <td>{car.kmsDriven}</td>
                <td>{car.engine}</td>
                <td>{car.location}</td>
                <td>{car.price}</td>
                <td>{car.description}</td>
                <td>{car.sold ? "Yes" : "No"}</td>
                <td>{car.expired ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No cars uploaded for this user.</p>
      )}
    </div>
  );
};

export default UploadedCar;
