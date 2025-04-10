import React from 'react';
import leafIcon from './plants/leaf.png';
import background from './background.jpeg';
import './style.css';

const WordBlastPage = () => {
  return (
    <div className="container">
      {/* Matching start screen label – now stays on one line */}
      <div className="label"
      style={{ left: '31.75%' }}
      >
        <span
          className="text-wrapper"
          style={{ whiteSpace: 'nowrap' }} // 💥 prevents wrapping
        >
          Say Sprout
        </span>
        <img
          src={leafIcon}
          alt="Leaf"
          className="pixelated"
          style={{
            height: '40px',
            marginLeft: '10px',
            marginTop: '6px', // tweak for baseline alignment
          }}
        />
      </div>

      {/* Confetti background box */}
      <div
        className="confetti-box"
        style={{ backgroundImage: `url(${background})` }}
      >
        {/* Next up: word box + mic button */}
      </div>
    </div>
  );
};

export default WordBlastPage;
