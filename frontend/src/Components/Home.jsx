import React from 'react';
import '../App.css';
import myImage from '../Assests/car2.png';
import Explore from './ExploreUsedCar';
import Footer from './Footer';
import CompareCar from './CompareCar';

const Home = () => {
  return (
    <div>
      <div id='home'>
        <div id='homeleft'>
          <h3>Second-Hand Car Seller</h3>
          <h8>Discover the joy of driving with confidence</h8>
          <p>Looking for the best deals on second-hand cars? You've come to the right place!</p>
        </div>

        <div id='homeright'>
          <img src={myImage} alt="Car" />
        </div>
      </div>

  
      <div id='explore-section'>
        <Explore />
      </div>

     
      <div id='about-section'>
        <CompareCar />
      </div>

  
      <div id='contact-section'>
        <Footer />
      </div>
      
    </div>
  );
};

export default Home;
