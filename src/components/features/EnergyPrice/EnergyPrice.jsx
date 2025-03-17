import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './EnergyPrice.css'; 
import axios from 'axios';

function EnergyPrice() {
    const [priceData, setPriceData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPriceData = async () => {
            try {
                const response = await axios.get(
                    'https://smart-plug-api-server.onrender.com/electric-price', 
                    {
                        params: {
                            year: 2025,
                            month: '02',
                            day: '05'
                        },
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        timeout: 10000, // 10 second timeout
                        withCredentials: false // Important for CORS
                    }
                );

                if (response.data) {
                    // Transform the array data into hourly format
                    const formattedData = response.data.map((price, index) => ({
                        hour: index,
                        price: price,
                        time: `${String(index).padStart(2, '0')}:00`
                    }));
                    
                    setPriceData(formattedData);
                } else {
                    // If no data, use sample data
                    setPriceData([
                        { hour: 0, price: 0.15, time: '00:00' },
                        { hour: 1, price: 0.14, time: '01:00' },
                        // ... add more sample data as needed
                    ]);
                }
            } catch (error) {
                console.error('Error fetching price data:', error);
                setError('Failed to load energy price data. Using sample data.');
                
                // Use sample data on error
                setPriceData([
                    { hour: 0, price: 0.15, time: '00:00' },
                    { hour: 1, price: 0.14, time: '01:00' },
                    // ... add more sample data
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPriceData();
    }, []);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label"><strong>{`${label}:00`}</strong></p>
                    <p className="tooltip-value" style={{ color: '#00B4D8' }}>
                        Price: {payload[0]?.value?.toFixed(4)} €/kWh
                    </p>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="price-stats">
            <div className="header">
                <h2>Price</h2>
                {error && (
                    <div className="text-red-500 text-sm mt-2">
                        {error}
                    </div>
                )}
            </div>

            <div className="energy-price-container">
                <h2 className="title">Energy price</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={priceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                            dataKey="time" 
                            tick={{ fill: '#666' }}
                        />
                        <YAxis 
                            tick={{ fill: '#666' }}
                            label={{ 
                                value: '€/kWh', 
                                angle: -90, 
                                position: 'insideLeft',
                                style: { fill: '#666' }
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                            dataKey="price" 
                            name="Energy price" 
                            fill="#00B4D8" 
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default EnergyPrice;