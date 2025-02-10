import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import MQTT from '../../../services/MQTT';
import './Energy.css';

function Energy() {
    const [viewMode, setViewMode] = useState('day');
    const [energyData, setEnergyData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentUsage, setCurrentUsage] = useState(0);
    const [totalMonthUsage, setTotalMonthUsage] = useState(0);
    const [totalYearUsage, setTotalYearUsage] = useState(0);

    useEffect(() => {
        MQTT.connect();

        MQTT.onMessage('device/energyConsumption', (message) => {
            const power = parseFloat(message);
            addEnergyReading(power);
        });

        initializeData(viewMode);

        return () => {
            MQTT.disconnect();
        };
    }, [viewMode]);

    const initializeData = (mode) => {
        const currentYear = selectedDate.getFullYear();
        const currentMonth = selectedDate.getMonth();

        if (mode === 'day') {
            // Daily view - 24 hours
            const hourlyData = Array.from({ length: 24 }, (_, index) => ({
                hour: index,
                kwh: Math.random() * 2, // Replace with real data
                time: `${String(index).padStart(2, '0')}:00`
            }));
            setEnergyData(hourlyData);
            
        } else if (mode === 'month') {
            // Monthly view - last 12 months
            const monthlyData = Array.from({ length: 12 }, (_, index) => {
                const monthIndex = (currentMonth - 11 + index + 12) % 12;
                return {
                    month: new Date(currentYear, monthIndex).toLocaleString('default', { month: 'short' }),
                    kwh: Math.random() * 100, // Replace with real data
                    monthIndex: monthIndex
                };
            });
            setEnergyData(monthlyData);
            
        } else if (mode === 'yearly') {
            // Yearly view - last 5 years
            const yearlyData = Array.from({ length: 5 }, (_, index) => ({
                year: currentYear - 4 + index,
                kwh: Math.random() * 1000 // Replace with real data
            }));
            setEnergyData(yearlyData);
        }
    };

    const addEnergyReading = (power) => {
        const now = new Date();
        if (viewMode === 'day') {
            const hour = now.getHours();
            setEnergyData(prevData => {
                const newData = [...prevData];
                newData[hour] = {
                    ...newData[hour],
                    kwh: newData[hour].kwh + (power / 1000)
                };
                return newData;
            });
        }
        setCurrentUsage(power);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            let displayLabel = label;
            if (viewMode === 'day') {
                displayLabel = `${String(label).padStart(2, '0')}:00`;
            }
            
            return (
                <div className="custom-tooltip">
                    <p className="value">{`${payload[0].value.toFixed(1)} kWh`}</p>
                    <p className="label">{displayLabel}</p>
                </div>
            );
        }
        return null;
    };

    const getXAxisConfig = () => {
        switch(viewMode) {
            case 'day':
                return {
                    dataKey: 'hour',
                    tickFormatter: (value) => `${String(value).padStart(2, '0')}:00`,
                    interval: 2
                };
            case 'month':
                return {
                    dataKey: 'month',
                    interval: 0
                };
            case 'yearly':
                return {
                    dataKey: 'year',
                    interval: 0
                };
            default:
                return { dataKey: 'hour' };
        }
    };

    return (
        <div className="energy-stats">
            <div className="header">
                <h2>Electric</h2>
            </div>

            <div className="view-selector">
                <button 
                    className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
                    onClick={() => setViewMode('day')}
                >
                    Day
                </button>
                <button 
                    className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
                    onClick={() => setViewMode('month')}
                >
                    Month
                </button>
                <button 
                    className={`view-btn ${viewMode === 'yearly' ? 'active' : ''}`}
                    onClick={() => setViewMode('yearly')}
                >
                    Yearly
                </button>
            </div>

            <div className="current-usage">
                <h1>{currentUsage.toFixed(1)} kWh</h1>
                <p>{selectedDate.toLocaleString()}</p>
                {viewMode === 'month' && (
                    <p>Total this month: {totalMonthUsage.toFixed(1)} kWh</p>
                )}
                {viewMode === 'yearly' && (
                    <p>Total this year: {totalYearUsage.toFixed(1)} kWh</p>
                )}
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={energyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis {...getXAxisConfig()} />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                            dataKey="kwh" 
                            fill="#00B4D8" 
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default Energy;