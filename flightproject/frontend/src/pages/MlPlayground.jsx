import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Cpu, Play, RefreshCw, Terminal, CheckCircle2, AlertTriangle, ShieldCheck, Info } from "lucide-react";

// Curated Mock Data for curves
const baseRocData = [
  { fpr: 0.0, tpr: 0.0 },
  { fpr: 0.1, tpr: 0.45 },
  { fpr: 0.2, tpr: 0.72 },
  { fpr: 0.3, tpr: 0.83 },
  { fpr: 0.4, tpr: 0.89 },
  { fpr: 0.5, tpr: 0.92 },
  { fpr: 0.6, tpr: 0.95 },
  { fpr: 0.7, tpr: 0.97 },
  { fpr: 0.8, tpr: 0.98 },
  { fpr: 0.9, tpr: 0.99 },
  { fpr: 1.0, tpr: 1.0 },
];

export default function MlPlayground() {
  const [estimators, setEstimators] = useState(100);
  const [maxDepth, setMaxDepth] = useState(12);
  const [threshold, setThreshold] = useState(0.5);
  const [training, setTraining] = useState(false);
  const [trained, setTrained] = useState(true);
  const [logs, setLogs] = useState([
    "[SYS] Machine Learning Engine Initialized.",
    "[SYS] Model status: Idle.",
  ]);
  
  const consoleEndRef = useRef(null);

  // Auto-scroll terminal logs
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const runMockTraining = () => {
    setTraining(true);
    setTrained(false);
    setLogs([]);

    const trainingSteps = [
      `[SYS] Ingesting flight database from ml_model/flights.csv...`,
      `[SYS] Dataset size: 457,832 records mapped.`,
      `[SYS] Initializing RandomForest Classifier with ${estimators} Estimators...`,
      `[SYS] Constraint assigned: Max Depth = ${maxDepth}.`,
      `[TRAIN] Building decision tree sequence (0%...)`,
      `[TRAIN] Forest expansion in progress (34%...)`,
      `[TRAIN] Splitting criteria optimized using Gini Impurity (68%...)`,
      `[TRAIN] Tree assembly completed successfully (100%)`,
      `[SYS] Feature vectors processed. Mapping feature importance...`,
      `[OK] RandomForest model fit complete. Saving to model.pkl.`,
      `[OK] Model successfully synchronized. ready for evaluations.`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < trainingSteps.length) {
        setLogs(prev => [...prev, trainingSteps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setTraining(false);
        setTrained(true);
      }
    }, 450);
  };

  // Dynamically calculate accuracy, precision, recall, and confusion matrix based on hyperparameters
  const calcMetrics = () => {
    // Estimators and maxDepth affect accuracy slightly
    const randomFactor = (estimators * 0.0001) + (maxDepth * 0.001);
    const baseAccuracy = 0.81 + randomFactor - Math.abs(threshold - 0.5) * 0.12;
    const accuracy = Math.min(Math.max(baseAccuracy, 0.65), 0.94);
    
    const basePrecision = 0.79 + randomFactor + (threshold - 0.5) * 0.18;
    const precision = Math.min(Math.max(basePrecision, 0.58), 0.96);

    const baseRecall = 0.84 + randomFactor - (threshold - 0.5) * 0.22;
    const recall = Math.min(Math.max(baseRecall, 0.50), 0.97);

    const f1 = (2 * precision * recall) / (precision + recall);

    // Calculate Confusion Matrix for a sample size of 1000 flights
    const actualDelayed = 350;
    const actualOnTime = 650;
    const tp = Math.round(actualDelayed * recall);
    const fn = actualDelayed - tp;
    const fp = Math.round(actualOnTime * (1 - precision));
    const tn = actualOnTime - fp;

    // Feature Importances
    const featureImportance = [
      { name: "Scheduled Duration", value: Math.round(28 + maxDepth * 0.5) },
      { name: "Carrier Risk Coeff", value: Math.round(22 + estimators * 0.04) },
      { name: "Departure Hour", value: 20 },
      { name: "Origin Congestion", value: Math.round(18 + maxDepth * 0.3) },
      { name: "Arrival Window", value: 12 },
    ].sort((a, b) => b.value - a.value);

    // ROC curve shift based on estimators and depth
    const rocData = baseRocData.map(d => {
      const shift = (estimators * 0.0002) + (maxDepth * 0.0015);
      const newTpr = Math.min(1.0, d.tpr + (d.fpr > 0 && d.fpr < 1 ? shift : 0));
      return { ...d, tpr: parseFloat(newTpr.toFixed(2)) };
    });

    return { accuracy, precision, recall, f1, tp, fn, fp, tn, featureImportance, rocData };
  };

  const { accuracy, precision, recall, f1, tp, fn, fp, tn, featureImportance, rocData } = calcMetrics();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-cyan-50">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-4"
      >
        <Cpu className="w-10 h-10 text-cyan-400 filter drop-shadow-[0_0_8px_#22d3ee]" />
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-wider">
            AI CORE & ML PLAYGROUND
          </h1>
          <p className="font-tech text-cyan-400/70 text-xs tracking-widest uppercase mt-1">
            Interactive Hyperparameter Customization & Diagnostics
          </p>
        </div>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Hyperparameter Controls */}
        <div className="xl:col-span-1 space-y-6">
          
          <div className="glass-panel border border-cyan-500/30 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-xl m-2" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50 rounded-br-xl m-2" />
            
            <h2 className="font-orbitron font-bold text-base text-cyan-300 tracking-wider mb-6 flex items-center gap-2 border-b border-cyan-500/20 pb-3">
              HYPERPARAMETER CONTROLS
            </h2>

            <div className="space-y-6">
              {/* Sliders */}
              <div className="space-y-2">
                <div className="flex justify-between font-tech text-xs text-cyan-400 tracking-widest uppercase">
                  <span>Number of Estimators</span>
                  <span className="text-cyan-50 font-bold">{estimators} trees</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={estimators}
                  onChange={(e) => setEstimators(Number(e.target.value))}
                  disabled={training}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <p className="text-[10px] text-gray-500 font-inter">Determines the number of decision trees in the forest ensemble.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-tech text-xs text-cyan-400 tracking-widest uppercase">
                  <span>Maximum Tree Depth</span>
                  <span className="text-cyan-50 font-bold">{maxDepth} levels</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="20"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  disabled={training}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <p className="text-[10px] text-gray-500 font-inter">Controls tree growth, limiting depth to minimize overfitting.</p>
              </div>

              <div className="space-y-2 font-tech">
                <div className="flex justify-between text-xs text-cyan-400 tracking-widest uppercase">
                  <span>Decision Threshold</span>
                  <span className="text-cyan-50 font-bold">p &gt; {threshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.90"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  disabled={training}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <p className="text-[10px] text-gray-500 font-inter">Probability cutoff. Lower thresholds increase delay flags (Higher Recall).</p>
              </div>
            </div>

            <button
              onClick={runMockTraining}
              disabled={training}
              className={`w-full py-4 rounded-xl font-orbitron font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 mt-8 ${
                training
                  ? "bg-cyan-950/40 text-cyan-700 cursor-not-allowed border border-cyan-900/50"
                  : "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-955 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              }`}
            >
              {training ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  TRAINING AI MODELS...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-slate-950" />
                  FIT & OPTIMIZE CORE
                </>
              )}
            </button>
          </div>

          {/* Terminal Console View */}
          <div className="glass-panel border border-cyan-500/30 p-0 rounded-2xl overflow-hidden flex flex-col h-[280px]">
            <div className="bg-slate-950/80 border-b border-cyan-500/20 px-4 py-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="font-tech text-xs text-cyan-400 tracking-widest">ai_core_compilation_logs</span>
            </div>
            <div className="p-4 flex-1 bg-slate-950/50 overflow-y-auto font-tech text-xs text-cyan-300 space-y-2 custom-scrollbar">
              {logs.map((log, i) => (
                <div 
                  key={i} 
                  className={
                    log.includes('[OK]') 
                      ? 'text-emerald-400' 
                      : log.includes('[TRAIN]') 
                      ? 'text-purple-400' 
                      : 'text-cyan-400/80'
                  }
                >
                  {log}
                </div>
              ))}
              {training && (
                <div className="inline-block w-2.5 h-3.5 bg-cyan-400 animate-pulse" />
              )}
              <div ref={consoleEndRef} />
            </div>
          </div>
        </div>

        {/* Right Column: Analytics Visualizers (takes 2 xl-cols) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Dynamic Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Accuracy Score", val: `${(accuracy * 100).toFixed(1)}%`, color: "text-cyan-400", desc: "Overall model predictions correctness" },
              { label: "Precision Rate", val: `${(precision * 100).toFixed(1)}%`, color: "text-blue-400", desc: "True delays vs total flags predicted" },
              { label: "Recall Rate", val: `${(recall * 100).toFixed(1)}%`, color: "text-purple-400", desc: "True delays captured from actuals" },
              { label: "F1 Matrix Index", val: f1.toFixed(2), color: "text-emerald-400", desc: "Harmonic balance of precision & recall" }
            ].map((card, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel border border-cyan-500/20 p-4 rounded-xl flex flex-col justify-between"
              >
                <div>
                  <span className="font-tech text-[10px] text-cyan-400/60 uppercase tracking-widest block mb-1">
                    {card.label}
                  </span>
                  <span className={`text-2xl md:text-3xl font-orbitron font-bold ${card.color}`}>
                    {card.val}
                  </span>
                </div>
                <p className="text-[9px] text-gray-500 font-inter leading-tight mt-2">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Recharts Grid (ROC & Feature Importance) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ROC Curve Chart */}
            <div className="glass-panel border border-cyan-500/20 p-5 rounded-2xl flex flex-col h-[280px]">
              <h3 className="font-orbitron font-bold text-xs text-cyan-300 tracking-wider mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                ROC EVALUATION VECTOR
              </h3>
              <p className="font-tech text-[9px] text-cyan-500/60 uppercase tracking-widest mb-4">True Positive vs False Positive Trade-off</p>
              <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rocData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rocGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00c3ff" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#00c3ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,195,255,0.08)" />
                    <XAxis dataKey="fpr" stroke="#00c3ff" opacity={0.3} tick={{ fill: '#7aa3cc', fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis stroke="#00c3ff" opacity={0.3} tick={{ fill: '#7aa3cc', fontSize: 10, fontFamily: 'monospace' }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(5,15,30,0.95)', border: '1px solid rgba(0,195,255,0.3)', borderRadius: '4px', fontFamily: 'monospace', color: '#fff', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="tpr" stroke="#00c3ff" fillOpacity={1} fill="url(#rocGradient)" strokeWidth={2} name="True Positive Rate" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature Importance BarChart */}
            <div className="glass-panel border border-cyan-500/20 p-5 rounded-2xl flex flex-col h-[280px]">
              <h3 className="font-orbitron font-bold text-xs text-purple-300 tracking-wider mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                FEATURE IMPORTANCE COEFFICIENTS
              </h3>
              <p className="font-tech text-[9px] text-purple-500/60 uppercase tracking-widest mb-4">ML Weight Distributions (%)</p>
              <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureImportance} layout="vertical" margin={{ top: 0, right: 10, left: 15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.08)" horizontal={false} />
                    <XAxis type="number" stroke="#a855f7" opacity={0.3} tick={{ fill: '#7aa3cc', fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis type="category" dataKey="name" stroke="#a855f7" opacity={0.3} tick={{ fill: '#7aa3cc', fontSize: 9, fontFamily: 'Rajdhani', fontWeight: 'semibold' }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(5,15,30,0.95)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '4px', fontFamily: 'monospace', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="value" fill="url(#purpleGrad)" radius={[0, 4, 4, 0]} name="Importance Weight" />
                    <defs>
                      <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgba(168,85,247,0.3)" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Interactive Confusion Matrix Grid */}
          <div className="glass-panel border border-cyan-500/20 p-6 rounded-2xl relative">
            <h3 className="font-orbitron font-bold text-xs text-emerald-300 tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              CONFUSION MATRIX (N=1000 TESTS)
            </h3>
            <p className="font-tech text-[9px] text-emerald-500/60 uppercase tracking-widest mb-6">Cross-Evaluation of Real vs Predicted Nodes</p>

            <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto font-tech">
              {/* True Positive */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-xl text-center relative group hover:border-emerald-500/40 transition-colors">
                <span className="text-[10px] text-emerald-400/70 block uppercase tracking-widest mb-1">True Positive (TP)</span>
                <span className="text-4xl font-orbitron font-bold text-emerald-400 block filter drop-shadow-[0_0_6px_rgba(16,185,129,0.2)]">
                  {tp}
                </span>
                <span className="text-[9px] text-gray-500 block mt-2">Correctly predicted delay</span>
              </div>

              {/* False Positive */}
              <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-xl text-center relative hover:border-red-500/40 transition-colors">
                <span className="text-[10px] text-red-400/70 block uppercase tracking-widest mb-1">False Positive (FP)</span>
                <span className="text-4xl font-orbitron font-bold text-red-400 block">
                  {fp}
                </span>
                <span className="text-[9px] text-gray-500 block mt-2">False delay alarm (On-time flight)</span>
              </div>

              {/* False Negative */}
              <div className="bg-orange-500/5 border border-orange-500/20 p-5 rounded-xl text-center relative hover:border-orange-500/40 transition-colors">
                <span className="text-[10px] text-orange-400/70 block uppercase tracking-widest mb-1">False Negative (FN)</span>
                <span className="text-4xl font-orbitron font-bold text-orange-400 block">
                  {fn}
                </span>
                <span className="text-[9px] text-gray-500 block mt-2">Missed delay (Expected on-time)</span>
              </div>

              {/* True Negative */}
              <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-xl text-center relative hover:border-blue-500/40 transition-colors">
                <span className="text-[10px] text-blue-400/70 block uppercase tracking-widest mb-1">True Negative (TN)</span>
                <span className="text-4xl font-orbitron font-bold text-blue-400 block filter drop-shadow-[0_0_6px_rgba(59,130,246,0.2)]">
                  {tn}
                </span>
                <span className="text-[9px] text-gray-500 block mt-2">Correctly predicted on-time</span>
              </div>
            </div>

            {/* Micro-insight */}
            <div className="flex items-start gap-2.5 bg-cyan-950/20 border border-cyan-500/10 p-3 rounded-lg mt-6 text-cyan-200/80 font-tech text-xs">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                ANALYSIS METRIC INSIGHT: Decision threshold at <strong className="text-cyan-300">p &gt; {threshold.toFixed(2)}</strong> generates <strong className="text-cyan-300">{tp + fp}</strong> positive warnings and <strong className="text-cyan-300">{tn + fn}</strong> negative signals. Lower thresholds prompt high defensive routing warnings, while higher thresholds prioritize schedule adherence at the cost of unforeseen weather impacts.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
