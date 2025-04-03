import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Image from './Image';
import Button from './Button';
import { Label } from './Label';
import NewPage from './NewPage';
import './style.css';
import './index.css';

function HomePage() {
  return (
    <div className="container">
      <Image />
      <Label />

      {/* Centered Text */}
      <div className="center-text">
        <p>Let's</p>
        <p>Sprout</p>
        <p>Your Plant!</p>
      </div>

      <Button />
    </div>
  );
}

function App() {
  const location = useLocation();

  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/newpage" element={<NewPage />} />
      </Routes>
    </div>
  );
}

export default function Main() {
  return (
    <Router>
      <App />
    </Router>
  );
}
