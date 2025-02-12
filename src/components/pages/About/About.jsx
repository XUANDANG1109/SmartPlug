import React from 'react';  // Thêm dòng này

export function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About SmartPlug</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-700 mb-4">
          SmartPlug is an innovative solution for monitoring and controlling
          your electrical devices.
        </p>
        {/* Add more content as needed */}
      </div>
    </div>
  );
}
