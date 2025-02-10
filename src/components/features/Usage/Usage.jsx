import React, { useState, useEffect } from 'react';
import MQTT from '../../../services/MQTT';
import './Usage.css';

function Usage() {
    const [timeUsage, setTimeUsage] = useState('0H 0M');
    const [energyConsumption, setEnergyConsumption] = useState('0W');

    useEffect(() => {
        MQTT.connect();

        MQTT.onMessage('device/timeUsage', (message) => {
            // Assuming message comes in minutes
            const totalMinutes = parseInt(message);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            setTimeUsage(`${hours}H ${minutes}M`);
        });

        MQTT.onMessage('device/energyConsumption', (message) => {
            setEnergyConsumption(`${message}W`);
        });

        return () => {
            MQTT.disconnect();
        };
    }, []);
    return (
        <div className="usage-display">
            <div className="metric">
                <div className="value">{timeUsage}</div>
                <div className="label">Time Usage</div>
            </div>
            <div className="metric">
                <div className="value">{energyConsumption}</div>
                <div className="label">Energy Consumption</div>
            </div>
        </div>
    );
}

export default Usage;