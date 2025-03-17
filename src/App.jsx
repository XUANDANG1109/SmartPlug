// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DeviceProvider, useDevice } from './context/DeviceContext';
import Intro from './components/layout/Header/Intro';
import Energy from './components/features/Energy/Energy';
import Usage from './components/features/Usage/Usage';
import EnergyPrice from './components/features/EnergyPrice/EnergyPrice';
import { About } from './components/pages/About/About';
import Home from './components/features/Home/Home';
import Connect from './components/features/Connect/Connect';
import Setpoint from './components/features/Setpoint/Setpoint';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <p>Check the console for details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { deviceConnected, isMqttConnected } = useDevice();

  return (
    <div className="min-h-screen transition-colors duration-200">
      <Intro />
      <main className="container mx-auto px-4 py-8 text-gray-900 dark:text-black transition-colors duration-200">
        <div className="p-4 border border-gray-900 rounded-lg mb-6">
          <p>{isMqttConnected ? '🟢 MQTT Connected' : '🔴 MQTT Disconnected'}</p>
          <p>{deviceConnected ? '🟢 Device Connected' : '🔴 Device Disconnected'}</p>
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/usage" element={<Usage />} />
          <Route path="/energy" element={<Energy />} />
          <Route path="/price" element={<EnergyPrice />} />
          <Route path="/about" element={<About />} />
          <Route path="/connect" element={<Connect isConnected={isMqttConnected} deviceConnected={deviceConnected} />} />
          <Route path="/setpoint" element={<Setpoint />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <DeviceProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </DeviceProvider>
    </ErrorBoundary>
  );
}

export default App;