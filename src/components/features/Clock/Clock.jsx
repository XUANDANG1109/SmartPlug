import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Clock.css';

function Clock() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState('');
    const [turnOnTime, setTurnOnTime] = useState('');
    const [turnOffTime, setTurnOffTime] = useState('');
    const [schedules, setSchedules] = useState([]);
    const [deviceStatus, setDeviceStatus] = useState('OFF');

     // Ensure this function is async
    const handleSetSchedule = async () => {
        const bookingData = {
            charger_id: 1, // Replace with the actual charger ID
            start_time: `2025-02-08T${turnOnTime}:00`, // Adjust the date as needed
            end_time: `2025-02-08T${turnOffTime}:00`, // Adjust the date as needed
        };

        console.log('Booking Data:', bookingData); // Log the booking data

        try {
            // Await should be used here
            const response = await axios.post('https://smart-plug-api-server.onrender.com/bookings/', bookingData);
            console.log('Booking successful:', response.data);
        } catch (error) {
            console.error('Error setting booking:', error.response ? error.response.data : error.message);
        }
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
            checkSchedules();
        }, 1000);
        return () => clearInterval(timer);
    }, [schedules]); // Add schedules as dependency

    const checkSchedules = () => {
        const now = new Date();
        schedules.forEach(schedule => {
            const turnOnDateTime = new Date(`${schedule.date} ${schedule.turnOnTime}`);
            const turnOffDateTime = new Date(`${schedule.date} ${schedule.turnOffTime}`);
            
            if (Math.abs(now.getTime() - turnOnDateTime.getTime()) < 1000) {
                setDeviceStatus('ON');
                alert('Device turned ON!');
            }
            
            if (Math.abs(now.getTime() - turnOffDateTime.getTime()) < 1000) {
                setDeviceStatus('OFF');
                alert('Device turned OFF!');
            }
        });
    };

    const addSchedule = () => {
        if (selectedDate && turnOnTime && turnOffTime) {
            // Validate that turn-off time is after turn-on time
            if (turnOnTime >= turnOffTime) {
                alert('Turn-off time must be after turn-on time');
                return;
            }

            const newSchedule = {
                id: Date.now(),
                date: selectedDate,
                turnOnTime: turnOnTime,
                turnOffTime: turnOffTime,
                status: 'scheduled'
            };
            setSchedules([...schedules, newSchedule]);
            
            // Reset form
            setTurnOnTime('');
            setTurnOffTime('');
        } else {
            alert('Please fill in all fields');
        }
    };

    const deleteSchedule = (id) => {
        setSchedules(schedules.filter(schedule => schedule.id !== id));
    };

    const formatTime = (timeString) => {
        return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    

    return (
        <div className="alarm-clock bg-white dark:bg-gray-800 p-6 rounded-lg">
        <h1 className='text-2xl font-bold text-gray-800 dark:text-white mb-2'>Set schedule</h1>
        <p className='text-gray-600 dark:text-gray-300 mb-6'>
            Choose the exact times to turn your device on and off, ensuring energy efficiency and convenience.
        </p>
        
        <div className="current-time text-gray-800 dark:text-white">
            {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            })}
        </div>

        <div className="device-status text-gray-700 dark:text-gray-300">
            Device Status: <span className={`status-${deviceStatus.toLowerCase()}`}>{deviceStatus}</span>
        </div>

        <div className="schedule-form bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="date-picker">
                <label className="text-gray-700 dark:text-gray-300">Date:</label>
                <input 
                    type="date" 
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                             bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />  
            </div>
            <div className="time-picker">
                    <div className="turn-on-time">
                        <label className="text-gray-700 dark:text-gray-300">Turn On Time:</label>
                        <div className="relative">
                            <input 
                                type="time" 
                                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                        bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white
                                        focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={turnOnTime}
                                onChange={(e) => setTurnOnTime(e.target.value)}
                            />
                            <span className="clock-icon">🕒</span> {/* Clock icon */}

                        </div>
                        
                    </div>

                    <div className="turn-off-time">
                        <label className="text-gray-700 dark:text-gray-300">Turn Off Time:</label>
                        <div className="relative">
                        <input 
                            type="time" 
                            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                                     bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white
                                     focus:outline-none focus:ring-2 focus:ring-blue-300"
                            value={turnOffTime}
                            onChange={(e) => setTurnOffTime(e.target.value)}
                        />
                        <span className="clock-icon">🕒</span> {/* Clock icon */}

                        </div>
                        
                    </div>
                </div>

                <button className="w-full mt-6 px-6 py-2 bg-blue-500 hover:bg-blue-600 
                                 text-white rounded-md transition duration-200
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={addSchedule}>
                    Set Schedule
                </button>
            </div>
            <div className="schedule-list mt-8">
                <h2 className="text-xl font-semibold text-white dark:text-white mb-4">Scheduled Times</h2>
                {schedules.map(schedule => (
                    <div key={schedule.id} 
                         className="schedule-item bg-white dark:bg-gray-700 border border-gray-200 
                                  dark:border-gray-600 rounded-lg p-4 mb-3">
                        <div className="schedule-info">
                            <div className="schedule-date text-gray-800 dark:text-white font-medium">
                                {schedule.date}
                            </div>
                            <div className="schedule-times flex gap-4 mt-2">
                                <span className="text-green-500">ON: {formatTime(schedule.turnOnTime)}</span>
                                <span className="text-red-500">OFF: {formatTime(schedule.turnOffTime)}</span>
                            </div>
                        </div>
                        <button onClick={() => deleteSchedule(schedule.id)} 
                                className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white 
                                         rounded-md transition duration-200">
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Clock;