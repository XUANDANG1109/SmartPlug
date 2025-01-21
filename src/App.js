import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Intro from './Intro';
import Button from './Button';
/*import Calendar from './Calendar';*/
import Clock from './Clock';
import Energy from './Energy';
import Usage from './Usage';
import EnergyPrice from './EnergyPrice';
import './App.css';


/*
function App() {
  return (
    <div className="app">
      <h1>Smart Plug Control</h1>
      <Intro />
      <Button />
      <Clock />
      <Usage />
      <Energy />
      <EnergyPrice />
    </div>
  ); 
}

export default App;
*/

function App() {
  return (
    <Router>
      <div className="app">
        <Intro />
        <Button />
        <Clock />
        <Usage />
        <Energy />
        <EnergyPrice />
      </div>
    </Router>
  ); 
}

export default App;