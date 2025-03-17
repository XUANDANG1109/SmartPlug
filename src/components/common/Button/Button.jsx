// src/components/common/Button/Button.jsx
import React, { useState, useEffect } from 'react';
import MQTT from '../../../services/MQTT';
import './Button.css';

function Button() {
  const [isOn, setIsOn] = useState(false);

  // Connect to MQTT when component mounts
  useEffect(() => {
    // Subscribe to state_ok updates
    MQTT.onMessage('smart_plug/state_ok', (message) => {
      // Update button state based on received message
      setIsOn(message === "1");
    });
  }, []);

  const turnOn = () => {
    setIsOn(true);
    // Send "1" for ON and notify web
    MQTT.publish('state', '1');
  };

  const turnOff = () => {
    setIsOn(false);
    // Send "0" for OFF and notify web
    MQTT.publish('state', '0');

  };

  return (
    <div className="button-container text-gray-900 dark:text-white p-4">
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