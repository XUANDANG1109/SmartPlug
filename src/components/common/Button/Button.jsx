import React, { useState } from 'react';
import './Button.css';

function Button() {
  const [isOn, setIsOn] = useState(false);

  const turnOn = () => {
    setIsOn(true);
  };

  const turnOff = () => {
    setIsOn(false);
  };

  /*const togglePower = () => {
    setIsOn(!isOn);
  };*/

  return (
    <div className="button-container">
      <div>
        <button
          className={`on-button ${isOn ? 'active' : ''}`}
          onClick={turnOn}
      >
        ON
      </button>
      <button 
        className={`off-button ${!isOn ? 'active' : ''}`}
        onClick={turnOff}
      >
        OFF
      </button>
    </div>
    <p className="status">
      Status: {isOn ? 'Device is ON' : 'Device is OFF'}
    </p>
  </div>
);
}

export default Button;