import React from 'react';
import '../App.css';
import myImage from '../Assests/car.png';
import Explore from './ExploreUsedCar';
import About from './About';
import Contact from './Contact';

const Home = () => {
  return (
    <div>
      <div id='home'>
        <div id='homeleft'>
          <h3>Second-Hand Car Seller</h3>
          <h8>Discover the joy of driving with confidence</h8>
          <p>Looking for the best deals on second-hand cars? You've come to the right place!</p>
          <button id='homebtn'>Explore</button>
        </div>

        <div id='homeright'>
          <img src={myImage} alt="Car" />
        </div>
      </div>

  
      <div id='explore-section'>
        <Explore />
      </div>

     
      <div id='about-section'>
        <h2>About Us</h2>
        <About />
      </div>

  
      <div id='contact-section'>
        <h2>Contact Us</h2>
        <Contact />
      </div>
    </div>
  );
};

export default Home;
