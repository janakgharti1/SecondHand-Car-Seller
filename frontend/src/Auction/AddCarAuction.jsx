import React, { useState, useRef } from 'react';
import { FaCar, FaUpload, FaCamera, FaInfoCircle, FaDollarSign, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import './AddCarAuction.css';

const AddCarAuction = () => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    make: '',
    model: '',
    year: '',
    mileage: '',
    vinNumber: '',
    description: '',
    condition: 'Good',
    startingBid: '',
    reservePrice: '',
    buyNowPrice: '',
    duration: 7,
    location: '',
    images: []
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [previewImages, setPreviewImages] = useState([]);
  const [activeSection, setActiveSection] = useState(1);
  
  const conditions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
  const durations = [3, 5, 7, 10, 14, 21, 30];
  const carMakes = [
    'Audi', 'BMW', 'Chevrolet', 'Dodge', 'Ferrari', 'Ford', 'Honda', 
    'Hyundai', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 
    'Lexus', 'Mazda', 'Mercedes-Benz', 'Nissan', 'Porsche', 'Subaru', 
    'Tesla', 'Toyota', 'Volkswagen', 'Volvo', 'Mahindra', 'Tata', 'Maruti Suzuki', 'Other'
  ];
  
  // Nepali cities
  const nepalCities = [
    'Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Biratnagar', 
    'Birgunj', 'Dharan', 'Nepalgunj', 'Butwal', 'Hetauda', 'Janakpur', 
    'Dhangadhi', 'Itahari', 'Kirtipur', 'Tulsipur', 'Damak', 'Mechinagar', 
    'Ghorahi', 'Tikapur', 'Lumbini', 'Other'
  ];
  
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
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Handle image uploads
  const handleImageUpload = (e) => {
    const fileList = Array.from(e.target.files);
    
    if (fileList.length + previewImages.length > 20) {
      setErrors({
        ...errors,
        images: 'Maximum 20 images allowed'
      });
      return;
    }
    
    // Create preview URLs
    const previews = fileList.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPreviewImages([...previewImages, ...previews]);
    setFormData({
      ...formData,
      images: [...formData.images, ...fileList]
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
  
  // Set featured image (move to first position)
  const setFeaturedImage = (index) => {
    if (index === 0) return; // Already featured
    
    const updatedPreviews = [...previewImages];
    const featured = updatedPreviews.splice(index, 1)[0];
    updatedPreviews.unshift(featured);
    
    const updatedFiles = [...formData.images];
    const featuredFile = updatedFiles.splice(index, 1)[0];
    updatedFiles.unshift(featuredFile);
    
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
    } else if (isNaN(formData.year) || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
    }
    
    if (!formData.mileage.trim()) {
      newErrors.mileage = 'Mileage is required';
    } else if (isNaN(formData.mileage) || Number(formData.mileage) < 0) {
      newErrors.mileage = 'Please enter a valid mileage';
    }
    
    if (formData.vinNumber && formData.vinNumber.length !== 17) {
      newErrors.vinNumber = 'VIN should be 17 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 100) {
      newErrors.description = 'Description should be at least 100 characters';
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
    
    if (formData.buyNowPrice && (isNaN(formData.buyNowPrice) || Number(formData.buyNowPrice) <= 0)) {
      newErrors.buyNowPrice = 'Please enter a valid amount';
    }
    
    if (formData.buyNowPrice && formData.reservePrice && Number(formData.buyNowPrice) <= Number(formData.reservePrice)) {
      newErrors.buyNowPrice = 'Buy Now price should be higher than reserve price';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Move to next section
  const nextSection = (e) => {
    e.preventDefault();
    setActiveSection(activeSection + 1);
    window.scrollTo(0, 0);
  };
  
  // Move to previous section
  const prevSection = (e) => {
    e.preventDefault();
    setActiveSection(activeSection - 1);
    window.scrollTo(0, 0);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Reset success message if it exists
    if (successMessage) setSuccessMessage('');
    
    if (!validateForm()) {
      // Find first section with error
      if (errors.title || errors.make || errors.model || errors.year || 
          errors.mileage || errors.vinNumber || errors.description) {
        setActiveSection(1);
      } else if (errors.startingBid || errors.reservePrice || errors.buyNowPrice || 
                errors.duration || errors.location) {
        setActiveSection(2);
      } else {
        setActiveSection(3);
      }
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulating API call with progress
    const timer = setTimeout(() => {
      // Here you would normally send the form data to your backend
      console.log('Form data submitted:', formData);
      
      // Reset form after successful submission
      setFormData({
        title: '',
        make: '',
        model: '',
        year: '',
        mileage: '',
        vinNumber: '',
        description: '',
        condition: 'Good',
        startingBid: '',
        reservePrice: '',
        buyNowPrice: '',
        duration: 7,
        location: '',
        images: []
      });
      setPreviewImages([]);
      setIsSubmitting(false);
      setSuccessMessage('Your car has been successfully listed for auction! Redirecting to your listings...');
      
      // Clear success message and redirect after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
        // In a real app, you would redirect to the listings page
        // window.location.href = '/my-listings';
      }, 5000);
    }, 2500);
    
    return () => clearTimeout(timer);
  };
  
  // Determine if section is complete (for progress indicator)
  const isSectionComplete = (section) => {
    if (section === 1) {
      return formData.title && formData.make && formData.model && 
             formData.year && formData.description && !errors.title && 
             !errors.make && !errors.model && !errors.year && !errors.description;
    } else if (section === 2) {
      return formData.startingBid && formData.location && 
             !errors.startingBid && !errors.location;
    } else if (section === 3) {
      return formData.images.length > 0 && !errors.images;
    }
    return false;
  };
  
  // Render progress bar
  const renderProgressBar = () => {
    return (
      <div className="progress-container">
        <div className="progress-steps">
          <div 
            className={`progress-step ${activeSection >= 1 ? 'active' : ''} ${isSectionComplete(1) ? 'complete' : ''}`}
            onClick={() => setActiveSection(1)}
          >
            <div className="step-number">1</div>
            <div className="step-label">Car Details</div>
          </div>
          <div className="progress-line"></div>
          <div 
            className={`progress-step ${activeSection >= 2 ? 'active' : ''} ${isSectionComplete(2) ? 'complete' : ''}`}
            onClick={() => setActiveSection(2)}
          >
            <div className="step-number">2</div>
            <div className="step-label">Auction Settings</div>
          </div>
          <div className="progress-line"></div>
          <div 
            className={`progress-step ${activeSection >= 3 ? 'active' : ''} ${isSectionComplete(3) ? 'complete' : ''}`}
            onClick={() => setActiveSection(3)}
          >
            <div className="step-number">3</div>
            <div className="step-label">Photos</div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="add-auction-container">
      <h1 className="add-auction-title">
        <FaCar className="title-icon" />
        List Your Car for Auction
      </h1>
      
      {successMessage && (
        <div className="success-message">
          <FaInfoCircle className="success-icon" />
          {successMessage}
        </div>
      )}
      
      {renderProgressBar()}
      
      <form className="add-auction-form" onSubmit={handleSubmit}>
        {/* Section 1: Car Details */}
        {activeSection === 1 && (
          <div className="form-section">
            <h3 className="section-title">
              <FaCar className="section-icon" />
              Car Details
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Listing Title*</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. 2018 Honda City - Well Maintained"
                  className={errors.title ? 'error' : ''}
                />
                {errors.title && <div className="error-text">{errors.title}</div>}
                <div className="form-hint">Create a descriptive title that highlights key features of your car</div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="make">Make*</label>
                <select
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  className={errors.make ? 'error' : ''}
                >
                  <option value="" disabled>Select Make</option>
                  {carMakes.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
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
                  placeholder="e.g. City ZX"
                  className={errors.model ? 'error' : ''}
                />
                {errors.model && <div className="error-text">{errors.model}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="year">Year*</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g. 2018"
                  className={errors.year ? 'error' : ''}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
                {errors.year && <div className="error-text">{errors.year}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="mileage">Mileage (KM)*</label>
                <input
                  type="text"
                  id="mileage"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  placeholder="e.g. 45000"
                  className={errors.mileage ? 'error' : ''}
                />
                {errors.mileage && <div className="error-text">{errors.mileage}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="vinNumber">VIN Number <span className="optional">(Optional)</span></label>
                <input
                  type="text"
                  id="vinNumber"
                  name="vinNumber"
                  value={formData.vinNumber}
                  onChange={handleChange}
                  placeholder="e.g. 1HGCM82633A004352"
                  className={errors.vinNumber ? 'error' : ''}
                  maxLength="17"
                />
                {errors.vinNumber && <div className="error-text">{errors.vinNumber}</div>}
                <div className="form-hint">Providing a VIN helps verify your vehicle's authenticity</div>
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
                  placeholder="Provide a detailed description including history, features, modifications, service records, etc. The more details you provide, the more likely you are to attract serious bidders."
                  rows="8"
                  className={errors.description ? 'error' : ''}
                ></textarea>
                {errors.description && <div className="error-text">{errors.description}</div>}
                <div className="character-count">
                  {formData.description.length} characters
                  {formData.description.length < 100 && 
                    ` (${100 - formData.description.length} more required)`}
                </div>
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
                <div className="form-hint">
                  <strong>Excellent:</strong> Like new, minimal wear<br />
                  <strong>Very Good:</strong> Minor wear, well-maintained<br />
                  <strong>Good:</strong> Normal wear for age, fully functional<br />
                  <strong>Fair:</strong> Noticeable wear, may need minor repairs<br />
                  <strong>Poor:</strong> Significant wear, needs restoration
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="next-button"
                onClick={nextSection}
              >
                Continue to Auction Settings
              </button>
            </div>
          </div>
        )}
        
        {/* Section 2: Auction Settings */}
        {activeSection === 2 && (
          <div className="form-section">
            <h3 className="section-title">
              <FaDollarSign className="section-icon" />
              Auction Settings
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startingBid">Starting Bid (NPR)*</label>
                <div className="currency-input">
                  <span className="currency-symbol">रू</span>
                  <input
                    type="number"
                    id="startingBid"
                    name="startingBid"
                    value={formData.startingBid}
                    onChange={handleChange}
                    placeholder="e.g. 500000"
                    className={errors.startingBid ? 'error' : ''}
                    min="1"
                  />
                </div>
                {errors.startingBid && <div className="error-text">{errors.startingBid}</div>}
                <div className="form-hint">This is the minimum opening bid for your auction</div>
              </div>
              
              <div className="form-group">
                <label htmlFor="reservePrice">Reserve Price (NPR) <span className="optional">(Optional)</span></label>
                <div className="currency-input">
                  <span className="currency-symbol">रू</span>
                  <input
                    type="number"
                    id="reservePrice"
                    name="reservePrice"
                    value={formData.reservePrice}
                    onChange={handleChange}
                    placeholder="Minimum price you'll accept"
                    className={errors.reservePrice ? 'error' : ''}
                    min="1"
                  />
                </div>
                {errors.reservePrice && <div className="error-text">{errors.reservePrice}</div>}
                <div className="form-hint">Your car won't sell unless bidding reaches this amount</div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="buyNowPrice">Buy Now Price (NPR) <span className="optional">(Optional)</span></label>
                <div className="currency-input">
                  <span className="currency-symbol">रू</span>
                  <input
                    type="number"
                    id="buyNowPrice"
                    name="buyNowPrice"
                    value={formData.buyNowPrice}
                    onChange={handleChange}
                    placeholder="Price for immediate purchase"
                    className={errors.buyNowPrice ? 'error' : ''}
                    min="1"
                  />
                </div>
                {errors.buyNowPrice && <div className="error-text">{errors.buyNowPrice}</div>}
                <div className="form-hint">Allows buyers to purchase immediately at this price</div>
              </div>
              
              <div className="form-group">
                <label htmlFor="duration">Auction Duration*</label>
                <div className="select-with-icon">
                  <FaCalendarAlt className="select-icon" />
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
                <div className="form-hint">Longer durations may attract more bidders</div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location*</label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={errors.location ? 'error' : ''}
                >
                  <option value="" disabled>Select City</option>
                  {nepalCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.location && <div className="error-text">{errors.location}</div>}
                <div className="form-hint">City where the car is located in Nepal</div>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="back-button"
                onClick={prevSection}
              >
                Back to Car Details
              </button>
              <button 
                type="button" 
                className="next-button"
                onClick={nextSection}
              >
                Continue to Photos
              </button>
            </div>
          </div>
        )}
        
        {/* Section 3: Images */}
        {activeSection === 3 && (
          <div className="form-section">
            <h3 className="section-title">
              <FaCamera className="section-icon" />
              Photos
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="images">Upload Photos* <span className="optional">(Max 20)</span></label>
                <div className="file-upload-area" onClick={triggerFileInput}>
                  <input
                    type="file"
                    id="images"
                    name="images"
                    onChange={handleImageUpload}
                    multiple
                    accept="image/*"
                    className={errors.images ? 'error' : ''}
                    ref={fileInputRef}
                  />
                  <FaUpload className="upload-icon" />
                  <div className="upload-text">
                    <p className="upload-title">Drag photos here or click to browse</p>
                    <p className="upload-subtitle">JPEG, PNG or WebP • Max 20 photos • First photo will be featured</p>
                  </div>
                </div>
                {errors.images && <div className="error-text">{errors.images}</div>}
                <div className="form-hint">
                  <strong>Photo Tips:</strong> Include exterior (all sides), interior, engine bay, 
                  trunk/boot, any damage or flaws, and special features
                </div>
              </div>
            </div>
            
            {previewImages.length > 0 && (
              <div className="image-preview-section">
                <h4 className="preview-title">
                  {previewImages.length} Photo{previewImages.length !== 1 ? 's' : ''} 
                  {previewImages.length > 0 && ' (first is featured)'}
                </h4>
                <div className="image-preview-container">
                  {previewImages.map((image, index) => (
                    <div key={index} className={`image-preview-item ${index === 0 ? 'featured' : ''}`}>
                      <img src={image.preview} alt={`Preview ${index}`} className="image-preview" />
                      <div className="image-actions">
                        {index !== 0 && (
                          <button 
                            type="button" 
                            className="set-featured-btn"
                            onClick={() => setFeaturedImage(index)}
                            title="Set as featured"
                          >
                            <FaCamera />
                          </button>
                        )}
                        <button 
                          type="button" 
                          className="remove-image-btn"
                          onClick={() => removeImage(index)}
                          title="Remove image"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      {index === 0 && <div className="featured-badge">Featured</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="form-actions">
              <button 
                type="button" 
                className="back-button"
                onClick={prevSection}
              >
                Back to Auction Settings
              </button>
              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Listing Your Car...
                  </>
                ) : 'List Car for Auction'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddCarAuction;