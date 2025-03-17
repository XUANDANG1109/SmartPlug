// src/context/DeviceContext.jsx
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import MQTT from '../services/MQTT';

const DeviceContext = createContext();

export const DeviceProvider = ({ children }) => {
    const [deviceConnected, setDeviceConnected] = useState(false);
    const [isMqttConnected, setIsMqttConnected] = useState(false); // New state for MQTT connection
    const timeoutRef = useRef(null);

    const ALIVE_CHECK_INTERVAL = 60 * 1000;
    const ALIVE_RESPONSE_TIMEOUT = 15 * 1000;

    const publishAliveSignal = useCallback(() => {

        console.log(`Current device status: ${deviceConnected ? 'Connected' : 'Disconnected'}`);
        const aliveData = '1';
        MQTT.publish('alive', aliveData);
        console.log(`Published to alive: ${aliveData}`);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            console.log('Timeout triggered, setting deviceConnected to false');
            setDeviceConnected(false);
            console.log('No alive_ok response received within timeout period');
        }, ALIVE_RESPONSE_TIMEOUT);
    }, [deviceConnected]);

    const handleAliveOkMessage = useCallback((message) => {
        console.log('Received alive_ok acknowledgment:', message, 'Setting deviceConnected to true');
        setDeviceConnected(true);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        console.log('Initializing MQTT connection in DeviceContext...');
        const connectSuccess = MQTT.connect();
        if (!connectSuccess || !MQTT.client) {
            console.error('MQTT initialization failed or client is null');
            setIsMqttConnected(false);
            setDeviceConnected(false);
            return;
        }

        const handleConnect = () => {
            console.log('✅ MQTT Connected');
            setIsMqttConnected(true); // Update state on connect
            publishAliveSignal();
        };

        const handleError = (err) => {
            console.error('❌ MQTT Connection error:', err);
            setIsMqttConnected(false);
            setDeviceConnected(false);
        };

        const handleDisconnect = () => {
            console.log('📴 MQTT Disconnected');
            setIsMqttConnected(false);
            setDeviceConnected(false);
        };

        MQTT.client.on('connect', handleConnect);
        MQTT.client.on('error', handleError);
        MQTT.client.on('offline', handleDisconnect);
        MQTT.client.on('disconnect', handleDisconnect);

        const unsubscribe = MQTT.onMessage('smart_plug/alive_ok', handleAliveOkMessage);
        const aliveCheckInterval = setInterval(publishAliveSignal, ALIVE_CHECK_INTERVAL);

        return () => {
            console.log('Cleaning up MQTT in DeviceContext...');
            clearInterval(aliveCheckInterval);
            unsubscribe();
            if (MQTT.client) {
                MQTT.client.off('connect', handleConnect);
                MQTT.client.off('error', handleError);
                MQTT.client.off('offline', handleDisconnect);
                MQTT.client.off('disconnect', handleDisconnect);
            }
        };
    }, [publishAliveSignal, handleAliveOkMessage]);

    return (
        <DeviceContext.Provider value={{ deviceConnected, isMqttConnected }}>
            {children}
        </DeviceContext.Provider>
    );
};

export const useDevice = () => {
    const context = useContext(DeviceContext);
    if (!context) {
        throw new Error('useDevice must be used within a DeviceProvider');
    }
    return context;
};