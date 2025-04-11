import React, { useState } from 'react';
import leafIcon from './plants/leaf.png';
import micIcon from './mic.png';
import background from './background.jpeg';
import './style.css';

const WordBlastPage = () => {
  const [wordToPronounce, setWordToPronounce] = useState("...");

  const getNewWord = () => {
    const words = ["sun", "sprout", "leaf", "grow", "smile"];
    const random = words[Math.floor(Math.random() * words.length)];
    setWordToPronounce(random);
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="label" style={{ left: '31.75%' }}>
        <span className="text-wrapper" style={{ whiteSpace: 'nowrap' }}>
          Say Sprout
        </span>
        <img
          src={leafIcon}
          alt="Leaf"
          className="pixelated"
          style={{
            height: '40px',
            marginLeft: '10px',
            marginTop: '6px',
          }}
        />
      </div>

      {/* Main box */}
      <div className="confetti-wrapper">
        <div
          className="confetti-box"
          style={{ backgroundImage: `url(${background})` }}
        >
          <div className="content-wrapper">
            <h2 className="prompt-label">word to pronounce</h2>
            <div className="word-box">{wordToPronounce}</div>
            <p className="mic-label">press the mic<br />button below</p>
            <img
              src={micIcon}
              alt="Mic Icon"
              className="mic-icon"
              onClick={getNewWord}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordBlastPage;
