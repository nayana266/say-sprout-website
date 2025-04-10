import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from "react-router-dom";
import Image from './Image';
import Button from './Button';
import { Label } from './Label';
import NewPage from './NewPage';
import './style.css';
import './index.css';
import WordBlastPage from './WordBlastPage';
import SoundMatchPage from './SoundMatchPage';
import RhymeRacerPage from './RhymeRacerPage';
import StoryModePage from './StoryModePage';

function HomePage() {
  return (
    <div className="container">
      <Image />
      <Label />
      <div className="center-text">
        <p>Let's</p>
        <p>Sprout</p>
        <p>Your Plant!</p>
      </div>
      <Button />
    </div>
  );
}

function AppRoutes() {
  const location = useLocation(); // ✅ Now this works!

  console.log("Current route:", location.pathname); // Example usage

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/newpage" element={<NewPage />} />
      <Route path="/wordblast" element={<WordBlastPage />} />
      <Route path="/soundmatch" element={<SoundMatchPage />} />
      <Route path="/rhymeracer" element={<RhymeRacerPage />} />
      <Route path="/storymode" element={<StoryModePage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
