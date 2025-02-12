import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Intro from "./components/layout/Header/Intro";
import Button from "./components/common/Button/Button";
import Clock from "./components/features/Clock/Clock";
import Energy from "./components/features/Energy/Energy";
import Usage from "./components/features/Usage/Usage";
import EnergyPrice from "./components/features/EnergyPrice/EnergyPrice";
import { About } from "./components/pages/About/About";
import Home from "./components/features/Home/Home";
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen transition-colors duration-200">
        <Intro />

        <main className="container mx-auto px-4 py-8  text-gray-900 dark:text-white transition-colors duration-200">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/usage"
              element={<Usage />}

            />
            <Route path="/energy" element={<Energy />} />
            <Route path="/price" element={<EnergyPrice />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
