import React from 'react';
import './HelpandSupport.css';

const HelpandSupport = () => {
  return (
    <div className="help-support-container">
      <div className="help-support-content">
        <h2>Help & Support</h2>
        
        <div className="business-info">
          <h3>About Second-Hand Car Seller</h3>
          <p>
            SecondHand Car Seller is Nepal's leading platform for buying and selling pre-owned vehicles.
            We provide a secure and transparent marketplace for car enthusiasts and sellers.
          </p>
        </div>

        <div className="contact-section">
          <h3>Contact Information</h3>
          <div className="contact-grid">
            <div className="contact-card">
              <i className="fas fa-envelope"></i>
              <h4>Email</h4>
              <p>sushantmagar162@gmail.com</p>
            </div>
            
            <div className="contact-card">
              <i className="fas fa-phone"></i>
              <h4>Phone</h4>
              <p>+977-9822944526</p>
              <p>+977-9822942356</p>
            </div>
            
            <div className="contact-card">
              <i className="fas fa-map-marker-alt"></i>
              <h4>Address</h4>
              <p>Dillibazar, Kathmandu</p>
              <p>Nepal</p>
            </div>
            
            <div className="contact-card">
              <i className="fas fa-clock"></i>
              <h4>Business Hours</h4>
              <p>Sunday - Friday: 9:00 AM - 6:00 PM</p>
              <p>Saturday: 10:00 AM - 4:00 PM</p>
            </div>
          </div>
        </div>

        <div className="faq-section">
          <h3>Frequently Asked Questions</h3>
          <div className="faq-list">
            <div className="faq-item">
              <h4>How do I list my car for sale?</h4>
              <p>You can list your car by clicking on the "Sell Car" button in the navigation menu and filling out the required information.</p>
            </div>
            
            <div className="faq-item">
              <h4>What documents do I need to sell my car?</h4>
              <p>You'll need your vehicle registration certificate, image with car, and a valid government-issued ID.</p>
            </div>
            
            <div className="faq-item">
              <h4>How do I verify a car's condition?</h4>
              <p>We provide detailed vehicle inspection reports and encourage buyers to schedule test drives before purchase.</p>
            </div>
          </div>
        </div>

        <div className="social-media">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <button 
              className="social-icon"
              onClick={() => window.open('https://facebook.com/secondhandcarseller', '_blank')}
              aria-label="Visit our Facebook page"
            >
              <i className="fab fa-facebook"></i>
            </button>
            <button 
              className="social-icon"
              onClick={() => window.open('https://instagram.com/secondhandcarseller', '_blank')}
              aria-label="Visit our Instagram page"
            >
              <i className="fab fa-instagram"></i>
            </button>
            <button 
              className="social-icon"
              onClick={() => window.open('https://twitter.com/secondhandcarseller', '_blank')}
              aria-label="Visit our Twitter page"
            >
              <i className="fab fa-twitter"></i>
            </button>
            <button 
              className="social-icon"
              onClick={() => window.open('https://linkedin.com/company/secondhandcarseller', '_blank')}
              aria-label="Visit our LinkedIn page"
            >
              <i className="fab fa-linkedin"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpandSupport;
