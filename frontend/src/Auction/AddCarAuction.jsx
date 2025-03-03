import React, { useState } from 'react';
import '../Auction/AddCarAuction.css';

const AddCarAuction = () => {
  const [formData, setFormData] = useState({
    title: '',
    make: '',
    model: '',
    year: '',
    description: '',
    condition: 'Good',
    startingBid: '',
    reservePrice: '',
    duration: 7,
    images: []
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [previewImages, setPreviewImages] = useState([]);
  
  const conditions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
  const durations = [3, 5, 7, 10, 14];
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Handle image uploads
  const handleImageUpload = (e) => {
    const fileList = Array.from(e.target.files);
    
    if (fileList.length > 10) {
      setErrors({
        ...errors,
        images: 'Maximum 10 images allowed'
      });
      return;
    }
    
    // Create preview URLs
    const previews = fileList.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPreviewImages(previews);
    setFormData({
      ...formData,
      images: fileList
    });
    
    // Clear error for images if it exists
    if (errors.images) {
      setErrors({
        ...errors,
        images: null
      });
    }
  };
  
  // Remove a preview image
  const removeImage = (index) => {
    const updatedPreviews = [...previewImages];
    updatedPreviews.splice(index, 1);
    
    const updatedFiles = [...formData.images];
    updatedFiles.splice(index, 1);
    
    setPreviewImages(updatedPreviews);
    setFormData({
      ...formData,
      images: updatedFiles
    });
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.make.trim()) newErrors.make = 'Make is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    
    if (!formData.year) {
      newErrors.year = 'Year is required';
    } else if (isNaN(formData.year) || formData.year < 1900 || formData.year > new Date().getFullYear()) {
      newErrors.year = 'Please enter a valid year';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description should be at least 50 characters';
    }
    
    if (!formData.startingBid) {
      newErrors.startingBid = 'Starting bid is required';
    } else if (isNaN(formData.startingBid) || Number(formData.startingBid) <= 0) {
      newErrors.startingBid = 'Please enter a valid amount';
    }
    
    if (formData.reservePrice && (isNaN(formData.reservePrice) || Number(formData.reservePrice) <= 0)) {
      newErrors.reservePrice = 'Please enter a valid amount';
    }
    
    if (formData.reservePrice && Number(formData.reservePrice) < Number(formData.startingBid)) {
      newErrors.reservePrice = 'Reserve price should be higher than starting bid';
    }
    
    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Reset success message if it exists
    if (successMessage) setSuccessMessage('');
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // In a real application, you would upload images to your server
    // and then create the auction listing with the image URLs
    
    // Simulating API call
    setTimeout(() => {
      // Here you would normally send the form data to your backend
      console.log('Form data submitted:', formData);
      
      // Reset form after successful submission
      setFormData({
        title: '',
        make: '',
        model: '',
        year: '',
        description: '',
        condition: 'Good',
        startingBid: '',
        reservePrice: '',
        duration: 7,
        images: []
      });
      setPreviewImages([]);
      setIsSubmitting(false);
      setSuccessMessage('Your car has been successfully added to the auction!');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }, 1500);
  };
  
  return (
    <div className="add-auction-container">
      <h2 className="add-auction-title">Add Your Car to Auction</h2>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      <form className="add-auction-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="section-title">Car Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Listing Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. 1967 Ford Mustang Shelby GT500"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <div className="error-text">{errors.title}</div>}
            </div>
          </div>
          
          <div className="form-row three-columns">
            <div className="form-group">
              <label htmlFor="make">Make*</label>
              <input
                type="text"
                id="make"
                name="make"
                value={formData.make}
                onChange={handleChange}
                placeholder="e.g. Ford"
                className={errors.make ? 'error' : ''}
              />
              {errors.make && <div className="error-text">{errors.make}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="model">Model*</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. Mustang"
                className={errors.model ? 'error' : ''}
              />
              {errors.model && <div className="error-text">{errors.model}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="year">Year*</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="e.g. 1967"
                className={errors.year ? 'error' : ''}
              />
              {errors.year && <div className="error-text">{errors.year}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="description">Description*</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a detailed description of your car including history, features, modifications, etc."
                rows="5"
                className={errors.description ? 'error' : ''}
              ></textarea>
              {errors.description && <div className="error-text">{errors.description}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="condition">Condition*</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              >
                {conditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3 className="section-title">Auction Settings</h3>
          
          <div className="form-row two-columns">
            <div className="form-group">
              <label htmlFor="startingBid">Starting Bid ($)*</label>
              <input
                type="number"
                id="startingBid"
                name="startingBid"
                value={formData.startingBid}
                onChange={handleChange}
                placeholder="e.g. 50000"
                className={errors.startingBid ? 'error' : ''}
              />
              {errors.startingBid && <div className="error-text">{errors.startingBid}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="reservePrice">Reserve Price ($) <span className="optional">(Optional)</span></label>
              <input
                type="number"
                id="reservePrice"
                name="reservePrice"
                value={formData.reservePrice}
                onChange={handleChange}
                placeholder="Minimum price you'll accept"
                className={errors.reservePrice ? 'error' : ''}
              />
              {errors.reservePrice && <div className="error-text">{errors.reservePrice}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Auction Duration (Days)*</label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
              >
                {durations.map(days => (
                  <option key={days} value={days}>{days} days</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3 className="section-title">Images</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="images">Upload Photos* <span className="optional">(Max 10)</span></label>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleImageUpload}
                  multiple
                  accept="image/*"
                  className={`file-upload ${errors.images ? 'error' : ''}`}
                />
                <div className="upload-button">Choose Photos</div>
              </div>
              {errors.images && <div className="error-text">{errors.images}</div>}
            </div>
          </div>
          
          {previewImages.length > 0 && (
            <div className="image-preview-container">
              {previewImages.map((image, index) => (
                <div key={index} className="image-preview-item">
                  <img src={image.preview} alt={`Preview ${index}`} className="image-preview" />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding your car...' : 'Add Car to Auction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCarAuction;