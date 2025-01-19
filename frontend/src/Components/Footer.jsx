import React from 'react';
import '../Styles/Footer.css';
import myImage from '../Assests/facebook.png';
import myimage from '../Assests/instagram.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Please feel free to contact us on Sunday–Friday from 9am–6pm. Weekends and National Holidays are closed.</p>
          <p>
            ⚲ Ward No 29, Dillibazar, Kathmandu, Nepal
          </p>
          <p>
            ☏ +977-9822944549
          </p>
          <p>
            ✉ secondhandcarseller@gmail.com
          </p>
        </div>
        <div className="footer-section">
          <h4>Quick Link</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/usedcar">Explore Car</a></li>
            <li><a href="/sellcar">Sell Car</a></li>
            <li><a href="#carreview">Car Review</a></li>
            <li><a href="#comparecar">Compare Car</a></li>
          </ul>
        </div>
        <div className="footer-social">
          <h4>Social Media</h4>
          <a href="#facebook" className="social-link"><img src={myImage} alt="" /></a>
          <a href="#instagram" className="social-link"><img src={myimage} alt="" /></a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>All Rights Reserved © Second-Hand Car Seller</p>
      </div>
    </footer>
  );
};

export default Footer;
