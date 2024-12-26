import React from 'react';
import '../Styles/Explore.css' 

const Explore = () => {
  const exampleCars = [
    {
      id: 1,
      name: 'Toyota Corolla',
      price: '$10,000',
      model: 'XLE',
      year: 2019,
      image: 'https://via.placeholder.com/150?text=Honda+Civic', // Example image URL
    },
    {
      id: 2,
      name: 'Honda Civic',
      price: '$12,500',
      model: 'EX',
      year: 2020,
      image: 'https://via.placeholder.com/150?text=Honda+Civic',
    },
    {
      id: 3,
      name: 'Ford Mustang',
      price: '$25,000',
      model: 'GT',
      year: 2018,
      image: 'https://via.placeholder.com/150?text=Ford+Mustang',
    },
    {
      id: 4,
      name: 'Chevrolet Camaro',
      price: '$23,000',
      model: 'SS',
      year: 2017,
      image: 'https://via.placeholder.com/150?text=Chevrolet+Camaro',
    },
  ];

  return (
    <div id="explore">
      <div id="up">
        <h2>Explore</h2>
        <input type="text" placeholder="Search" />
      </div>

      <div id="carlist">
        {exampleCars.map((car) => (
          <div key={car.id} className="car-item">
            <img src={car.image} alt={car.name} className="car-image" />
            <h3>{car.name}</h3>
            <p>Price: {car.price}</p>
            <p>Model: {car.model}</p>
            <p>Year: {car.year}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
