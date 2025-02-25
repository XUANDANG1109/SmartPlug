import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './EnergyPrice.css'; 
import axios from 'axios';

function EnergyPrice() {
    const [priceData, setPriceData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect(() => {
    //     const fetchPriceData = async () => {
    //         try {
    //             // Sample data
    //             const sampleData = [
    //                 { month: 'January', confirmedPrice: 97.01, predictedPrice: null },
    //                 { month: 'February', confirmedPrice: 96.79, predictedPrice: null },
    //                 { month: 'March', confirmedPrice: 78.81, predictedPrice: null },
    //                 { month: 'April', confirmedPrice: 68.00, predictedPrice: null },
    //                 { month: 'May', confirmedPrice: 42.19, predictedPrice: null },
    //                 { month: 'June', confirmedPrice: 34.92, predictedPrice: null },
    //                 { month: 'July', confirmedPrice: null, predictedPrice: 32.35 },
    //                 { month: 'August', confirmedPrice: null, predictedPrice: 34.21 },
    //                 { month: 'September', confirmedPrice: null, predictedPrice: 46.69 },
    //                 { month: 'October', confirmedPrice: null, predictedPrice: 67.45 },
    //                 { month: 'November', confirmedPrice: null, predictedPrice: 79.13 },
    //                 { month: 'December', confirmedPrice: null, predictedPrice: 87.61 }
    //             ];
    //             setPriceData(sampleData);
    //             setIsLoading(false);
    //         } catch (error) {
    //             console.error('Error fetching price data:', error);
    //             setIsLoading(false);
    //         }
    //     };

    //     fetchPriceData();
    // }, []);

    useEffect(() => {
        console.log('123')
        const fetchPriceData = async () => {
            try {
                const response = await axios.get('https://smart-plug-api-server.onrender.com/electric-price?year=2025&month=02&day=05');
                console.log('api', response)
                // Transform the array data into hourly format
                const formattedData = response.data.map((price, index) => ({
                    hour: index,
                    price: price,
                    time: `${String(index).padStart(2, '0')}:00`
                }));
                
                setPriceData(formattedData);
                setIsLoading(false);
              
            } catch (error) {
                console.error('Error fetching price data:', error);
                setError('Failed to load energy price data');
                setIsLoading(false);
            }
        };
        fetchPriceData();
    }, []);

    /*useEffect(() => {
        fetchPriceData();
    }, []);

    const fetchPriceData = async () => {
        const url = 'https://smart-plug.onrender.com/price'; // Your API endpoint
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json' // Adjust headers if needed
                }
            });

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const json = await response.json();
            setPriceData(json); // Assuming the response is in the expected format
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching price data:', error.message);
            setError('Failed to load energy price data');
            setIsLoading(false);
        }
    };*/

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label"><strong>{label}</strong></p>
                    {payload.map((entry, index) => (
                        <p key={index} className="tooltip-value" style={{ color: entry.color }}>
                            {entry.name === 'confirmedPrice' ? 'Confirmed: ' : 'Predicted: '}
                            {entry.value?.toFixed(2)} €/MWh
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="price-stats">
            <div className="header">
                <h2>Price</h2>
            </div>

            <div className="energy-price-container">
                <h2 className="title">Energy price</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={priceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                            dataKey="month" 
                            tick={{ fill: '#666' }}
                        />
                        <YAxis 
                            tick={{ fill: '#666' }}
                            label={{ 
                                value: '€/MWh', 
                                angle: -90, 
                                position: 'insideLeft',
                                style: { fill: '#666' }
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                            dataKey="confirmedPrice" 
                            name="Confirmed energy price" 
                            fill="#00B4D8" 
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                            dataKey="predictedPrice" 
                            name="Prognosis for energy price" 
                            fill="#c5cae9" 
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default EnergyPrice;