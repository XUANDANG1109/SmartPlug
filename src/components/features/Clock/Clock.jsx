import React, { useState, useEffect } from 'react';
import './Clock.css';

function Clock() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState('');
    const [turnOnTime, setTurnOnTime] = useState('');
    const [turnOffTime, setTurnOffTime] = useState('');
    const [schedules, setSchedules] = useState([]);
    const [deviceStatus, setDeviceStatus] = useState('OFF');

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
        <div className="alarm-clock">
            <h1>Set schedule</h1>
            <p>Choose the exact times to turn your device on and off, ensuring energy efficiency and convenience</p>
            
            <div className="current-time">
                {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                })}
            </div>

            <div className="device-status">
                Device Status: <span className={`status-${deviceStatus.toLowerCase()}`}>{deviceStatus}</span>
            </div>

            <div className="schedule-form">
                <div className="date-picker">
                    <label>Date:</label>
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>

                <div className="time-picker">
                    <div className="turn-on-time">
                        <label>Turn On Time:</label>
                        <input 
                            type="time" 
                            value={turnOnTime}
                            onChange={(e) => setTurnOnTime(e.target.value)}
                        />
                    </div>

                    <div className="turn-off-time">
                        <label>Turn Off Time:</label>
                        <input 
                            type="time" 
                            value={turnOffTime}
                            onChange={(e) => setTurnOffTime(e.target.value)}
                        />
                    </div>
                </div>

                <button className="set-schedule" onClick={addSchedule}>
                    Set Schedule
                </button>
            </div>

            <div className="schedule-list">
                <h2>Scheduled Times</h2>
                {schedules.map(schedule => (
                    <div key={schedule.id} className="schedule-item">
                        <div className="schedule-info">
                            <div className="schedule-date">{schedule.date}</div>
                            <div className="schedule-times">
                                <span className="on-time">ON: {formatTime(schedule.turnOnTime)}</span>
                                <span className="off-time">OFF: {formatTime(schedule.turnOffTime)}</span>
                            </div>
                        </div>
                        <button onClick={() => deleteSchedule(schedule.id)} className="delete-btn">
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Clock;