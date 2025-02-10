import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Intro from './components/layout/Header/Intro';
import Button from './components/common/Button/Button';
import Clock from './components/features/Clock/Clock';
import Energy from './components/features/Energy/Energy';
import Usage from './components/features/Usage/Usage';
import EnergyPrice from './components/features/EnergyPrice/EnergyPrice';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Intro />
        <nav>
          <Link to="/">Home</Link>
          <Link to="/usage">Usage</Link>
          <Link to="/energy">Energy</Link>
          <Link to="/price">Price</Link>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <>
                <Button />
                <Clock />
              </>
            } />
            <Route path="/usage" element={<Usage />} />
            <Route path="/energy" element={<Energy />} />
            <Route path="/price" element={<EnergyPrice />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;