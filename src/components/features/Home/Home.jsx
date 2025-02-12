import React from "react";
import Button from "../../common/Button/Button";
import Clock from "../../features/Clock/Clock";

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Smart Plug Control
          </h1>
          <div className="flex justify-center gap-6 mb-4">
            <Button />
          </div>
        </div>
      </div>

 
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <Clock />
      </div>
    </div>
  );
};

export default Home;