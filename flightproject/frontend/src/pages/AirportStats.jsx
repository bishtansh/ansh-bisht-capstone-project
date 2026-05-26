import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Plane, MapPin, Zap, Info, Radio, RefreshCw, Layers, ShieldAlert, ArrowRight, ShieldCheck, Activity } from "lucide-react";

// Mock Airport Traffic & Delay Data
const trafficData = [
  { subject: 'DEL', A: 110, fullMark: 120 },
  { subject: 'BOM', A: 98, fullMark: 120 },
  { subject: 'BLR', A: 84, fullMark: 120 },
  { subject: 'HYD', A: 75, fullMark: 120 },
  { subject: 'CCU', A: 65, fullMark: 120 },
];

const delayData = [
  { name: 'DEL', delay: 18 },
  { name: 'BOM', delay: 24 },
  { name: 'BLR', delay: 15 },
  { name: 'HYD', delay: 12 },
  { name: 'CCU', delay: 19 },
];

const initialHubs = [
  { id: "DEL", name: "Indira Gandhi Int", status: "Nominal", delayMin: 0, waitTime: 15, baggageIndex: "97%", runwayLoad: 45, routes: ["BOM", "BLR", "CCU"] },
  { id: "BOM", name: "Chhatrapati Shivaji Maharaj", status: "Nominal", delayMin: 0, waitTime: 22, baggageIndex: "94%", runwayLoad: 75, routes: ["DEL", "BLR", "MAA"] },
  { id: "BLR", name: "Kempegowda Int", status: "Nominal", delayMin: 0, waitTime: 12, baggageIndex: "98%", runwayLoad: 40, routes: ["BOM", "DEL", "HYD"] },
  { id: "HYD", name: "Rajiv Gandhi Int", status: "Nominal", delayMin: 0, waitTime: 10, baggageIndex: "96%", runwayLoad: 35, routes: ["BLR", "DEL", "MAA"] },
  { id: "CCU", name: "Netaji Subhash", status: "Nominal", delayMin: 0, waitTime: 14, baggageIndex: "93%", runwayLoad: 50, routes: ["DEL", "BOM", "COK"] },
  { id: "MAA", name: "Chennai Int", status: "Nominal", delayMin: 0, waitTime: 16, baggageIndex: "95%", runwayLoad: 52, routes: ["BOM", "HYD", "COK"] },
  { id: "COK", name: "Cochin Int", status: "Nominal", delayMin: 0, waitTime: 11, baggageIndex: "98%", runwayLoad: 30, routes: ["CCU", "MAA", "BLR"] }
];

