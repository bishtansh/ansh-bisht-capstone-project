import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, Target, AlertCircle, CheckCircle, Radio, Plane, Loader2 } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../services/api";

const predictionData = [
  { name: "Mon", onTime: 12, delayed: 4 },
  { name: "Tue", onTime: 19, delayed: 3 },
  { name: "Wed", onTime: 15, delayed: 8 },
  { name: "Thu", onTime: 22, delayed: 5 },
  { name: "Fri", onTime: 30, delayed: 15 },
  { name: "Sat", onTime: 25, delayed: 12 },
  { name: "Sun", onTime: 18, delayed: 6 },
];

const delayReasons = [
  { name: "Weather", value: 45 },
  { name: "Air Traffic", value: 25 },
  { name: "Maintenance", value: 20 },
  { name: "Crew", value: 10 },
];
const COLORS = ["#00c3ff", "#ef4444", "#f59e0b", "#10b981"];

export default function Dashboard() {
  const [liveFlights, setLiveFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveFlights = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/live-flights/`);
        if (response.data && response.data.flights) {
          setLiveFlights(response.data.flights);
        }
      } catch (error) {
        console.error("Failed to fetch live flights", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveFlights();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveFlights, 30000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-6 space-y-6">
      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
        <Activity className="w-8 h-8 text-cyan-400" />
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-cyan-50 tracking-wider">
            ANALYTICS DASHBOARD
          </h1>
          <p className="font-tech text-cyan-400/70 text-sm tracking-widest uppercase">
            System Overview & Metrics
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Predictions", val: "243", icon: Activity, color: "text-blue-400" },
          { label: "On-time Flights", val: "185", icon: CheckCircle, color: "text-green-400" },
          { label: "Delayed Flights", val: "58", icon: AlertCircle, color: "text-red-400" },
          { label: "Avg Confidence", val: "84%", icon: Target, color: "text-cyan-400" }
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} whileHover={{ y: -5 }} className="glass-panel neon-border p-6 rounded-2xl relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-current opacity-5 rounded-full group-hover:scale-150 transition-transform duration-500 ${stat.color}`} />
            <stat.icon className={`w-8 h-8 mb-4 ${stat.color}`} />
            <h3 className="font-tech text-cyan-400/70 text-xs tracking-widest uppercase mb-1">{stat.label}</h3>
            <p className="text-4xl font-orbitron font-bold text-cyan-50">{stat.val}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel neon-border p-6 rounded-2xl">
          <h2 className="font-orbitron font-bold text-lg text-cyan-50 tracking-widest mb-6">WEEKLY PREDICTION TRENDS</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={predictionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00c3ff" opacity={0.1} vertical={false} />
                <XAxis dataKey="name" stroke="#00c3ff" opacity={0.5} tick={{fontFamily: 'Share Tech Mono'}} />
                <YAxis stroke="#00c3ff" opacity={0.5} tick={{fontFamily: 'Share Tech Mono'}} />
                <RechartsTooltip cursor={{fill: '#00c3ff', opacity: 0.05}} contentStyle={{ backgroundColor: '#060d18', border: '1px solid #00c3ff', borderRadius: '8px', fontFamily: 'Share Tech Mono' }} />
                <Bar dataKey="onTime" fill="#10b981" radius={[4, 4, 0, 0]} name="On Time" />
                <Bar dataKey="delayed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Delayed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Delay Reasons Pie Chart */}
        <motion.div variants={itemVariants} className="glass-panel neon-border p-6 rounded-2xl flex flex-col">
          <h2 className="font-orbitron font-bold text-lg text-cyan-50 tracking-widest mb-2">DELAY FACTORS</h2>
          <p className="font-tech text-cyan-400/50 text-xs mb-6 uppercase tracking-widest">Global Distribution</p>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={delayReasons} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {delayReasons.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#060d18', border: '1px solid #00c3ff', borderRadius: '8px', fontFamily: 'Share Tech Mono' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* LIVE TELEMETRY LIST */}
      <motion.div variants={itemVariants} className="glass-panel neon-border p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Radio className="w-6 h-6 text-red-500" />
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
            </div>
            <h2 className="font-orbitron font-bold text-lg text-cyan-50 tracking-widest">LIVE RADAR TELEMETRY</h2>
          </div>
          <span className="font-tech text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded border border-red-500/30 tracking-widest">
            {loading ? "INITIALIZING LINK..." : "LIVE FEED ACTIVE"}
          </span>
        </div>

        <div className="overflow-hidden relative max-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
              <p className="font-tech text-cyan-400/70 tracking-widest">DOWNLOADING SATELLITE DATA...</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[350px] pr-2">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#080f1e] z-10">
                  <tr className="border-b border-cyan-900">
                    <th className="py-3 px-4 font-tech text-cyan-400/70 text-xs tracking-widest uppercase">Callsign</th>
                    <th className="py-3 px-4 font-tech text-cyan-400/70 text-xs tracking-widest uppercase">Origin Country</th>
                    <th className="py-3 px-4 font-tech text-cyan-400/70 text-xs tracking-widest uppercase">Velocity (km/h)</th>
                    <th className="py-3 px-4 font-tech text-cyan-400/70 text-xs tracking-widest uppercase">Altitude (m)</th>
                    <th className="py-3 px-4 font-tech text-cyan-400/70 text-xs tracking-widest uppercase">AI Prediction</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {liveFlights.map((flight, i) => (
                      <motion.tr 
                        key={flight.callsign + i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ backgroundColor: "rgba(0,195,255,0.05)" }}
                        className="border-b border-cyan-900/30 transition-colors"
                      >
                        <td className="py-3 px-4 font-tech text-cyan-50 flex items-center gap-2">
                          <Plane className="w-3 h-3 text-cyan-500" />
                          {flight.callsign}
                        </td>
                        <td className="py-3 px-4 font-inter text-cyan-200/80 text-sm">{flight.country}</td>
                        <td className="py-3 px-4 font-tech text-cyan-200/80">{flight.velocity}</td>
                        <td className="py-3 px-4 font-tech text-cyan-200/80">{flight.altitude || "N/A"}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                            flight.delay ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-green-500/20 text-green-400 border border-green-500/30"
                          }`}>
                            {flight.delay ? `DELAYED (${(flight.confidence*100).toFixed(0)}%)` : `ON TIME (${(flight.confidence*100).toFixed(0)}%)`}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}