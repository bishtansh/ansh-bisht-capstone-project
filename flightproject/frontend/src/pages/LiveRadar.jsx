import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, AlertTriangle, ShieldCheck, Map as MapIcon, Loader2, Play, CircleAlert, Wind, CloudLightning, Compass } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import airportsData from "../data/airports.json";
import { API_BASE_URL } from "../services/api";

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom Coordinates dictionary for all 31 airports from airports.json
const AIRPORT_COORDS = {
  "DEL": [28.5562, 77.1000],
  "BOM": [19.0896, 72.8656],
  "BLR": [13.1986, 77.7066],
  "HYD": [17.2403, 78.4294],
  "MAA": [12.9941, 80.1709],
  "CCU": [22.6547, 88.4467],
  "COK": [10.1520, 76.4019],
  "AMD": [23.0772, 72.6347],
  "PNQ": [18.5822, 73.9197],
  "GOI": [15.3808, 73.8314],
  "SXR": [34.0047, 74.7978],
  "JAI": [26.8242, 75.8122],
  "LKO": [26.7606, 80.8893],
  "GAU": [26.1061, 91.5859],
  "ATQ": [31.7096, 74.7973],
  "PAT": [25.5912, 85.0882],
  "BBI": [20.2444, 85.8178],
  "VTZ": [17.7211, 83.2244],
  "CJB": [11.0300, 77.0434]
};

