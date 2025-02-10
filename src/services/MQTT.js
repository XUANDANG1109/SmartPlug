import mqtt from 'mqtt';

class MQTT {
    constructor() {
        this.client = null;
        this.callbacks = new Map();
    }

    connect() {
        // Use WebSocket connection
        const options = {
            protocol: 'ws',
            hostname: 'broker.hivemq.com',
            port: 8000,
            path: '/mqtt',
            clean: true
        };

        this.client = mqtt.connect(options);

        this.client.on('connect', () => {
            console.log('Connected to HiveMQ Cloud via WebSocket!');
            // Subscribe to your topics
            this.client.subscribe('test/topic');  // Change to your topic
            this.client.subscribe('device/timeUsage');
            this.client.subscribe('device/energyConsumption');
        });

        this.client.on('message', (topic, message) => {
            console.log(`Received on ${topic}: ${message.toString()}`);
            const callback = this.callbacks.get(topic);
            if (callback) {
                callback(message.toString());
            }
        });

        this.client.on('error', (error) => {
            console.error('MQTT Error:', error);
        });
    }

    // Method to publish test message
    publishMessage(message) {
        if (this.client && this.client.connected) {
            this.client.publish('me', message);
            console.log('Message sent:', message);
        }
    }

    onMessage(topic, callback) {
        this.callbacks.set(topic, callback);
    }

    disconnect() {
        if (this.client) {
            this.client.end();
            console.log('Connection closed');
        }
    }
}

export default new MQTT();