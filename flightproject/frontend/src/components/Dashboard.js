import React from "react";
import "animate.css";

function Dashboard() {
  const stats = [
    { title: "Flights Today", value: "1,284", icon: "✈️" },
    { title: "On-Time Rate", value: "82%", icon: "✅" },
    { title: "Delayed Flights", value: "218", icon: "⏱️" },
    { title: "Airports Covered", value: "25+", icon: "🌍" },
  ];

  const modelInfo = [
    { label: "Model Used", value: "Random Forest Classifier" },
    { label: "Accuracy", value: "~87%" },
    { label: "Features", value: "Airline, Route, Time, Duration" },
    { label: "Training Data", value: "Indian Domestic Flights Dataset" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-8">

      {/* 🔷 HEADER */}
      <h1 className="text-4xl font-bold mb-8 text-center">
        ✈️ Flight Dashboard
      </h1>

      {/* 📊 AIRPORT STATS */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        {stats.map((item, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-lg hover:scale-105 transition duration-300 animate__animated animate__fadeInUp"
          >
            <div className="text-3xl">{item.icon}</div>
            <h3 className="text-lg mt-2 text-gray-600">{item.title}</h3>
            <p className="text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* 🧠 MODEL INFO */}
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl mx-auto animate__animated animate__fadeIn">

        <h2 className="text-2xl font-bold mb-6 text-center">
          🧠 Model Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {modelInfo.map((item, i) => (
            <div
              key={i}
              className="p-4 border rounded-xl hover:shadow-md transition"
            >
              <p className="text-gray-500">{item.label}</p>
              <p className="font-semibold text-lg">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;