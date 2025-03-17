// src/components/pages/About/About.jsx
import React from 'react'; 

export function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">About SmartPlug</h1>
        <p className="text-white-800 mb-4">
          SmartPlug is an innovative solution for monitoring and controlling
          your electrical devices.
        </p>
        <h2 className="text-2xl font-bold mb-4 text-green-600">What It Does</h2> 
        <p className="text-white-800 mb-4">
          Plug in, connect, and control any device from anywhere with Wi-Fi.
        </p>
        
        <h2 className="text-2xl font-bold mb-4 text-orange-600">Top Features</h2> 
        <ul className="list-disc list-inside mb-4">
          <li className="text-white-800">Remote Control: Turn devices on/off through the app, from anywhere.</li>
          <li className="text-white-800">Schedules: Automate devices to save time and energy.</li>
          <li className="text-white-800">Minimalist Design: Fits any outlet, no clutter.</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 text-blue-600">Why Smart Plug?</h2>
        <ul className="list-disc list-inside mb-4">
          <li className="text-white-800">Effortless Convenience: Control devices while you’re away.</li>
          <li className="text-white-800">Peace of Mind: Never worry about forgotten appliances.</li>
          <li className="text-white-800">Simple Setup: No hubs, just Wi-Fi.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 text-blue-500">Get Ready</h2>
        <p className="text-white-800 mb-4">
          Transform your home with Smart Plug. Stay tuned for launch details!
        </p>
      </div>
  );
}