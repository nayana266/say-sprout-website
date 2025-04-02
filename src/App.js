import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Image from './Image';
import Button from './Button';
import { Label } from "./Label";
import NewPage from './NewPage';

function App() {
  return (
    <Router>
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
      <Routes>  
        <Route path="/newpage" element={<NewPage />} />
      </Routes>
    </Router>
  );
}

export default App;
