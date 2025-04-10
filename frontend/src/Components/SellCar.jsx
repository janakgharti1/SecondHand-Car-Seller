import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/SellCar.css";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const SellCar = () => {
  const [formData, setFormData] = useState({
    brand: "",
    customBrand: "",
    carType: "",
    customCarType: "",
    transmission: "",
    fuelType: "",
    carYear: "",
    ownership: "",
    carName: "",
    kmsDriven: "",
    price: "",
    location: "",
    customLocation: "",
    engine: "",
    description: "",
    featuredImage: null,
    gallery: Array(8).fill(null),
    picWithCar: null,
    vin: "",
    registrationNumber: "",
    insuranceStatus: "",
    verificationDoc: null,
  });

  const [message, setMessage] = useState("");
  const [userUID, setUserUID] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid);
      } else {
        setUserUID(null);
        setMessage("Please log in to list a car.");
      }
    });
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
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    }
  };

  const handleAgreementChange = (e) => setAgreementAccepted(e.target.checked);

  const resetForm = () => {
    setFormData({
      brand: "",
      customBrand: "",
      carType: "",
      customCarType: "",
      transmission: "",
      fuelType: "",
      carYear: "",
      ownership: "",
      carName: "",
      kmsDriven: "",
      price: "",
      location: "",
      customLocation: "",
      engine: "",
      description: "",
      featuredImage: null,
      gallery: Array(8).fill(null),
      picWithCar: null,
      vin: "",
      registrationNumber: "",
      insuranceStatus: "",
      verificationDoc: null,
    });
    setAgreementAccepted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (!userUID) {
      setMessage("Please log in to submit the car details.");
      setIsLoading(false);
      return;
    }

    if (!agreementAccepted) {
      setMessage("You must agree to the commission terms.");
      setIsLoading(false);
      return;
    }

    const finalBrand = formData.brand === "Other" ? formData.customBrand : formData.brand;
    const finalCarType = formData.carType === "Other" ? formData.customCarType : formData.carType;
    const finalLocation = formData.location === "Other" ? formData.customLocation : formData.location;

    if (!finalBrand || !finalCarType || !formData.transmission || !formData.fuelType ||
        !formData.carYear || !formData.ownership || !formData.carName || !formData.kmsDriven ||
        !formData.price || !finalLocation || !formData.engine || !formData.description ||
        !formData.featuredImage || !formData.picWithCar || !formData.vin ||
        !formData.registrationNumber || !formData.insuranceStatus) {
      setMessage("Please fill all required fields.");
      setIsLoading(false);
      return;
    }

    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(formData.vin)) {
      setMessage("VIN must be 17 characters (letters A-H, J-N, P-R, Z or numbers).");
      setIsLoading(false);
      return;
    }

    if (Number(formData.carYear) < 1990 || Number(formData.carYear) > new Date().getFullYear()) {
      setMessage(`Car year must be between 1990 and ${new Date().getFullYear()}.`);
      setIsLoading(false);
      return;
    }

    if (Number(formData.kmsDriven) < 0) {
      setMessage("Kilometers driven cannot be negative.");
      setIsLoading(false);
      return;
    }

    if (Number(formData.price) < 10000) {
      setMessage("Price must be at least NPR 1000.");
      setIsLoading(false);
      return;
    }

    const galleryImages = formData.gallery.filter(file => file !== null);
    if (galleryImages.length < 2) {
      setMessage("At least 2 gallery images are required.");
      setIsLoading(false);
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const uploadData = new FormData();

      const fields = {
        brand: finalBrand,
        carType: finalCarType,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        carYear: formData.carYear,
        ownership: formData.ownership,
        carName: formData.carName,
        kmsDriven: formData.kmsDriven,
        price: formData.price,
        location: finalLocation,
        engine: formData.engine,
        description: formData.description,
        vin: formData.vin,
        registrationNumber: formData.registrationNumber,
        insuranceStatus: formData.insuranceStatus,
        agreementAccepted: agreementAccepted.toString(),
        status: "pending", // Ensure new listings start as pending
      };

      Object.entries(fields).forEach(([key, value]) => uploadData.append(key, value));
      uploadData.append("featuredImage", formData.featuredImage);
      galleryImages.forEach(file => uploadData.append("gallery", file));
      uploadData.append("picWithCar", formData.picWithCar);
      if (formData.verificationDoc) uploadData.append("verificationDoc", formData.verificationDoc);

      const response = await axios.post("http://localhost:4000/api/cars", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(response.data.message);
      resetForm();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error uploading car details. Please try again.");
      console.error("Submission error:", err);
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
          <select name="brand" value={formData.brand} onChange={handleInputChange} required>
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
          {formData.brand === "Other" && (
            <input
              type="text"
              name="customBrand"
              placeholder="Enter custom brand"
              value={formData.customBrand}
              onChange={handleInputChange}
              required
              className="custom-input"
            />
          )}

          <label>
            <i className="fa fa-car-side"></i> Car Type
          </label>
          <select name="carType" value={formData.carType} onChange={handleInputChange} required>
            <option value="">Select Car Type</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Luxury">Luxury</option>
            <option value="MUV">MUV</option>
            <option value="Other">Other</option>
          </select>
          {formData.carType === "Other" && (
            <input
              type="text"
              name="customCarType"
              placeholder="Enter custom car type"
              value={formData.customCarType}
              onChange={handleInputChange}
              required
              className="custom-input"
            />
          )}

          <label>
            <i className="fa fa-cogs"></i> Transmission
          </label>
          <select name="transmission" value={formData.transmission} onChange={handleInputChange} required>
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
          <select name="fuelType" value={formData.fuelType} onChange={handleInputChange} required>
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
            max={new Date().getFullYear()}
            required
          />

          <label>
            <i className="fa fa-user"></i> Ownership
          </label>
          <select name="ownership" value={formData.ownership} onChange={handleInputChange} required>
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
            placeholder="Price (NPR)"
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
          <select name="location" value={formData.location} onChange={handleInputChange} required>
            <option value="">Select Location</option>
            <option value="Kathmandu">Kathmandu</option>
            <option value="Lalitpur">Lalitpur</option>
            <option value="Bhaktapur">Bhaktapur</option>
            <option value="Pokhara">Pokhara</option>
            <option value="Other">Other</option>
          </select>
          {formData.location === "Other" && (
            <input
              type="text"
              name="customLocation"
              placeholder="Enter custom location"
              value={formData.customLocation}
              onChange={handleInputChange}
              required
              className="custom-input"
            />
          )}

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
        />

        <div className="file-upload">
          <label>
            <i className="fa fa-image"></i> Featured Image
          </label>
          <input
            type="file"
            name="featuredImage"
            onChange={(e) => handleFileChange(e)}
            accept="image/jpeg,image/png,image/jpg"
            required
          />
          {formData.featuredImage && <span className="file-name">{formData.featuredImage.name}</span>}
        </div>

        <div className="gallery">
          <p className="gallery-instruction">Please upload at least 2 gallery images</p>
          <div className="gallery-grid">
            {formData.gallery.map((image, index) => (
              <div key={index} className="gallery-item">
                <label className={image ? "has-image" : ""}>
                  {image ? (
                    <span className="file-selected"><i className="fa fa-check"></i></span>
                  ) : (
                    <span className="add-image">+</span>
                  )}
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, index)}
                    accept="image/jpeg,image/png,image/jpg"
                    style={{ display: "none" }}
                  />
                </label>
                {image && <span className="file-name">{image.name}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="pic-with-car-section">
          <label>
            <i className="fa fa-user-friends"></i> Picture with Car <span className="required">*</span>
          </label>
          <p className="instruction">Upload a clear picture of yourself with the car for verification.</p>
          <input
            type="file"
            name="picWithCar"
            onChange={(e) => handleFileChange(e)}
            accept="image/jpeg,image/png,image/jpg"
            required
          />
          {formData.picWithCar && <span className="file-name">{formData.picWithCar.name}</span>}
        </div>

        <div className="verification-section">
          <h3>Vehicle Verification</h3>
          <div className="form-row">
            <label>
              <i className="fa fa-id-card"></i> VIN (Vehicle Identification Number)
            </label>
            <input
              type="text"
              name="vin"
              placeholder="Enter VIN (17 characters)"
              value={formData.vin}
              onChange={handleInputChange}
              maxLength="17"
              pattern="[A-HJ-NPR-Z0-9]{17}"
              title="VIN must be 17 characters (A-H, J-N, P-R, Z, 0-9)"
              required
            />

            <label>
              <i className="fa fa-registered"></i> Registration Number
            </label>
            <input
              type="text"
              name="registrationNumber"
              placeholder="Enter Registration Number"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <label>
              <i className="fa fa-shield-alt"></i> Insurance Status
            </label>
            <select name="insuranceStatus" value={formData.insuranceStatus} onChange={handleInputChange} required>
              <option value="">Select Insurance Status</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Not Insured">Not Insured</option>
            </select>
          </div>

          <div className="file-upload">
            <label>
              <i className="fa fa-file-upload"></i> Verification Document (Optional)
            </label>
            <input
              type="file"
              name="verificationDoc"
              onChange={(e) => handleFileChange(e)}
              accept="image/jpeg,image/png,image/jpg,application/pdf"
            />
            {formData.verificationDoc && <span className="file-name">{formData.verificationDoc.name}</span>}
          </div>
        </div>

        <div className="agreement-section">
          <label className="agreement-checkbox">
            <input
              type="checkbox"
              checked={agreementAccepted}
              onChange={handleAgreementChange}
              required
            />
            I agree that 10% of the entered price (NPR {formData.price ? (formData.price * 0.1).toLocaleString('en-IN') : '0'})
            will be paid to the app owner as commission upon successful sale.
          </label>
        </div>

        <button className="submitbtn" type="submit" disabled={isLoading || !userUID}>
          {isLoading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {message && <p className={`message ${message.includes("Error") ? "error" : "success"}`}>{message}</p>}
    </div>
  );
};

export default SellCar;