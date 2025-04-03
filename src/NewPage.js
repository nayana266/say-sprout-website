import React from 'react';
import './style.css';
import Image from './Image'; // Import the Image component
import { Label } from './Label';

function NewPage() {
  return (
    <div className="newpage-container">
      <Image /> {/* Include the image */}
      <Label /> {}
      
    </div>
  );
}

export default NewPage;
