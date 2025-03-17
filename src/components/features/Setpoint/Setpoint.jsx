// src/components/features/Setpoint/Setpoint.jsx
import React, { useState, useEffect } from 'react';
import MQTT from '../../../services/MQTT';
import { useDevice } from '../../../context/DeviceContext';

const Setpoint = () => {
  const { deviceConnected } = useDevice();
  const [voltage, setVoltage] = useState('');
  const [maxPower, setMaxPower] = useState(null);
  const [desiredPower, setDesiredPower] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentSetpoint, setCurrentSetpoint] = useState(0);

  const CURRENT = 4.5;

  useEffect(() => {
    console.log('Setpoint rendered - deviceConnected:', deviceConnected);
  }, [deviceConnected]);

  const handleVoltageChange = (e) => {
    const value = e.target.value;
    setVoltage(value);

    const voltageNum = parseFloat(value);
    if (!isNaN(voltageNum) && voltageNum > 0) {
      const calculatedMaxPower = voltageNum * CURRENT;
      setMaxPower(calculatedMaxPower.toFixed(1));
      setErrorMessage('');
    } else {
      setMaxPower(null);
      setDesiredPower('');
      setErrorMessage('Please enter a valid voltage (e.g., 12)');
    }
  };

  const handleDesiredPowerChange = (e) => {
    const value = e.target.value;
    setDesiredPower(value);

    const desiredPowerNum = parseFloat(value);
    if (maxPower && (isNaN(desiredPowerNum) || desiredPowerNum <= 0)) {
      setErrorMessage('Please enter a valid power greater than 0');
    } else if (maxPower && desiredPowerNum > maxPower) {
      setErrorMessage(`Desired power must not exceed max power (${maxPower}W)`);
    } else {
      setErrorMessage('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('handleSubmit called - deviceConnected:', deviceConnected);

    const voltageNum = parseFloat(voltage);
    const desiredPowerNum = parseFloat(desiredPower);

    if (isNaN(voltageNum) || voltageNum <= 0) {
      setErrorMessage('Please enter a valid voltage (e.g., 12)');
      console.log('Invalid voltage:', voltage);
      return;
    }

    if (isNaN(desiredPowerNum) || desiredPowerNum <= 0) {
      setErrorMessage('Please enter a valid desired power greater than 0');
      console.log('Invalid desired power:', desiredPower);
      return;
    }

    if (desiredPowerNum > maxPower) {
      setErrorMessage(`Desired power must not exceed max power (${maxPower}W)`);
      console.log('Desired power exceeds max power:', desiredPowerNum, maxPower);
      return;
    }

    if (!deviceConnected) {
      setErrorMessage('Device is disconnected, cannot set setpoint');
      console.log('Device disconnected, cannot set setpoint');
      return;
    }

    const setpointValue = desiredPowerNum.toFixed(1);
    MQTT.publish('setpoint', setpointValue);
    console.log(`Setpoint published: ${setpointValue}W`);
    setCurrentSetpoint(setpointValue);
    setErrorMessage('Setpoint set successfully');
  };

  return (
    <div className="border border-gray-600 bg-gray-700 rounded-lg p-4 flex flex-col items-center">
      <p className="text-sm text-gray-300 mb-2">
        Current setpoint: {currentSetpoint}W
      </p>
      <h2 className="text-lg font-bold mb-4">Set Power Limit</h2>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <div>
          <label className="block mb-1 text-gray-500">Output Voltage (V):</label>
          <input
            type="number"
            value={voltage}
            onChange={handleVoltageChange}
            placeholder="e.g., 12"
            min="0"
            step="0.1"
            className="w-32 p-2 text-black bg-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {maxPower && (
          <div>
            <p>Max Power: {maxPower}W</p>
          </div>
        )}

        <div>
          <label className="block mb-1 text-gray-500">Desired Max Power (W):</label>
          <input
            type="number"
            value={desiredPower}
            onChange={handleDesiredPowerChange}
            placeholder={`≤ ${maxPower || '...'}`}
            min="0"
            max={maxPower || undefined}
            step="0.1"
            disabled={!maxPower}
            className="w-32 p-2 text-black bg-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={!voltage || !desiredPower || !!errorMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          Submit Setpoint
        </button>
      </form>

      {errorMessage && (
        <p className={`mt-2 ${errorMessage.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default Setpoint;