import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Users/VehicleVerification.css';

const VehicleVerification = ({ carData, onVerificationComplete }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    registrationNumber: '',
    chassisNumber: '',
    engineNumber: '',
    registrationDate: '',
    insuranceStatus: 'valid',
    ownershipHistory: '1',
    documentImages: [],
    selfieWithCar: null
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (name === 'documentImages') {
      setFormData({
        ...formData,
        [name]: [...formData.documentImages, ...files]
      });
    } else {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const removeDocumentImage = (index) => {
    const updatedImages = [...formData.documentImages];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      documentImages: updatedImages
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.registrationNumber) {
      newErrors.registrationNumber = 'Registration number is required';
    } else if (!/^[A-Z0-9]{6,10}$/.test(formData.registrationNumber)) {
      newErrors.registrationNumber = 'Enter a valid registration number';
    }
    
    if (!formData.chassisNumber) {
      newErrors.chassisNumber = 'Chassis number is required';
    } else if (formData.chassisNumber.length < 17) {
      newErrors.chassisNumber = 'Chassis number should be at least 17 characters';
    }
    
    if (!formData.engineNumber) {
      newErrors.engineNumber = 'Engine number is required';
    }
    
    if (!formData.registrationDate) {
      newErrors.registrationDate = 'Registration date is required';
    }
    
    if (formData.documentImages.length === 0) {
      newErrors.documentImages = 'Please upload at least one document image';
    }
    
    if (!formData.selfieWithCar) {
      newErrors.selfieWithCar = 'Please upload a photo of yourself with the car';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo(0, 0); // Scroll to top to show errors
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Mock API call - replace with your actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Combine car data with verification data
      const completeData = {
        ...carData,
        verification: formData
      };
      
      console.log('Verification completed with data:', completeData);
      
      // Call the callback function from parent component
      if (onVerificationComplete) {
        onVerificationComplete(completeData);
      }
      
      // Navigate to success page or next step
      navigate('/verification-success');
    } catch (error) {
      console.error('Verification submission error:', error);
      setErrors({
        submit: 'There was an error submitting your verification. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="verification-container">
      <h2 className="verification-title">Vehicle Verification</h2>
      
      {errors.submit && (
        <div className="error-alert">
          {errors.submit}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="verification-form">
        <div className="form-section">
          <h3 className="section-title">Vehicle Documentation</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Registration Number*
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className={`form-input ${errors.registrationNumber ? 'input-error' : ''}`}
                placeholder="e.g. AB12CDE"
              />
              {errors.registrationNumber && (
                <p className="error-message">{errors.registrationNumber}</p>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Chassis Number (VIN)*
              </label>
              <input
                type="text"
                name="chassisNumber"
                value={formData.chassisNumber}
                onChange={handleInputChange}
                className={`form-input ${errors.chassisNumber ? 'input-error' : ''}`}
                placeholder="17-character VIN"
              />
              {errors.chassisNumber && (
                <p className="error-message">{errors.chassisNumber}</p>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Engine Number*
              </label>
              <input
                type="text"
                name="engineNumber"
                value={formData.engineNumber}
                onChange={handleInputChange}
                className={`form-input ${errors.engineNumber ? 'input-error' : ''}`}
                placeholder="Engine number"
              />
              {errors.engineNumber && (
                <p className="error-message">{errors.engineNumber}</p>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label">
                First Registration Date*
              </label>
              <input
                type="date"
                name="registrationDate"
                value={formData.registrationDate}
                onChange={handleInputChange}
                className={`form-input ${errors.registrationDate ? 'input-error' : ''}`}
              />
              {errors.registrationDate && (
                <p className="error-message">{errors.registrationDate}</p>
              )}
            </div>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Insurance Status
              </label>
              <select
                name="insuranceStatus"
                value={formData.insuranceStatus}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="valid">Valid</option>
                <option value="expired">Expired</option>
                <option value="none">No Insurance</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Number of Previous Owners
              </label>
              <select
                name="ownershipHistory"
                value={formData.ownershipHistory}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="1">1 (First Owner)</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5+">5 or more</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3 className="section-title">Document Verification</h3>
          
          <div className="form-group">
            <label className="form-label">
              Upload Vehicle Documents* (Registration Certificate, Insurance, Service History)
            </label>
            <div className="file-upload-container">
              <input
                type="file"
                name="documentImages"
                onChange={handleFileChange}
                multiple
                accept="image/*,.pdf"
                className={`file-input ${errors.documentImages ? 'input-error' : ''}`}
              />
              {errors.documentImages && (
                <p className="error-message">{errors.documentImages}</p>
              )}
            </div>
            
            {formData.documentImages.length > 0 && (
              <div className="file-preview-grid">
                {Array.from(formData.documentImages).map((file, index) => (
                  <div key={index} className="file-preview-item">
                    <div className="file-preview">
                      <div className="file-name">
                        {file.name}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocumentImage(index)}
                      className="delete-file-btn"
                      aria-label="Remove file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Upload a Photo of Yourself with the Car*
            </label>
            <input
              type="file"
              name="selfieWithCar"
              onChange={handleFileChange}
              accept="image/*"
              className={`file-input ${errors.selfieWithCar ? 'input-error' : ''}`}
            />
            {errors.selfieWithCar && (
              <p className="error-message">{errors.selfieWithCar}</p>
            )}
            {formData.selfieWithCar && (
              <div className="file-selected">
                <p>
                  File selected: {formData.selfieWithCar.name}
                </p>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <div className="info-box">
              <h4 className="info-title">Why do we need these details?</h4>
              <p className="info-text">
                Verification helps us ensure that all vehicles listed on our platform are genuine.
                This protects both buyers and sellers from fraud and ensures a safe marketplace.
                Your information is securely stored and only used for verification purposes.
              </p>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
            disabled={isLoading}
          >
            Back
          </button>
          <button
            type="submit"
            className={`btn-primary ${isLoading ? 'btn-loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Verification'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleVerification;