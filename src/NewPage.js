import React from 'react';
import './style.css';
import { Label } from './Label';

import leaf from './plants/leaf.png';
import cactus from './plants/cactus.png';
import succulent from './plants/succulent.png';
import blueberry from './plants/blueberry.png';
import confettiBackground from './background.jpeg';


function NewPage() {
  return (
    <div className="newpage-container">
      <Label />

      <div className="confetti-wrapper">
        <div
          className="confetti-box"
          style={{ backgroundImage: `url(${confettiBackground})` }}
        >
          <div className="icon-grid">
            <div className="icon-item">
              <img src={leaf} alt="Leaf Icon" className="icon-img" />
              <button className="icon-btn">word blast</button>
            </div>
            <div className="icon-item">
              <img src={cactus} alt="Cactus Icon" className="icon-img" />
              <button className="icon-btn">sound match</button>
            </div>
            <div className="icon-item">
              <img src={succulent} alt="Succulent Icon" className="icon-img" />
              <button className="icon-btn">rhyme racer</button>
            </div>
            <div className="icon-item">
              <img src={blueberry} alt="Blueberry Icon" className="icon-img" />
              <button className="icon-btn">story mode</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewPage;
