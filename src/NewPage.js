import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ import this
import './style.css';
import { Label } from './Label';

import leaf from './plants/leaf.png';
import cactus from './plants/cactus.png';
import succulent from './plants/succulent.png';
import blueberry from './plants/blueberry.png';
import confettiBackground from './background.jpeg';

function NewPage() {
  const navigate = useNavigate(); // ✅ use navigate hook

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
              <button
                className="icon-btn"
                onClick={() => navigate('/wordblast')} // ✅ wired!
              >
                word blast
              </button>
            </div>

            {/* Keep the rest the same for now */}
            <div className="icon-item">
  <img src={cactus} alt="Cactus Icon" className="icon-img" />
  <button className="icon-btn" onClick={() => navigate('/soundmatch')}>
    sound match
  </button>
</div>

<div className="icon-item">
  <img src={succulent} alt="Succulent Icon" className="icon-img" />
  <button className="icon-btn" onClick={() => navigate('/rhymeracer')}>
    rhyme racer
  </button>
</div>

<div className="icon-item">
  <img src={blueberry} alt="Blueberry Icon" className="icon-img" />
  <button className="icon-btn" onClick={() => navigate('/storymode')}>
    story mode
  </button>
</div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default NewPage;
