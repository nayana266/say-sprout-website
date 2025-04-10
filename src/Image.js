import React from 'react';
import img from './background.jpeg';

function Image() {
  return (
    <div>
      <img src={img} alt="background" className="start-image" />
    </div>
  );
}

export default Image;
