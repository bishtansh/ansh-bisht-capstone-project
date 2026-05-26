import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Predict from "./pages/Predict";
import Dashboard from "./pages/Dashboard";
import AirportStats from "./pages/AirportStats";
import ModelInfo from "./pages/ModelInfo";
import LiveRadar from "./pages/LiveRadar";
import FlightIntel from "./pages/FlightIntel";
import MlPlayground from "./pages/MlPlayground";

function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove("light-theme");
    } else {
      root.classList.add("light-theme");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-transparent text-cyan-50">
        <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Predict />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/airport-stats" element={<AirportStats />} />
            <Route path="/model-info" element={<ModelInfo />} />
            <Route path="/ml-playground" element={<MlPlayground />} />
            <Route path="/radar" element={<LiveRadar />} />
            <Route path="/intel/:callsign" element={<FlightIntel />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
