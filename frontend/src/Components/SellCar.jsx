import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/SellCar.css";
import { auth } from "../firebase"; // Import your Firebase config file
import { onAuthStateChanged } from "firebase/auth"; // Import auth state listener

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
  const [userUID, setUserUID] = useState(null); // Store the user's UID

  // Get user UID on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid); // Set the UID if the user is authenticated
      } else {
        setMessage("User not authenticated.");
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

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

    // Check if the user is authenticated
    if (!userUID) {
      setMessage("Please log in to submit the car details.");
      return;
    }

    try {
      // Get Firebase authentication token
      const token = await auth.currentUser.getIdToken();

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

      // Add the user UID to the FormData
      uploadData.append("userId", userUID);

      // Make API request with the token in headers
      const response = await axios.post("http://localhost:4000/api/cars", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Include token here
        },
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
          <label>
            <i className="fa fa-car"></i> Brand
          </label>
          <select name="brand" value={formData.brand} onChange={handleInputChange}>
            <option value="">Select Brand</option>
            <option value="Toyota">Toyota</option>
            <option value="Honda">Honda</option>
            <option value="Ford">Ford</option>
          </select>

          <label>
            <i className="fa fa-car-side"></i> Car Type
          </label>
          <select name="carType" value={formData.carType} onChange={handleInputChange}>
            <option value="">Select Car Type</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
          </select>

          <label>
            <i className="fa fa-cogs"></i> Transmission
          </label>
          <select name="transmission" value={formData.transmission} onChange={handleInputChange}>
            <option value="">Select Transmission</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
        </div>

        <div className="form-row">
          <label>
            <i className="fa fa-gas-pump"></i> Fuel Type
          </label>
          <select name="fuelType" value={formData.fuelType} onChange={handleInputChange}>
            <option value="">Select Fuel Type</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
          </select>

          <label>
            <i className="fa fa-calendar-alt"></i> Car Year
          </label>
          <input
            type="number"
            name="carYear"
            placeholder="Year"
            value={formData.carYear}
            onChange={handleInputChange}
          />

          <label>
            <i className="fa fa-user"></i> Ownership
          </label>
          <input
            type="text"
            name="ownership"
            placeholder="Ownership"
            value={formData.ownership}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-row">
          <label>
            <i className="fa fa-car"></i> Car Name
          </label>
          <input
            type="text"
            name="carName"
            placeholder="Car Name"
            value={formData.carName}
            onChange={handleInputChange}
          />

          <label>
            <i className="fa fa-road"></i> Kms Driven
          </label>
          <input
            type="number"
            name="kmsDriven"
            placeholder="Kms Driven"
            value={formData.kmsDriven}
            onChange={handleInputChange}
          />

          <label>
           <i className="fa fa-coins"></i>  Price
          </label>
          <input
            type="number"
            name="price"
            placeholder="Price (₹)"
            value={formData.price}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-row">
          <label>
            <i className="fa fa-map-marker-alt"></i> Location
          </label>
          <select name="location" value={formData.location} onChange={handleInputChange}>
            <option value="">Select Location</option>
            <option value="Kathmandu">Kathmandu</option>
            <option value="Lalitpur">Lalitpur</option>
          </select>

          <label>
            <i className="fa fa-cogs"></i> Engine
          </label>
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
          <label>
            <i className="fa fa-image"></i> Featured Image
          </label>
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