export default function AirportStats() {
  const [hubs, setHubs] = useState(initialHubs);
  const [selectedHubId, setSelectedHubId] = useState("DEL");
  const [cascadeLogs, setCascadeLogs] = useState([
    "[SYS] Hub Cascade System Online. Select Node to trigger delay simulation."
  ]);
  const [isSimulating, setIsSimulating] = useState(false);

  const selectedHub = hubs.find(h => h.id === selectedHubId) || hubs[0];

  const triggerCascade = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setCascadeLogs([]);

    // 1. Reset all delays
    setHubs(prev => prev.map(h => ({ ...h, status: "Nominal", delayMin: 0 })));

    // 2. Step by step cascading timeline
    const steps = [
      {
        log: `[CASCADE] Initializing Severe Blizzard Event at ${selectedHub.name} (${selectedHub.id})...`,
        update: (prev) => prev.map(h => h.id === selectedHubId ? { ...h, status: "Critical", delayMin: 75, runwayLoad: 95 } : h)
      },
      {
        log: `[GRID] ${selectedHub.id} Runway Lock in progress. Wait times spiking by +35 mins.`,
        update: (prev) => prev.map(h => h.id === selectedHubId ? { ...h, waitTime: h.waitTime + 35 } : h)
      },
      {
        log: `[ALERT] Propagating delays to outbound connected corridors: [${selectedHub.routes.join(", ")}]...`,
        update: (prev) => prev
      },
      ...selectedHub.routes.map(rId => ({
        log: `[RIPPLE] Delay wavefront reaches ${rId}. Outbound traffic throttled. Status: Congested (+25m)`,
        update: (prev) => prev.map(h => h.id === rId ? { ...h, status: "Congested", delayMin: 25, runwayLoad: h.runwayLoad + 20 } : h)
      })),
      {
        log: `[OK] Network ripple stabilized. Total simulated impact: +${75 + (selectedHub.routes.length * 25)} mins.`,
        update: (prev) => prev
      }
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        const step = steps[stepIdx];
        setCascadeLogs(prev => [...prev, step.log]);
        setHubs(prev => step.update(prev));
        stepIdx++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 900);
  };

  const resetCascade = () => {
    setHubs(initialHubs);
    setCascadeLogs([
      "[SYS] Hub Cascade System Reset. Ready for execution."
    ]);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-cyan-50">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-4"
      >
        <Plane className="w-10 h-10 text-cyan-400 filter drop-shadow-[0_0_8px_#22d3ee]" />
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-wider">
            GLOBAL NETWORK HUB ANALYTICS
          </h1>
          <p className="font-tech text-cyan-400/70 text-xs tracking-widest uppercase mt-1">
            Airport Congestion and Delay Ripple Propagation Models
          </p>
        </div>
      </motion.div>

      {/* Main Grid: Hub Cascade Simulator (Vast & premium feature) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Airport Hub Select & Simulation Controls */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-panel border border-cyan-500/30 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-xl m-2" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50 rounded-br-xl m-2" />

            <h2 className="font-orbitron font-bold text-sm text-cyan-300 tracking-widest uppercase mb-4 flex items-center gap-1.5 border-b border-cyan-500/20 pb-3">
              <Layers className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
              DYNAMIC HUB SELECTOR
            </h2>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
              {hubs.map(hub => {
                const statusColor = 
                  hub.status === "Critical" ? "border-red-500/40 bg-red-500/5 text-red-400" :
                  hub.status === "Congested" ? "border-yellow-500/40 bg-yellow-500/5 text-yellow-400" :
                  "border-cyan-500/10 bg-slate-950/40 text-cyan-200";

                return (
                  <div
                    key={hub.id}
                    onClick={() => !isSimulating && setSelectedHubId(hub.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-between font-tech text-xs ${
                      selectedHubId === hub.id 
                        ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_10px_rgba(0,195,255,0.15)] text-white' 
                        : statusColor
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{hub.id}</span>
                      <span>{hub.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        hub.status === "Critical" ? "bg-red-500" :
                        hub.status === "Congested" ? "bg-yellow-500" : "bg-emerald-400"
                      }`} />
                      <span className="font-bold text-[10px]">
                        {hub.delayMin > 0 ? `+${hub.delayMin}m` : 'Nominal'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sim actions */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={triggerCascade}
                disabled={isSimulating}
                className={`py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                  isSimulating 
                    ? "bg-red-950/40 border border-red-900/40 text-red-500 cursor-not-allowed" 
                    : "bg-red-500 hover:bg-red-400 text-slate-950 font-extrabold shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                SIM CASCADE
              </button>

              <button
                onClick={resetCascade}
                disabled={isSimulating}
                className="py-3 bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                RESET GRID
              </button>
            </div>

          </div>
        </div>

        {/* Center/Right: Hub Details and Simulated Ripple Logs (takes 2 xl-cols) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Specific Hub Micro metrics dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Runway Load Factor", val: `${selectedHub.runwayLoad}%`, desc: "Congestion capacity ratio", color: selectedHub.runwayLoad > 80 ? "text-red-400" : selectedHub.runwayLoad > 60 ? "text-yellow-400" : "text-cyan-400" },
              { label: "Transit Wait Time", val: `${selectedHub.waitTime} min`, desc: "Average taxi & holding delay", color: "text-blue-400" },
              { label: "Baggage Service Index", val: selectedHub.baggageIndex, desc: "On-time luggage delivery rate", color: "text-purple-400" },
              { label: "Active Connected Corridors", val: `${selectedHub.routes.length} lanes`, desc: "Outbound destinations mapped", color: "text-emerald-400" }
            ].map((metric, i) => (
              <div key={i} className="glass-panel border border-cyan-500/20 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="font-tech text-[9px] text-cyan-400/60 uppercase tracking-widest block mb-1">
                    {metric.label}
                  </span>
                  <span className={`text-xl md:text-2xl font-orbitron font-bold ${metric.color}`}>
                    {metric.val}
                  </span>
                </div>
                <span className="text-[9px] text-gray-500 font-inter leading-tight mt-2">{metric.desc}</span>
              </div>
            ))}
          </div>

          {/* Interactive Route Ripple Display & Console Log */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Visual Outbound Map connections */}
            <div className="glass-panel border border-cyan-500/20 p-5 rounded-2xl flex flex-col justify-between min-h-[250px]">
              <div>
                <h3 className="font-orbitron font-bold text-xs text-cyan-300 tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  CORRIDOR ROUTE IMPACTS
                </h3>
                <p className="font-tech text-[9px] text-cyan-500/60 uppercase tracking-widest mb-4">Direct Ripple connections from {selectedHub.id}</p>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-3 font-tech text-xs">
                {selectedHub.routes.map(rId => {
                  const targetHub = hubs.find(h => h.id === rId);
                  const isCongested = targetHub?.status === "Congested" || targetHub?.status === "Critical";
                  
                  return (
                    <div key={rId} className={`p-3 rounded-lg border flex items-center justify-between ${isCongested ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400 animate-pulse' : 'border-cyan-500/10 bg-slate-950/40 text-cyan-200'}`}>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-orbitron">{selectedHub.id}</strong>
                        <ArrowRight className="w-3.5 h-3.5" />
                        <strong className="text-sm font-orbitron">{rId}</strong>
                      </div>
                      
                      <span className="font-bold text-[10px] uppercase">
                        {isCongested ? `DELAY RIPPLED (+${targetHub.delayMin}m)` : 'NOMINAL FLOW'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cascade Terminal Console */}
            <div className="glass-panel border border-cyan-500/20 p-0 rounded-2xl flex flex-col min-h-[250px] overflow-hidden">
              <div className="bg-slate-950/80 border-b border-cyan-500/20 px-4 py-2 flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="font-tech text-xs text-red-400 tracking-widest uppercase">Grid Propagation Console</span>
              </div>

              <div className="p-4 flex-1 bg-slate-950/40 font-tech text-xs text-cyan-300 space-y-2 overflow-y-auto max-h-[190px] custom-scrollbar">
                {cascadeLogs.map((log, i) => (
                  <div 
                    key={i} 
                    className={
                      log.includes('[CASCADE]') ? 'text-red-400' :
                      log.includes('[RIPPLE]') ? 'text-yellow-400' :
                      log.includes('[OK]') ? 'text-emerald-400' : 'text-cyan-400/80'
                    }
                  >
                    {log}
                  </div>
                ))}
                {isSimulating && (
                  <div className="inline-block w-2.5 h-3.5 bg-red-500 animate-pulse" />
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Classic Charts Section below (maintained value) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Radar Chart: Traffic */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel border border-cyan-500/20 p-6 rounded-2xl">
          <h2 className="font-orbitron font-bold text-sm text-cyan-50 tracking-widest uppercase mb-2">PASSENGER VOLUME</h2>
          <p className="font-tech text-cyan-400/50 text-[9px] mb-6 uppercase tracking-widest">Top US Nodes (Millions)</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={trafficData}>
                <PolarGrid stroke="rgba(0, 195, 255, 0.15)" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#00c3ff', fontFamily: 'Share Tech Mono', fontSize: 11}} />
                <PolarRadiusAxis angle={30} domain={[0, 120]} tick={{fill: '#7aa3cc', fontSize: 9}} />
                <Radar name="Passengers" dataKey="A" stroke="#00c3ff" fill="#00c3ff" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Area Chart: Delays */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel border border-cyan-500/20 p-6 rounded-2xl">
          <h2 className="font-orbitron font-bold text-sm text-cyan-50 tracking-widest uppercase mb-2">AVG DELAY METRICS</h2>
          <p className="font-tech text-cyan-400/50 text-[9px] mb-6 uppercase tracking-widest">Time in Minutes</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={delayData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#00c3ff" opacity={0.3} tick={{fill: '#7aa3cc', fontFamily: 'Share Tech Mono', fontSize: 10}} />
                <YAxis stroke="#00c3ff" opacity={0.3} tick={{fill: '#7aa3cc', fontFamily: 'Share Tech Mono', fontSize: 10}} />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,195,255,0.08)" />
                <Tooltip contentStyle={{ backgroundColor: '#060d18', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', fontFamily: 'Share Tech Mono', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="delay" stroke="#ef4444" fillOpacity={1} fill="url(#colorDelay)" strokeWidth={2} name="Avg Delay (Mins)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

    </div>
  );
}