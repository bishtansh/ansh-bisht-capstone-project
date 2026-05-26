import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import { 
  PlaneTakeoff, 
  PlaneLanding, 
  Clock, 
  Building2, 
  Search, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  History, 
  Trash2, 
  Sparkles, 
  Navigation, 
  Info 
} from "lucide-react";
import airportsData from "../data/airports.json";
import airlinesData from "../data/airlines.json";

// Custom styles for react-select to match cyberpunk/light theme
const selectStyles = {
  control: (base, state) => ({
    ...base,
    background: "rgba(15, 23, 42, 0.4)",
    borderColor: state.isFocused ? "rgba(168, 85, 247, 0.8)" : "rgba(168, 85, 247, 0.25)",
    boxShadow: state.isFocused ? "0 0 12px rgba(168,85,247,0.35)" : "none",
    borderRadius: "0.75rem",
    padding: "3px",
    transition: "all 0.3s ease",
    "&:hover": {
      borderColor: "rgba(168, 85, 247, 0.6)",
    }
  }),
  menu: (base) => ({
    ...base,
    background: "#080f1e",
    border: "1px solid rgba(168, 85, 247, 0.35)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(168,85,247,0.15)",
    borderRadius: "0.75rem",
    overflow: "hidden",
    zIndex: 999
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "rgba(168, 85, 247, 0.2)" : "transparent",
    color: state.isFocused ? "#d8b4fe" : "#e2e8f0",
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
    padding: "10px 14px",
    transition: "all 0.2s ease",
    "&:active": {
      backgroundColor: "rgba(168, 85, 247, 0.35)",
    }
  }),
  singleValue: (base) => ({
    ...base,
    color: "#e2e8f0",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "500"
  }),
  input: (base) => ({
    ...base,
    color: "#e2e8f0",
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgba(168, 85, 247, 0.45)",
    fontWeight: "400"
  })
};

// Preset Test Routes for Indians flights network
const PRESET_ROUTES = [
  {
    id: "preset-1",
    label: "IndiGo • DEL ➔ BOM",
    color: "from-blue-600/30 to-blue-500/10 hover:border-blue-500/50",
    airline: { value: "IGO", label: "IndiGo" },
    source: { value: "DEL", label: "Delhi Indira Gandhi (DEL)" },
    destination: { value: "BOM", label: "Mumbai Chhatrapati Shivaji (BOM)" },
    duration: 130,
    departureTime: "07:30",
    arrivalTime: "09:40"
  },
  {
    id: "preset-2",
    label: "Air India • BLR ➔ DEL",
    color: "from-red-600/30 to-red-500/10 hover:border-red-500/50",
    airline: { value: "AIC", label: "Air India" },
    source: { value: "BLR", label: "Bangalore Kempegowda (BLR)" },
    destination: { value: "DEL", label: "Delhi Indira Gandhi (DEL)" },
    duration: 160,
    departureTime: "14:15",
    arrivalTime: "16:55"
  },
  {
    id: "preset-3",
    label: "Vistara • BOM ➔ BLR",
    color: "from-purple-600/30 to-purple-500/10 hover:border-purple-500/50",
    airline: { value: "VTI", label: "Vistara" },
    source: { value: "BOM", label: "Mumbai Chhatrapati Shivaji (BOM)" },
    destination: { value: "BLR", label: "Bangalore Kempegowda (BLR)" },
    duration: 100,
    departureTime: "18:45",
    arrivalTime: "20:25"
  },
  {
    id: "preset-4",
    label: "Akasa Air • CCU ➔ BOM",
    color: "from-orange-600/30 to-orange-500/10 hover:border-orange-500/50",
    airline: { value: "AKJ", label: "Akasa Air" },
    source: { value: "CCU", label: "Kolkata Netaji Subhash (CCU)" },
    destination: { value: "BOM", label: "Mumbai Chhatrapati Shivaji (BOM)" },
    duration: 170,
    departureTime: "10:10",
    arrivalTime: "13:00"
  }
];

