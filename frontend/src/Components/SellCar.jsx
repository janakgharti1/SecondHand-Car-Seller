import React, { useState } from "react";
import axios from "axios";
import "../Styles/SellCar.css";

const SellCar = () => {
  const [formData, setFormData] = useState({
    brand: "",
    carType: "",
    transmission: "",
    fuelType: "",
    carYear: "",
    ownership: "",
    carName: "",
    kmsDriven: "",
    price: "",
    location: "",
    engine: "",
    description: "",
    featuredImage: null,
    gallery: Array(8).fill(null),
  });

  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, index = null) => {
    if (index !== null) {
      const newGallery = [...formData.gallery];
      newGallery[index] = e.target.files[0];
      setFormData({ ...formData, gallery: newGallery });
    } else {
      setFormData({ ...formData, featuredImage: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate at least two images in the gallery
    const galleryImages = formData.gallery.filter((file) => file !== null);
    if (galleryImages.length < 2) {
      setMessage("At least 2 gallery images are required.");
      return;
    }

    // Create FormData object
    const uploadData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "gallery") {
        formData.gallery.forEach((file, index) => {
          if (file) {
            uploadData.append(`gallery`, file);
          }
        });
      } else if (key === "featuredImage") {
        if (formData.featuredImage) {
          uploadData.append("featuredImage", formData.featuredImage);
        }
      } else {
        uploadData.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post("http://localhost:4000/api/cars", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message || "Car details uploaded successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Error uploading car details.");
    }
  };

  return (
    <div className="sell-car-container">
      <form className="sell-car-form" onSubmit={handleSubmit}>
        <h2>SELL YOUR CAR</h2>
        <div className="form-row">
          <select name="brand" value={formData.brand} onChange={handleInputChange}>
            <option value="">Brand</option>
            <option value="Toyota">Toyota</option>
            <option value="Honda">Honda</option>
            <option value="Ford">Ford</option>
          </select>
          <select name="carType" value={formData.carType} onChange={handleInputChange}>
            <option value="">Car Type</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
          </select>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleInputChange}
          >
            <option value="">Transmission</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
        </div>

        <div className="form-row">
          <select name="fuelType" value={formData.fuelType} onChange={handleInputChange}>
            <option value="">Fuel Type</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
          </select>
          <input
            type="number"
            name="carYear"
            placeholder="Car Year"
            value={formData.carYear}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="ownership"
            placeholder="Ownership"
            value={formData.ownership}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-row">
          <input
            type="text"
            name="carName"
            placeholder="Car Name"
            value={formData.carName}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="kmsDriven"
            placeholder="Kms Driven"
            value={formData.kmsDriven}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="price"
            placeholder="Price (₹)"
            value={formData.price}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-row">
          <select name="location" value={formData.location} onChange={handleInputChange}>
            <option value="">Location</option>
            <option value="Kathmandu">Kathmandu</option>
            <option value="Lalitpur">Lalitpur</option>
          </select>
          <input
            type="text"
            name="engine"
            placeholder="Engine (CC)"
            value={formData.engine}
            onChange={handleInputChange}
          />
        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleInputChange}
        ></textarea>

        <div className="file-upload">
          <label>Featured Image for Listing</label>
          <input type="file" onChange={(e) => handleFileChange(e)} />
        </div>

        <div className="gallery">
          {formData.gallery.map((image, index) => (
            <div key={index} className="gallery-item">
              <label>
                +
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, index)}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          ))}
        </div>

        <button className="submitbtn" type="submit">
          Submit
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default SellCar;

