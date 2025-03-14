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
  const [isLoading, setIsLoading] = useState(false);

  // Get user UID on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid); // Set the UID if the user is authenticated
      } else {
        setMessage("User not authenticated.");
        // Optionally redirect to login page
        // navigate("/login");
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
    setIsLoading(true);
    setMessage("");

    // Validate form data
    if (!formData.brand || !formData.carType || !formData.transmission ||
      !formData.fuelType || !formData.carYear || !formData.carName ||
      !formData.kmsDriven || !formData.price || !formData.location ||
      !formData.engine || !formData.description || !formData.featuredImage) {
      setMessage("Please fill all required fields");
      setIsLoading(false);
      return;
    }

    // Validate at least two images in the gallery
    const galleryImages = formData.gallery.filter((file) => file !== null);
    if (galleryImages.length < 2) {
      setMessage("At least 2 gallery images are required.");
      setIsLoading(false);
      return;
    }

    // Check if the user is authenticated
    if (!userUID) {
      setMessage("Please log in to submit the car details.");
      setIsLoading(false);
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

      const response = await axios.post("http://localhost:4000/api/cars", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Include token here
        },
      });

      // Success message
      setMessage(response.data.message || "Car details uploaded successfully!");

    } catch (err) {
      console.error("Error submitting car details:", err);
      setMessage(err.response?.data?.message || "Error uploading car details. Please try again.");
    } finally {
      setIsLoading(false);
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
          <select
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Brand</option>
            <option value="Toyota">Toyota</option>
            <option value="Honda">Honda</option>
            <option value="Ford">Ford</option>
            <option value="Hyundai">Hyundai</option>
            <option value="Tata">Tata</option>
            <option value="Maruti">Maruti</option>
            <option value="Mahindra">Mahindra</option>
            <option value="Other">Other</option>
          </select>

          <label>
            <i className="fa fa-car-side"></i> Car Type
          </label>
          <select
            name="carType"
            value={formData.carType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Car Type</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Luxury">Luxury</option>
            <option value="MUV">MUV</option>
            <option value="Other">Other</option>
          </select>

          <label>
            <i className="fa fa-cogs"></i> Transmission
          </label>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Transmission</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
            <option value="Semi-Automatic">Semi-Automatic</option>
          </select>
        </div>

        <div className="form-row">
          <label>
            <i className="fa fa-gas-pump"></i> Fuel Type
          </label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Fuel Type</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
            <option value="CNG">CNG</option>
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
            min="1990"
            max="2025"
            required
          />

          <label>
            <i className="fa fa-user"></i> Ownership
          </label>
          <select
            name="ownership"
            value={formData.ownership}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Ownership</option>
            <option value="1st">1st Owner</option>
            <option value="2nd">2nd Owner</option>
            <option value="3rd">3rd Owner</option>
            <option value="4th or more">4th or more</option>
          </select>
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
            required
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
            min="0"
            required
          />

          <label>
            <i className="fa fa-coins"></i> Price
          </label>
          <input
            type="number"
            name="price"
            placeholder="Price (₹)"
            value={formData.price}
            onChange={handleInputChange}
            min="1000"
            required
          />
        </div>

        <div className="form-row">
          <label>
            <i className="fa fa-map-marker-alt"></i> Location
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Location</option>
            <option value="Kathmandu">Kathmandu</option>
            <option value="Lalitpur">Lalitpur</option>
            <option value="Bhaktapur">Bhaktapur</option>
            <option value="Pokhara">Pokhara</option>
            <option value="Other">Other</option>
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
            required
          />
        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows="4"
        ></textarea>

        <div className="file-upload">
          <label>
            <i className="fa fa-image"></i> Featured Image
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e)}
            accept="image/*"
            required
          />
          {formData.featuredImage && (
            <span className="file-name">{formData.featuredImage.name}</span>
          )}
        </div>

        <div className="gallery">
          <p className="gallery-instruction">Please upload at least 2 gallery images</p>
          <div className="gallery-grid">
            {formData.gallery.map((image, index) => (
              <div key={index} className="gallery-item">
                <label className={image ? "has-image" : ""}>
                  {image ? (
                    <span className="file-selected">
                      <i className="fa fa-check"></i>
                    </span>
                  ) : (
                    <span className="add-image">+</span>
                  )}
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, index)}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </label>
                {image && (
                  <span className="file-name">{image.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          className="submitbtn"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {message && <p className={`message ${message.includes("Error") ? "error" : "success"}`}>{message}</p>}
    </div>
  );
};

export default SellCar;