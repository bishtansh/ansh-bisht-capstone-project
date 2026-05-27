import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowLeft, Activity, Compass, Wind, AlertTriangle, ShieldCheck, Clock, Plane } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

const FlightIntel = () => {
  const { callsign } = useParams();
  const navigate = useNavigate();
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIntel = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/predict/flight-intel/${callsign}/`);
        setIntel(response.data);
      } catch (err) {
        setError('Failed to retrieve telemetry data.');
      } finally {
        setLoading(false);
      }
    };
    fetchIntel();
  }, [callsign]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#06b6d4]"></div>
          <p className="mt-4 text-cyan-400 font-mono tracking-widest animate-pulse">ESTABLISHING UPLINK...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-red-500 font-mono">
        <AlertTriangle className="w-8 h-8 mr-2" /> {error}
      </div>
    );
  }

  const isDelayed = intel.risk_factor > 0.6;
  const statusColor = isDelayed ? 'text-red-500' : 'text-emerald-400';
  const statusBg = isDelayed ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full bg-gray-900 rounded-2xl border border-cyan-500/30 overflow-hidden relative backdrop-blur-sm p-6"
    >
      {/* Background Cyber Effect */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Header */}
      <div className="flex justify-between items-center z-10 border-b border-cyan-500/30 pb-4 mb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/radar')}
            className="p-2 bg-black/50 hover:bg-cyan-900/50 rounded-lg border border-cyan-500/30 transition-colors text-cyan-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              TARGET: {callsign}
            </h1>
            <p className="text-cyan-600 font-mono text-sm tracking-widest">LIVE TELEMETRY ANALYSIS</p>
          </div>
        </div>
        
        <div className={`px-6 py-3 rounded-xl border flex items-center space-x-3 shadow-lg ${statusBg}`}>
          {isDelayed ? <AlertTriangle className={`w-6 h-6 ${statusColor} animate-pulse`} /> : <ShieldCheck className={`w-6 h-6 ${statusColor}`} />}
          <div>
            <div className={`font-mono font-bold ${statusColor}`}>
              {isDelayed ? 'DELAY RISK CRITICAL' : 'TRAJECTORY NOMINAL'}
            </div>
            <div className="text-xs text-gray-400 font-mono">
              RISK FACTOR: {(intel.risk_factor * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10 flex-1 overflow-y-auto custom-scrollbar">
        
        {/* Left Column: Specs */}
        <div className="space-y-6">
          <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-5 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]">
            <h3 className="text-cyan-400 font-mono flex items-center mb-4 border-b border-cyan-500/30 pb-2">
              <Compass className="w-4 h-4 mr-2" /> VITAL STATS
            </h3>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">AIRCRAFT CALLSIGN</span>
                <span className="text-cyan-100 font-bold">{callsign}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">PREDICTED ETA</span>
                <span className="text-cyan-100 font-bold">{intel.predicted_eta_minutes} MINS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">LAST ALTITUDE</span>
                <span className="text-cyan-100 font-bold">
                  {intel.telemetry[intel.telemetry.length-1]?.altitude} m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">LAST VELOCITY</span>
                <span className="text-cyan-100 font-bold">
                  {intel.telemetry[intel.telemetry.length-1]?.velocity} km/h
                </span>
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-purple-500/20 rounded-xl p-5 shadow-[inset_0_0_20px_rgba(168,85,247,0.05)]">
            <h3 className="text-purple-400 font-mono flex items-center mb-4 border-b border-purple-500/30 pb-2">
              <Activity className="w-4 h-4 mr-2" /> AI DIAGNOSTICS
            </h3>
            <div className="space-y-4 font-mono text-sm">
              <p className="text-gray-400">
                Primary factor influencing current trajectory prediction:
              </p>
              <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded text-purple-200">
                {intel.delay_reason.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Charts (takes 2/3 space) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Altitude Chart */}
          <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-5 h-[250px] flex flex-col">
            <h3 className="text-cyan-400 font-mono flex items-center mb-4 text-sm">
              <Plane className="w-4 h-4 mr-2" /> ALTITUDE HISTORY (LAST 2 HRS)
            </h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={intel.telemetry} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.1)" />
                  <XAxis dataKey="time" stroke="#374151" tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'monospace' }} />
                  <YAxis stroke="#374151" tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'monospace' }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#06b6d4', color: '#fff', fontFamily: 'monospace' }}
                  />
                  <Area type="monotone" dataKey="altitude" stroke="#06b6d4" fillOpacity={1} fill="url(#colorAlt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Velocity Chart */}
          <div className="bg-black/40 border border-purple-500/20 rounded-xl p-5 h-[250px] flex flex-col">
            <h3 className="text-purple-400 font-mono flex items-center mb-4 text-sm">
              <Wind className="w-4 h-4 mr-2" /> VELOCITY HISTORY
            </h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={intel.telemetry} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.1)" />
                  <XAxis dataKey="time" stroke="#374151" tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'monospace' }} />
                  <YAxis stroke="#374151" tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'monospace' }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#a855f7', color: '#fff', fontFamily: 'monospace' }}
                  />
                  <Line type="monotone" dataKey="velocity" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#000', stroke: '#a855f7' }} activeDot={{ r: 6, fill: '#a855f7' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default FlightIntel;
