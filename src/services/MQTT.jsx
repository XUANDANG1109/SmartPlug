// src/services/MQTT.js
import mqtt from 'mqtt';

class MQTTService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.callbacks = new Map();
    }

    connect() {
        const options = {
            username: 'smartplug',
            password: 'SmartPlug2025@',
            rejectUnauthorized: false,
            reconnectPeriod: 5000,
            keepalive: 60,
            clean: true,
        };

        console.log('Attempting to connect to MQTT broker...');
        try {
            this.client = mqtt.connect(
                'wss://4e8b61774358463c87428a6f4f8bf6c3.s1.eu.hivemq.cloud:8884/mqtt',
                options
            );
            if (!this.client) {
                throw new Error('mqtt.connect returned null or undefined');
            }
            console.log('MQTT client initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize MQTT client:', error);
            this.isConnected = false;
            this.client = null;
            return false; // Indicate failure
        }

        this.client.on('connect', () => {
            if (!this.client) {
                console.error('❌ "connect" event fired but client is null');
                this.isConnected = false;
                return;
            }

            console.log('✅ Connected to MQTT Broker');
            this.isConnected = true;

            const topics = [
                'smart_plug/state_ok',
                'smart_plug/timer_ok',
                'smart_plug/alive_ok',
                'smart_plug/timer_remove_ok',
            ];

            topics.forEach((topic) => {
                this.client.subscribe(topic, (err) => {
                    if (err) {
                        console.error(`❌ Failed to subscribe to ${topic}:`, err);
                    } else {
                        console.log(`✅ Subscribed to ${topic}`);
                    }
                });
            });
        });

        this.client.on('reconnect', () => {
            console.log('🔄 Attempting to reconnect to MQTT Broker...');
            this.isConnected = false;
        });

        this.client.on('offline', () => {
            console.log('📴 MQTT Client is offline');
            this.isConnected = false;
        });

        this.client.on('message', (topic, message) => {
            const receivedMessage = message.toString();
            console.log(`📩 Received on "${topic}": ${receivedMessage}`);
            if (this.callbacks.has(topic)) {
                const topicCallbacks = this.callbacks.get(topic);
                topicCallbacks.forEach((callback) => callback(receivedMessage));
            }
        });

        this.client.on('error', (error) => {
            console.error('❌ MQTT Error:', error);
            this.isConnected = false;
        });

        return true; // Indicate success
    }

    publish(topic, message) {
        if (this.client && this.isConnected) {
            this.client.publish(topic, message.toString(), (err) => {
                if (err) {
                    console.error(`❌ Failed to publish to ${topic}:`, err);
                } else {
                    console.log(`📤 Published to ${topic}: ${message}`);
                }
            });
        } else {
            console.warn('⚠️ MQTT client not connected or not initialized');
        }
    }

    onMessage(topic, callback) {
        if (!this.callbacks.has(topic)) {
            this.callbacks.set(topic, []);
        }
        const topicCallbacks = this.callbacks.get(topic);
        topicCallbacks.push(callback);

        return () => {
            if (this.callbacks.has(topic)) {
                const updatedCallbacks = topicCallbacks.filter((cb) => cb !== callback);
                if (updatedCallbacks.length > 0) {
                    this.callbacks.set(topic, updatedCallbacks);
                } else {
                    this.callbacks.delete(topic);
                }
            }
        };
    }

    disconnect() {
        if (this.client) {
            this.client.end(true, {}, () => {
                console.log('📴 MQTT connection closed');
            });
            this.isConnected = false;
            this.client = null;
        }
    }

    getConnectionStatus() {
        return this.isConnected;
    }
}

const MQTT = new MQTTService();
export default MQTT;