// Custom icons helper
const createPlaneIcon = (heading, isDelayed) => {
  const color = isDelayed ? '#ef4444' : '#00c3ff';
  const rotation = heading || 0;
  return L.divIcon({
    className: 'custom-plane-icon',
    html: `<div style="transform: rotate(${rotation}deg); color: ${color}; filter: drop-shadow(0 0 5px ${color}); font-size: 24px;">✈</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const createSimIcon = (heading) => {
  return L.divIcon({
    className: 'custom-sim-icon',
    html: `<div style="transform: rotate(${heading}deg); color: #c084fc; filter: drop-shadow(0 0 8px #c084fc); font-size: 28px; font-weight: bold;">✈</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const LiveRadar = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showWeather, setShowWeather] = useState(true);
  const navigate = useNavigate();

  // Tab systems: 'active' (real OpenSky list) or 'simulator' (advanced path simulator)
  const [activeTab, setActiveTab] = useState('live');

  // Route simulator states
  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('BOM');
  const [simPercent, setSimPercent] = useState(35);
  const [autoPlay, setAutoPlay] = useState(false);
  const [lockCamera, setLockCamera] = useState(false);

  // Weather pattern along current simulated route
  const [weatherIntensity, setWeatherIntensity] = useState(60); // 0 to 100

  const fetchFlights = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/live-flights/`);
      if (response.data.flights) {
        setFlights(response.data.flights);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching live flights:', err);
      setError('Failed to sync with orbital satellites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 12000);
    return () => clearInterval(interval);
  }, []);

  // Autoplay simulation thread
  useEffect(() => {
    let playTimer;
    if (autoPlay) {
      playTimer = setInterval(() => {
        setSimPercent(prev => (prev >= 100 ? 0 : prev + 1));
      }, 350);
    }
    return () => clearInterval(playTimer);
  }, [autoPlay]);

  // Generate geodesic intermediate coordinates
  const getSimCoordinates = () => {
    const p1 = AIRPORT_COORDS[origin] || [39.8, -98.5];
    const p2 = AIRPORT_COORDS[destination] || [34.0, -118.2];
    
    // Simple interpolation
    const interpolated = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lat = p1[0] + (p2[0] - p1[0]) * t;
      const lng = p1[1] + (p2[1] - p1[1]) * t;
      interpolated.push([lat, lng]);
    }

    const currentIdx = Math.min(Math.max(0, Math.floor(simPercent)), steps);
    const currentPos = interpolated[currentIdx];

    // Calculate heading (angle)
    const dy = p2[0] - p1[0];
    const dx = p2[1] - p1[1];
    let heading = Math.atan2(dx, dy) * (180 / Math.PI);
    if (heading < 0) heading += 360;

    // Define storm center at 50% midpoint
    const stormCenter = interpolated[Math.floor(steps / 2)];
    
    // Check distance between plane and storm to trigger delay calculation
    const distToStorm = Math.sqrt(
      Math.pow(currentPos[0] - stormCenter[0], 2) + 
      Math.pow(currentPos[1] - stormCenter[1], 2)
    );

    // Weather zone intersection logic
    const inStormZone = distToStorm < 6.5; // threshold radius
    const stormEffect = inStormZone ? (weatherIntensity * 0.006) : 0;
    
    // Cruising speed and altitude curves
    let altitude = 10600; // default cruise (meters)
    let velocity = 840; // default cruise (km/h)

    if (simPercent < 15) {
      // Climb
      altitude = Math.round((simPercent / 15) * 10600);
      velocity = Math.round(250 + (simPercent / 15) * 590);
    } else if (simPercent > 85) {
      // Descent
      altitude = Math.round(((100 - simPercent) / 15) * 10600);
      velocity = Math.round(200 + ((100 - simPercent) / 15) * 640);
    }

    // Dynamic headwinds
    const windSpeed = Math.round((weatherIntensity * 0.4) + (inStormZone ? 30 : 5));

    // Delay risk calculations
    const baseDelayRisk = 0.15 + (weatherIntensity * 0.0035);
    const delayRisk = Math.min(0.99, baseDelayRisk + (inStormZone ? 0.45 : 0));

    return { 
      path: interpolated, 
      currentPos, 
      heading, 
      stormCenter, 
      inStormZone, 
      altitude, 
      velocity, 
      windSpeed, 
      delayRisk 
    };
  };

  const simInfo = getSimCoordinates();

  const filteredFlights = flights.filter(f => 
    f.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.country && f.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-gray-900/50 rounded-2xl border border-cyan-500/30 overflow-hidden relative backdrop-blur-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/30 bg-gray-900/80 z-20">
        <div className="flex items-center space-x-3">
          <MapIcon className="w-6 h-6 text-cyan-400 filter drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
          <h2 className="text-xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-wider">
            AIRSPACE TELEMETRY SIMULATOR
          </h2>
          {loading && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-cyan-500/20">
          <button 
            onClick={() => setActiveTab('live')}
            className={`px-4 py-1.5 rounded-lg text-xs font-tech font-bold uppercase transition-all tracking-wider ${activeTab === 'live' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,195,255,0.3)]' : 'text-cyan-500/70 hover:text-cyan-300'}`}
          >
            🛰️ Live Satellites
          </button>
          <button 
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-1.5 rounded-lg text-xs font-tech font-bold uppercase transition-all tracking-wider ${activeTab === 'simulator' ? 'bg-purple-500 text-cyan-50 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'text-purple-400/70 hover:text-purple-300'}`}
          >
            🕹️ Path Simulator
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowWeather(!showWeather)}
            className={`px-3 py-1 rounded border text-[10px] font-tech font-bold uppercase transition-colors tracking-widest ${showWeather ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-black/50 border-gray-600 text-gray-500'}`}
          >
            Toggle NEXRAD Weather
          </button>
          <div className="text-xs font-tech text-cyan-500/70 uppercase">
            Live Targets: {flights.length}
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Controls / Lists */}
        <div className="w-1/3 max-w-sm border-r border-cyan-500/30 flex flex-col bg-[#070d19]/80 backdrop-blur-md z-10">
          
          {activeTab === 'live' ? (
            /* Live Flights Search & List */
            <>
              <div className="p-4 border-b border-cyan-500/20">
                <input
                  type="text"
                  placeholder="SEARCH CALLSIGN OR ORIGIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/30 rounded-lg px-4 py-2.5 text-xs text-cyan-50 font-tech focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder-cyan-800 transition-all uppercase tracking-widest"
                />
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {error && (
                  <div className="p-4 text-red-400 text-xs font-tech text-center border border-red-500/30 rounded-lg bg-red-500/10 uppercase tracking-wider">
                    {error}
                  </div>
                )}
                
                <AnimatePresence>
                  {filteredFlights.map((flight) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      key={flight.callsign}
                      onClick={() => setSelectedFlight(flight)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 font-tech ${
                        selectedFlight?.callsign === flight.callsign
                          ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_12px_rgba(0,195,255,0.1)]'
                          : 'bg-slate-950/40 border-cyan-500/10 hover:border-cyan-400/40'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-cyan-300 text-sm">{flight.callsign}</span>
                        <span className="text-[10px] text-gray-500 tracking-wider uppercase">{flight.country}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>ALT: {Math.round(flight.altitude || 0)}m</span>
                        <span>SPD: {flight.velocity}km/h</span>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t border-cyan-500/10 flex items-center justify-between">
                        <span className="text-[10px] text-gray-600 uppercase tracking-widest">DELAY PROB:</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          flight.delay ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {flight.confidence ? (flight.confidence * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {!loading && filteredFlights.length === 0 && (
                  <div className="p-8 text-center text-cyan-800 font-tech text-xs uppercase tracking-widest">
                    No satellite targets active.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Advanced Route Path Simulator Tab */
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-5 space-y-6">
              
              <div className="space-y-4">
                <h3 className="font-orbitron font-bold text-xs text-purple-300 tracking-wider uppercase border-b border-purple-500/20 pb-2">
                  ROUTE PLANNER
                </h3>
                
                <div className="space-y-3 font-tech">
                  <div className="space-y-1">
                    <label className="text-[10px] text-purple-400/80 uppercase tracking-widest">Origin Terminal</label>
                    <select 
                      value={origin}
                      onChange={(e) => { setOrigin(e.target.value); setSimPercent(0); }}
                      className="w-full bg-slate-950 border border-purple-500/30 rounded-lg p-2.5 text-xs text-cyan-50 font-tech focus:outline-none focus:border-purple-400"
                    >
                      {airportsData.map(ap => (
                        <option key={ap.value} value={ap.value}>{ap.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-purple-400/80 uppercase tracking-widest">Destination Terminal</label>
                    <select 
                      value={destination}
                      onChange={(e) => { setDestination(e.target.value); setSimPercent(0); }}
                      className="w-full bg-slate-950 border border-purple-500/30 rounded-lg p-2.5 text-xs text-cyan-50 font-tech focus:outline-none focus:border-purple-400"
                    >
                      {airportsData.map(ap => (
                        <option key={ap.value} value={ap.value}>{ap.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Weather intensity slider */}
              <div className="space-y-2">
                <div className="flex justify-between font-tech text-[10px] text-purple-400 tracking-widest uppercase">
                  <span>Weather Storm Intensity</span>
                  <span className="text-red-400 font-bold">{weatherIntensity}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={weatherIntensity}
                  onChange={(e) => setWeatherIntensity(Number(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              {/* Simulation Progress Slider */}
              <div className="space-y-3 p-4 bg-slate-950/60 border border-purple-500/20 rounded-xl">
                <div className="flex justify-between font-tech text-[10px] text-purple-400 tracking-widest uppercase">
                  <span>TRAJECTORY POSITION</span>
                  <span className="text-cyan-400 font-bold">{simPercent}%</span>
                </div>
                
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={simPercent}
                  onChange={(e) => setSimPercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />

                <div className="flex justify-between items-center pt-2">
                  <button 
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`px-3 py-1 rounded font-tech text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${autoPlay ? 'bg-purple-500 text-white shadow-[0_0_8px_#a855f7]' : 'bg-slate-900 border border-purple-500/30 text-purple-300'}`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    {autoPlay ? 'PAUSE AUTO' : 'RUN AUTO'}
                  </button>

                  <button 
                    onClick={() => setLockCamera(!lockCamera)}
                    className={`px-3 py-1 rounded font-tech text-[10px] font-bold uppercase tracking-wider transition-all ${lockCamera ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400' : 'bg-slate-900 border border-purple-500/30 text-purple-400/80'}`}
                  >
                    {lockCamera ? '🔒 Camera Locked' : '🔓 Camera Free'}
                  </button>
                </div>
              </div>

              {/* Real-time Telemetry Indicators */}
              <div className="space-y-4">
                <h3 className="font-orbitron font-bold text-xs text-cyan-400 tracking-wider uppercase border-b border-cyan-500/20 pb-2">
                  REAL-TIME TELEMETRY
                </h3>

                <div className="grid grid-cols-2 gap-3 font-tech text-xs">
                  <div className="bg-slate-950/60 border border-cyan-500/10 p-3 rounded-lg flex flex-col justify-between">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest">Altitude</span>
                    <span className="text-sm font-bold text-cyan-100 mt-1">{simInfo.altitude} m</span>
                  </div>

                  <div className="bg-slate-950/60 border border-cyan-500/10 p-3 rounded-lg flex flex-col justify-between">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest">Velocity</span>
                    <span className="text-sm font-bold text-cyan-100 mt-1">{simInfo.velocity} km/h</span>
                  </div>

                  <div className="bg-slate-950/60 border border-cyan-500/10 p-3 rounded-lg flex flex-col justify-between">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest">Headwinds</span>
                    <span className="text-sm font-bold text-cyan-100 mt-1 flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-cyan-400" />
                      {simInfo.windSpeed} knots
                    </span>
                  </div>

                  <div className="bg-slate-950/60 border border-cyan-500/10 p-3 rounded-lg flex flex-col justify-between">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest">Trajectory Heading</span>
                    <span className="text-sm font-bold text-cyan-100 mt-1 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      {Math.round(simInfo.heading)}°
                    </span>
                  </div>
                </div>

                {/* Delay Risk Panel */}
                <div className={`p-4 rounded-xl border font-tech text-xs ${simInfo.inStormZone ? 'bg-red-500/10 border-red-500/40 animate-pulse' : 'bg-slate-950/60 border-cyan-500/10'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold uppercase tracking-widest text-[10px]">Delay Risk Quotient</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${simInfo.inStormZone ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {simInfo.inStormZone ? 'HAZARD ZONE ALERT' : 'ROUTE STABLE'}
                    </span>
                  </div>
                  
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className={`text-3xl font-orbitron font-bold ${simInfo.inStormZone ? 'text-red-400' : 'text-emerald-400'}`}>
                      {(simInfo.delayRisk * 100).toFixed(0)}%
                    </span>
                    <span className="text-gray-500 uppercase tracking-wider text-[9px]">probability</span>
                  </div>

                  {simInfo.inStormZone && (
                    <div className="flex items-start gap-2 bg-red-950/30 border border-red-500/20 p-2.5 rounded text-red-200 text-[10px] leading-relaxed">
                      <CloudLightning className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>WEATHER ALERT: Heavy precipitation and high headwinds detected at midpoint airspace coordinates. Re-routing recommended.</span>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Map Canvas Area */}
        <div className="flex-1 relative bg-black">
          {/* Neon overlay */}
          <div className="absolute inset-0 pointer-events-none z-[400] mix-blend-overlay opacity-30 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="absolute inset-0 pointer-events-none z-[400] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]"></div>
          
          <MapContainer 
            center={[20.5937, 78.9629]} 
            zoom={5} 
            className="w-full h-full z-0"
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {showWeather && (
              <TileLayer
                url="https://mesonet.agron.iastate.edu/cache/c/0/uscomp/{z}/{x}/{y}.png"
                opacity={0.35}
                attribution='Iowa Environmental Mesonet'
              />
            )}
            
            {activeTab === 'live' ? (
              /* Live Satellites Markers */
              flights.map((flight) => (
                flight.latitude && flight.longitude && (
                  <Marker 
                    key={flight.callsign}
                    position={[flight.latitude, flight.longitude]}
                    icon={createPlaneIcon(flight.heading, flight.delay)}
                    eventHandlers={{
                      click: () => setSelectedFlight(flight),
                    }}
                  >
                    <Popup className="cyber-popup">
                      <div className="bg-slate-950/95 border border-cyan-500/50 p-4 rounded-xl font-tech min-w-[210px] shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
                          <span className="font-bold text-cyan-300 text-base">{flight.callsign}</span>
                          {flight.delay ? (
                            <AlertTriangle className="w-4.5 h-4.5 text-red-500 animate-pulse" />
                          ) : (
                            <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                          )}
                        </div>
                        
                        <div className="space-y-1.5 text-xs text-cyan-100/90">
                          <div className="flex justify-between">
                            <span className="text-gray-500">ORIGIN:</span>
                            <span className="font-semibold">{flight.country}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">SPEED:</span>
                            <span className="font-semibold">{flight.velocity} km/h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">ALTITUDE:</span>
                            <span className="font-semibold">{Math.round(flight.altitude || 0)} m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">HEADING:</span>
                            <span className="font-semibold">{Math.round(flight.heading || 0)}°</span>
                          </div>
                          <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-cyan-500/20">
                            <span className="text-gray-400 text-[10px] uppercase tracking-widest">DELAY EST:</span>
                            <span className={`font-bold ${flight.delay ? 'text-red-400' : 'text-emerald-400'}`}>
                              {flight.confidence ? (flight.confidence * 100).toFixed(1) : 0}%
                            </span>
                          </div>
                          <button 
                            onClick={() => navigate(`/intel/${flight.callsign}`)}
                            className="mt-3.5 w-full py-1.5 bg-cyan-900/40 hover:bg-cyan-600/50 border border-cyan-500/50 rounded text-cyan-300 text-[10px] font-bold tracking-widest uppercase transition-colors"
                          >
                            VIEW FULL INTEL
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))
            ) : (
              /* Simulated Flight Path & Elements */
              <>
                {/* 1. Airport Node Markers */}
                {AIRPORT_COORDS[origin] && (
                  <Marker 
                    position={AIRPORT_COORDS[origin]}
                    icon={L.divIcon({
                      className: 'origin-node',
                      html: `<div style="background: #a855f7; border: 2px solid #fff; box-shadow: 0 0 10px #a855f7; width: 12px; height: 12px; border-radius: 50%;"></div>`
                    })}
                  >
                    <Popup className="cyber-popup">
                      <div className="bg-slate-950 p-2 rounded border border-purple-500/30 text-white font-tech text-xs">
                        <strong>ORIGIN:</strong> {origin} Airport
                      </div>
                    </Popup>
                  </Marker>
                )}

                {AIRPORT_COORDS[destination] && (
                  <Marker 
                    position={AIRPORT_COORDS[destination]}
                    icon={L.divIcon({
                      className: 'dest-node',
                      html: `<div style="background: #10b981; border: 2px solid #fff; box-shadow: 0 0 10px #10b981; width: 12px; height: 12px; border-radius: 50%;"></div>`
                    })}
                  >
                    <Popup className="cyber-popup">
                      <div className="bg-slate-950 p-2 rounded border border-emerald-500/30 text-white font-tech text-xs">
                        <strong>DESTINATION:</strong> {destination} Airport
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* 2. Geodesic Flight Corridor Polyline */}
                {simInfo.path && (
                  <Polyline 
                    positions={simInfo.path} 
                    pathOptions={{ 
                      color: '#a855f7', 
                      weight: 3, 
                      dashArray: '8, 8',
                      opacity: 0.7 
                    }} 
                  />
                )}

                {/* 3. Weather storm circle warning system */}
                {simInfo.stormCenter && (
                  <>
                    <Circle 
                      center={simInfo.stormCenter} 
                      radius={150000} 
                      pathOptions={{ 
                        color: '#ef4444', 
                        fillColor: '#ef4444', 
                        fillOpacity: 0.12, 
                        weight: 2 
                      }} 
                    />
                    <Circle 
                      center={simInfo.stormCenter} 
                      radius={35000} 
                      pathOptions={{ 
                        color: '#ef4444', 
                        fillColor: '#ef4444', 
                        fillOpacity: 0.35, 
                        weight: 1 
                      }} 
                    />
                  </>
                )}

                {/* 4. Active Simulated Plane Marker */}
                {simInfo.currentPos && (
                  <Marker 
                    position={simInfo.currentPos} 
                    icon={createSimIcon(simInfo.heading)}
                  >
                    <Popup className="cyber-popup">
                      <div className="bg-slate-950/95 border border-purple-500/50 p-4 rounded-xl font-tech min-w-[210px] shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                        <div className="flex items-center justify-between border-b border-purple-500/20 pb-2 mb-2">
                          <span className="font-bold text-purple-300 text-base">SIM_FLIGHT_99</span>
                          <CircleAlert className={`w-4.5 h-4.5 ${simInfo.inStormZone ? 'text-red-500 animate-bounce' : 'text-purple-400'}`} />
                        </div>
                        <div className="space-y-1.5 text-xs text-purple-100">
                          <div className="flex justify-between">
                            <span className="text-gray-500">CORRIDOR:</span>
                            <span className="font-semibold">{origin} → {destination}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">VELOCITY:</span>
                            <span className="font-semibold">{simInfo.velocity} km/h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">ALTITUDE:</span>
                            <span className="font-semibold">{simInfo.altitude} m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">DELAY PROB:</span>
                            <span className={`font-bold ${simInfo.inStormZone ? 'text-red-400' : 'text-purple-300'}`}>
                              {(simInfo.delayRisk * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </>
            )}
            
            {/* Map Camera fly logic */}
            <MapController selectedFlight={selectedFlight} simPos={simInfo.currentPos} lockCamera={lockCamera} />
          </MapContainer>
        </div>
      </div>
      
      {/* Global styles overrides */}
      <style>{`
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: transparent;
          box-shadow: none;
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 0;
          line-height: normal;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6,182,212,0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6,182,212,0.6);
        }
      `}</style>
    </div>
  );
};

// Component to handle map panning
const MapController = ({ selectedFlight, simPos, lockCamera }) => {
  const map = useMap();
  
  useEffect(() => {
    if (lockCamera && simPos) {
      map.panTo(simPos, { animate: true, duration: 0.5 });
    } else if (selectedFlight && selectedFlight.latitude && selectedFlight.longitude) {
      map.flyTo([selectedFlight.latitude, selectedFlight.longitude], 7, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [selectedFlight, simPos, lockCamera, map]);
  
  return null;
};

export default LiveRadar;
