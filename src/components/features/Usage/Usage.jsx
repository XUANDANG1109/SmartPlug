// src/components/features/Usage/Usage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Usage.css';

function Usage() {
    const [energyConsumption, setEnergyConsumption] = useState('0WH');

    useEffect(() => {

        const fetchEnergyConsumption = async () => {
            try {
                const response = await axios.get(`https://smart-plug-api-server.onrender.com/energy_reports/energy_consumption/3`);
                setEnergyConsumption(`${response.data[0].energy_consumption} Wh`); // Adjust based on your API response structure
                console.log("power consumped: ", response.data[0].energy_consumption);
            } catch (error) {
                console.error('Error fetching energy consumption:', error);
            }
        };

        fetchEnergyConsumption();
    },); // Added chargerId as a dependency

    return (
        <div className="usage-display">
            <div className="metric">
                <div className="value">{energyConsumption}</div>
                <div className="label">Energy Consumption</div>
            </div>
        </div>
    );
}

export default Usage;