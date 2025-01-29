import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CarListingManagement.css";

const CarListingsManagement = () => {
  const [cars, setCars] = useState([]);
  const [formData, setFormData] = useState({
    carName: "",
    carType: "",
    fuelType: "",
    price: "",
    kmsDriven: "",
    location: "",
    featuredImage: "",
  });
  const [editingCarId, setEditingCarId] = useState(null);

  // Fetch car listings from the database
  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/cars");
      setCars(response.data);
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };

  // Handle input change for form fields
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCarId) {
        await axios.put(`http://localhost:4000/api/cars/${editingCarId}`, formData);
      } else {
        await axios.post("http://localhost:4000/api/cars", formData);
      }
      fetchCars();
      setFormData({
        carName: "",
        carType: "",
        fuelType: "",
        price: "",
        kmsDriven: "",
        location: "",
        featuredImage: "",
      });
      setEditingCarId(null);
    } catch (error) {
      console.error("Error saving car:", error);
    }
  };

  // Handle edit button click
  const handleEdit = (car) => {
    setFormData(car);
    setEditingCarId(car._id);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/cars/${id}`);
      fetchCars();
    } catch (error) {
      console.error("Error deleting car:", error);
    }
  };

  return (
    <div className="car-listings-management">
      <h2>Car Listings Management</h2>

      {/* Form for Adding/Editing Cars */}
      <form onSubmit={handleSubmit} className="car-form">
        <input type="text" name="carName" placeholder="Car Name" value={formData.carName} onChange={handleInputChange} required />
        <input type="text" name="carType" placeholder="Car Type" value={formData.carType} onChange={handleInputChange} required />
        <input type="text" name="fuelType" placeholder="Fuel Type" value={formData.fuelType} onChange={handleInputChange} required />
        <input type="number" name="price" placeholder="Price in Lakhs" value={formData.price} onChange={handleInputChange} required />
        <input type="number" name="kmsDriven" placeholder="Kilometers Driven" value={formData.kmsDriven} onChange={handleInputChange} required />
        <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} required />
        <input type="text" name="featuredImage" placeholder="Image URL" value={formData.featuredImage} onChange={handleInputChange} required />

        <button type="submit">{editingCarId ? "Update Car" : "Add Car"}</button>
      </form>

      {/* Car Listings Table */}
      <table className="car-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Type</th>
            <th>Fuel</th>
            <th>Price (Lakhs)</th>
            <th>KMs Driven</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cars.length > 0 ? (
            cars.map((car) => (
              <tr key={car._id}>
                <td><img src={car.featuredImage || "https://via.placeholder.com/100"} alt={car.carName} className="car-thumbnail" /></td>
                <td>{car.carName}</td>
                <td>{car.carType}</td>
                <td>{car.fuelType}</td>
                <td>{car.price}</td>
                <td>{car.kmsDriven}</td>
                <td>{car.location}</td>
                <td>
                  <button onClick={() => handleEdit(car)}>Edit</button>
                  <button onClick={() => handleDelete(car._id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No car listings found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CarListingsManagement;
