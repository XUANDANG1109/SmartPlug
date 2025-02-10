import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Intro from './components/layout/Header/Intro';
import Button from './components/common/Button/Button';
import Clock from './components/features/Clock/Clock';
import Energy from './components/features/Energy/Energy';
import Usage from './components/features/Usage/Usage';
import EnergyPrice from './components/features/EnergyPrice/EnergyPrice';

function App() {
  return (
    <Router>
      <div className="app">
        <Intro />
        <main className="main-content">
          <Button />
          <Clock />
          <Usage />
          <Energy />
          <EnergyPrice />
        </main>
      </div>
    </Router>
  ); 
}

export default App; 