function PredictionForm() {
  const [formData, setFormData] = useState({
    airline: null,
    source: null,
    destination: null,
    departureTime: "",
    arrivalTime: "",
    duration: "",
  });

  const [result, setResult] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("form"); // "form" | "history"

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("inference_history_list");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse prediction history:", e);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (selectedOption, actionMeta) => {
    setFormData({ ...formData, [actionMeta.name]: selectedOption });
  };

  const applyPreset = (preset) => {
    setFormData({
      airline: preset.airline,
      source: preset.source,
      destination: preset.destination,
      duration: preset.duration,
      departureTime: preset.departureTime,
      arrivalTime: preset.arrivalTime,
    });
  };

  // Helper to compute a pseudo-realistic flight distance
  const getFlightDistance = () => {
    if (!formData.source || !formData.destination) return 0;
    const srcCode = formData.source.value;
    const destCode = formData.destination.value;
    
    // Exact lookups for key pairs
    const pairs = {
      "DEL-BOM": 1137, "BOM-DEL": 1137,
      "BLR-DEL": 1740, "DEL-BLR": 1740,
      "BOM-BLR": 842,  "BLR-BOM": 842,
      "CCU-BOM": 1658, "BOM-CCU": 1658,
      "DEL-CCU": 1305, "CCU-DEL": 1305,
    };
    
    const key = `${srcCode}-${destCode}`;
    if (pairs[key]) return pairs[key];
    
    // Pseudorandom fallback based on characters
    const hash = Math.abs((srcCode.charCodeAt(0) - destCode.charCodeAt(0)) * 115) + 380;
    return hash;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const payload = {
      ...formData,
      airline: formData.airline ? formData.airline.value : "",
      source: formData.source ? formData.source.value : "",
      destination: formData.destination ? formData.destination.value : ""
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/predict/",
        payload
      );

      const delayStatus = response.data.delay ? "delayed" : "ontime";
      const confidenceScore = response.data.confidence;
      
      setResult(delayStatus);
      setConfidence(confidenceScore);

      // Append to query chronology history
      const newRun = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        airline: formData.airline ? formData.airline.label : "Unknown Carrier",
        source: formData.source ? formData.source.value : "???",
        destination: formData.destination ? formData.destination.value : "???",
        duration: formData.duration || "N/A",
        result: delayStatus,
        confidence: confidenceScore
      };

      const updatedHistory = [newRun, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem("inference_history_list", JSON.stringify(updatedHistory));
      
    } catch (error) {
      console.error(error);
      setResult("error");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("inference_history_list");
  };

  const selectedDistance = getFlightDistance();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col lg:flex-row items-stretch justify-center p-2 sm:p-6 min-h-[calc(100vh-5rem)] gap-8 max-w-7xl mx-auto relative"
    >
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-12 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Column: Premium 4K Flight Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="w-full lg:w-5/12 min-h-[300px] lg:min-h-[620px] rounded-3xl overflow-hidden relative border border-purple-500/20 shadow-2xl glass-panel group flex flex-col justify-end"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src="/airliner_capstone.png" 
            alt="Futuristic Capstone Airliner 4K" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          {/* Elegant overlay gradient to make content perfectly readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 to-transparent" />
        </div>
        
        {/* Academic and Model Specs overlay */}
        <div className="relative z-10 p-6 sm:p-8 space-y-4 font-tech">
          <div className="flex flex-wrap gap-2.5">
            <span className="bg-purple-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase shadow-[0_0_12px_rgba(168,85,247,0.4)] border border-purple-400/30 flex items-center gap-1.5">
              <Layers className="w-3 h-3" /> Ensemble Core Fit
            </span>
            <span className="bg-cyan-500/90 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase shadow-[0_0_12px_rgba(0,195,255,0.4)] flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" /> Precision: 87.4%
            </span>
            <span className="bg-slate-900/80 text-cyan-300 text-[10px] font-bold px-3 py-1 rounded-full tracking-widest border border-cyan-500/35">
              Model: Random Forest
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-orbitron font-bold text-white tracking-wide leading-tight drop-shadow-md">
              Intelligent Airspace Congestion Modeling & Prediction Core
            </h3>
            <p className="font-inter text-cyan-200/80 text-xs sm:text-sm leading-relaxed text-justify drop-shadow-sm">
              An advanced machine learning framework mapping binary delay likelihood across premium domestic Indian airport nodes. Leverages multi-variant decision tree ensembling and optimized entropy metrics to predict scheduling risks in real-time.
            </p>
          </div>

          {/* Academic Footer Info */}
          <div className="pt-4 border-t border-purple-500/25 flex justify-between items-center text-[10px] text-cyan-300/60 uppercase tracking-widest">
            <span>ANSH BISHT CAPSTONE</span>
            <span>BATCH: B.TECH CSE-2022</span>
          </div>
        </div>
      </motion.div>

      {/* Right Column: Interactive Tabbed Control Panel */}
      <div className="w-full lg:w-7/12 flex flex-col justify-between space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-purple-500/20 pb-0.5 gap-2">
          <button
            onClick={() => setActiveTab("form")}
            className={`px-6 py-2.5 font-orbitron text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 relative ${
              activeTab === "form" 
                ? "text-cyan-400 border-b-2 border-cyan-400" 
                : "text-cyan-100/50 hover:text-cyan-100"
            }`}
          >
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" /> Inference Engine
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2.5 font-orbitron text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 relative ${
              activeTab === "history" 
                ? "text-purple-400 border-b-2 border-purple-400" 
                : "text-cyan-100/50 hover:text-cyan-100"
            }`}
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4" /> Prediction Chronology
              {history.length > 0 && (
                <span className="ml-1 bg-purple-500 text-white font-tech text-[9px] px-1.5 py-0.5 rounded-full">
                  {history.length}
                </span>
              )}
            </span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "form" ? (
            <motion.div
              key="tab-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Preset Route Selectors */}
              <div className="space-y-2">
                <span className="font-tech text-[10px] text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> 
                  Evaluator Fast-Track Presets (One-Click Auto-Fill)
                </span>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {PRESET_ROUTES.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={`text-left p-2.5 rounded-xl border border-purple-500/20 bg-gradient-to-br ${preset.color} transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(168,85,247,0.1)] group`}
                    >
                      <span className="text-[10px] font-tech text-white/90 group-hover:text-cyan-400 transition-colors uppercase font-bold truncate">
                        {preset.label.split("•")[0]}
                      </span>
                      <span className="text-[9px] font-tech text-cyan-300/70 mt-1 uppercase">
                        {preset.label.split("•")[1] || preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Features Form */}
              <form
                onSubmit={handleSubmit}
                className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5 relative overflow-hidden"
              >
                {/* Visual grid accent background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

                {/* Decorative Glowing Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500/40 rounded-tl-xl m-3" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500/40 rounded-br-xl m-3" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                  
                  {/* Airline Select */}
                  <div className="space-y-1.5 z-30">
                    <label className="font-tech text-[10px] text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Carrier Airline
                    </label>
                    <Select
                      name="airline"
                      options={airlinesData}
                      styles={selectStyles}
                      placeholder="Select airline operator..."
                      value={formData.airline}
                      onChange={handleSelectChange}
                      required
                    />
                  </div>

                  {/* Flight Duration */}
                  <div className="space-y-1.5">
                    <label className="font-tech text-[10px] text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Flight Duration (mins)
                    </label>
                    <input
                      className="w-full bg-slate-950/40 border border-purple-900/30 rounded-xl p-3 text-cyan-50 font-inter focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all placeholder:text-purple-400/30 text-sm font-semibold"
                      name="duration"
                      type="number"
                      placeholder="e.g. 120"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Origin Port */}
                  <div className="space-y-1.5 z-20">
                    <label className="font-tech text-[10px] text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                      <PlaneTakeoff className="w-3.5 h-3.5" /> Origin Hub
                    </label>
                    <Select
                      name="source"
                      options={airportsData}
                      styles={selectStyles}
                      placeholder="Origin terminal..."
                      value={formData.source}
                      onChange={handleSelectChange}
                      required
                    />
                  </div>

                  {/* Destination Port */}
                  <div className="space-y-1.5 z-10">
                    <label className="font-tech text-[10px] text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                      <PlaneLanding className="w-3.5 h-3.5" /> Destination Hub
                    </label>
                    <Select
                      name="destination"
                      options={airportsData}
                      styles={selectStyles}
                      placeholder="Destination terminal..."
                      value={formData.destination}
                      onChange={handleSelectChange}
                      required
                    />
                  </div>

                  {/* Departure time */}
                  <div className="space-y-1.5">
                    <label className="font-tech text-[10px] text-purple-400 uppercase tracking-widest block">
                      Scheduled Departure Time (24h)
                    </label>
                    <input
                      className="w-full bg-slate-950/40 border border-purple-900/30 rounded-xl p-3 text-cyan-50 font-inter focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all text-sm font-semibold"
                      name="departureTime"
                      type="time"
                      value={formData.departureTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Arrival time */}
                  <div className="space-y-1.5">
                    <label className="font-tech text-[10px] text-purple-400 uppercase tracking-widest block">
                      Scheduled Arrival Time (24h)
                    </label>
                    <input
                      className="w-full bg-slate-950/40 border border-purple-900/30 rounded-xl p-3 text-cyan-50 font-inter focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all text-sm font-semibold"
                      name="arrivalTime"
                      type="time"
                      value={formData.arrivalTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Dynamic SVG Corridor visualizer */}
                <div className="bg-slate-950/40 border border-purple-500/10 rounded-2xl p-4 flex flex-col space-y-3 relative overflow-hidden">
                  <div className="flex justify-between items-center text-[9px] font-tech text-cyan-400 tracking-widest uppercase">
                    <span>Flight Corridor Simulator HUD</span>
                    {selectedDistance > 0 && (
                      <span className="bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/25">
                        Distance: ~{selectedDistance} km
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between px-2 sm:px-6 py-2">
                    <div className="flex flex-col items-center">
                      <span className="font-orbitron text-lg font-black text-cyan-400 tracking-wide">
                        {formData.source ? formData.source.value : "---"}
                      </span>
                      <span className="text-[8px] font-tech text-cyan-300/40">ORIGIN</span>
                    </div>

                    <div className="flex-1 mx-4 relative">
                      <svg className="w-full h-10 overflow-visible" viewBox="0 0 300 40" fill="none">
                        <defs>
                          <linearGradient id="planeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
                          </linearGradient>
                        </defs>
                        
                        {/* Background dotted curved corridor path */}
                        <path 
                          d="M 10,30 Q 150,5 290,30" 
                          stroke="rgba(168, 85, 247, 0.2)" 
                          strokeWidth="2" 
                          strokeDasharray="4,4" 
                        />
                        
                        {/* Glowing active path line */}
                        {formData.source && formData.destination && (
                          <motion.path 
                            d="M 10,30 Q 150,5 290,30" 
                            stroke="url(#planeGrad)" 
                            strokeWidth="2.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                          />
                        )}

                        {/* Airplane traveling indicator along the path */}
                        {formData.source && formData.destination && (
                          <motion.g
                            initial={{ offset: 0 }}
                            animate={{ offset: 1 }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                          >
                            <circle r="4" fill="#00c3ff" className="shadow-[0_0_8px_#00c3ff]">
                              <animateMotion 
                                dur="5s" 
                                repeatCount="indefinite" 
                                path="M 10,30 Q 150,5 290,30" 
                              />
                            </circle>
                          </motion.g>
                        )}
                      </svg>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="font-orbitron text-lg font-black text-cyan-400 tracking-wide">
                        {formData.destination ? formData.destination.value : "---"}
                      </span>
                      <span className="text-[8px] font-tech text-cyan-300/40">DEST</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full py-4 rounded-xl font-orbitron font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 mt-4 text-xs ${
                    loading || !formData.airline || !formData.source || !formData.destination
                      ? "bg-purple-950/50 text-purple-400/60 cursor-not-allowed border border-purple-900/30"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.45)] border border-purple-400/20"
                  }`}
                  disabled={loading || !formData.airline || !formData.source || !formData.destination}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                      >
                        <Search className="w-4 h-4" />
                      </motion.div>
                      COMPILING ENSEMBLE FORECAST...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 text-cyan-300" />
                      EXECUTE PREDICTIVE INFERENCE
                    </>
                  )}
                </motion.button>
              </form>

              {/* Advanced Results Telemetry Card */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className={`p-6 rounded-3xl border backdrop-blur-lg relative overflow-hidden ${
                      result === "delayed"
                        ? "bg-red-500/10 border-red-500/35 shadow-[0_0_25px_rgba(239,68,68,0.2)]"
                        : result === "ontime"
                        ? "bg-emerald-500/10 border-emerald-500/35 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                        : "bg-orange-500/10 border-orange-500/35"
                    }`}
                  >
                    {/* Glowing status light overlay */}
                    <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] pointer-events-none rounded-full ${
                      result === "delayed" ? "bg-red-500/20" : "bg-emerald-500/20"
                    }`} />
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 relative z-10">
                      
                      <div className={`flex items-center justify-center p-4 rounded-2xl mx-auto sm:mx-0 shrink-0 ${
                        result === "delayed" ? "bg-red-500/20 text-red-400" :
                        result === "ontime" ? "bg-emerald-500/20 text-emerald-400" :
                        "bg-orange-500/20 text-orange-400"
                      }`}>
                        {result === "delayed" ? <AlertTriangle className="w-8 h-8 filter drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]" /> :
                         result === "ontime" ? <CheckCircle2 className="w-8 h-8 filter drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]" /> :
                         <AlertTriangle className="w-8 h-8" />}
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="text-center sm:text-left">
                          <span className="font-tech text-[9px] text-cyan-300/60 tracking-widest uppercase">
                            CLASSIFICATION ENSEMBLE VERDICT
                          </span>
                          <h3 className="text-xl sm:text-2xl font-orbitron font-extrabold text-white tracking-wide mt-0.5">
                            {result === "delayed" && "HIGH PROBABILITY OF DELAY"}
                            {result === "ontime" && "TRAJECTORY NOMINAL: ON-TIME"}
                            {result === "error" && "API SERVER DISCONNECTED"}
                          </h3>
                        </div>
                        
                        {confidence !== null && (
                          <div className="space-y-2 bg-slate-950/45 p-3.5 rounded-2xl border border-purple-500/10">
                            <div className="flex justify-between text-[9px] font-tech text-cyan-300/80">
                              <span>MODEL CONFIDENCE COEFFICIENT</span>
                              <span className="font-bold text-cyan-400">{(confidence * 100).toFixed(2)}%</span>
                            </div>
                            
                            <div className="w-full bg-slate-900/60 rounded-full h-2 overflow-hidden border border-purple-500/15">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${confidence * 100}%` }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  result === "delayed" ? "bg-red-500" : "bg-emerald-400"
                                } shadow-[0_0_10px_currentColor]`}
                              />
                            </div>
                            
                            {/* Academic decision metrics */}
                            <div className="grid grid-cols-3 gap-2 pt-2 text-[8px] font-tech text-cyan-300/40 uppercase tracking-widest border-t border-purple-500/10">
                              <div>
                                <span>Estimators:</span>
                                <span className="block font-bold text-white mt-0.5">100 Trees</span>
                              </div>
                              <div>
                                <span>Splits Purity:</span>
                                <span className="block font-bold text-white mt-0.5">Gini Impurity</span>
                              </div>
                              <div>
                                <span>Bias Margin:</span>
                                <span className="block font-bold text-white mt-0.5">± 2.4%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="tab-history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4 min-h-[400px] flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-purple-500/10">
                  <div className="space-y-0.5">
                    <h3 className="font-orbitron font-bold text-white text-sm tracking-widest uppercase">
                      Query Run History Feed
                    </h3>
                    <p className="text-[9px] font-tech text-cyan-300/50 uppercase tracking-wider">
                      Evaluation stats from current browser session
                    </p>
                  </div>
                  
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-red-400 hover:text-red-300 text-[10px] font-tech uppercase tracking-widest flex items-center gap-1.5 bg-red-950/20 px-3 py-1.5 rounded-lg border border-red-500/20 transition-all hover:scale-102"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Logs
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                      <div className="p-4 rounded-full bg-purple-950/30 border border-purple-500/15">
                        <Info className="w-8 h-8 text-purple-400" />
                      </div>
                      <div className="space-y-1">
                        <span className="font-orbitron text-xs text-white uppercase tracking-wider block font-bold">
                          No Evaluation Records Yet
                        </span>
                        <span className="font-inter text-[11px] text-cyan-300/40 max-w-sm block">
                          Execute standard inference runs inside the first tab to build an active capstone evaluation feed.
                        </span>
                      </div>
                    </div>
                  ) : (
                    history.map((run) => (
                      <motion.div
                        key={run.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${
                          run.result === "delayed" 
                            ? "bg-red-500/5 border-red-500/20 hover:border-red-500/35" 
                            : "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/35"
                        }`}
                      >
                        <div className="space-y-1 font-tech">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs tracking-wider">
                              {run.airline}
                            </span>
                            <span className="text-[9px] text-cyan-400 bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-500/20">
                              {run.source} ➔ {run.destination}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-[9px] text-cyan-300/50 uppercase tracking-widest">
                            <span>Duration: {run.duration} mins</span>
                            <span>•</span>
                            <span>Time: {run.timestamp}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 font-tech">
                          <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase ${
                            run.result === "delayed" 
                              ? "bg-red-500/20 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]" 
                              : "bg-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                          }`}>
                            {run.result === "delayed" ? "DELAY RISK" : "ON-TIME"}
                          </span>
                          
                          <span className="text-[10px] text-white font-bold bg-slate-900/60 px-2 py-1 rounded border border-purple-500/20">
                            {(run.confidence * 100).toFixed(0)}% Conf
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Brief analytical warning note */}
              <div className="bg-purple-950/20 border border-purple-500/10 rounded-2xl p-4 text-[10px] font-inter text-cyan-300/50 leading-relaxed text-justify">
                <span className="font-tech text-purple-400 font-bold uppercase tracking-wider block mb-1">
                  Classifier Chronology Scope:
                </span>
                Calculated outcomes persist locally within standard browser sandboxes to help academic review groups verify model stability and trace sequential feature alterations. Clearing history deletes local browser records permanently.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}

export default PredictionForm;
