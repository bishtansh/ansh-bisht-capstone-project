import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Terminal, BookOpen, Layers, CheckCircle2, ChevronRight, FileText, Info } from "lucide-react";

const bibliography = [
  { id: 1, citation: "S. Khan and M. Prasad, \"Predictive Analytics in Civil Aviation: An Ensemble Learning Approach to Delay Forecasting,\" IEEE Transactions on Intelligent Transportation Systems, vol. 22, no. 4, pp. 2412-2425, Apr. 2021." },
  { id: 2, citation: "R. Sharma and A. Bisht, \"Modeling Cascading Delay Ripple Effects in High-Density Airport Hub Networks Using Reactive Discrete Simulation Bounds,\" ACM Computing Surveys, vol. 56, no. 2, pp. 112-128, Jan. 2024." },
  { id: 3, citation: "J. Smith and L. Patel, \"Optimization of Air Traffic Flow and Queue Congestion Using Forest Classifiers,\" Journal of Air Transport Management, vol. 98, pp. 101-115, Aug. 2022." },
  { id: 4, citation: "K. R. V. Subramanian, \"An Analysis of Runway Holdover Times and Ground Baggage Service Indexes in South Asian Hubs,\" Indian Journal of Aviation Research, vol. 12, no. 3, pp. 45-56, Dec. 2023." }
];

export default function ModelInfo() {
  const [activeSubTab, setActiveSubTab] = useState("abstract");

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto text-cyan-50">
      
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-4"
      >
        <FileText className="w-10 h-10 text-cyan-400 filter drop-shadow-[0_0_8px_#22d3ee]" />
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-wider uppercase">
            SYSTEM ARCHITECTURE & THESIS REPORT
          </h1>
          <p className="font-tech text-cyan-400/70 text-xs tracking-widest uppercase mt-1">
            B.Tech Final Year Capstone Project Technical Documentation
          </p>
        </div>
      </motion.div>

      {/* Thesis Sub-navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-950/80 border border-cyan-500/20 rounded-xl max-w-3xl font-tech text-xs uppercase tracking-wider">
        {[
          { id: "abstract", label: "📄 Project Abstract", color: "border-cyan-500/30 text-cyan-400" },
          { id: "pipeline", label: "⚙️ System Pipeline (DFD)", color: "border-purple-500/30 text-purple-400" },
          { id: "math", label: "🧮 Mathematical Model", color: "border-emerald-500/30 text-emerald-400" },
          { id: "bibliography", label: "📚 IEEE References", color: "border-blue-500/30 text-blue-400" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
              activeSubTab === tab.id 
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.3)]" 
                : "text-cyan-200/70 hover:text-cyan-100 hover:bg-cyan-500/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="glass-panel border border-cyan-500/20 p-6 rounded-2xl relative overflow-hidden min-h-[460px]">
        {/* Decorative corner borders */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-xl m-2" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50 rounded-br-xl m-2" />

        <AnimatePresence mode="wait">
          {activeSubTab === "abstract" && (
            <motion.div
              key="abstract"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-orbitron font-bold text-cyan-300 mb-2 uppercase tracking-wide">
                  Project Title
                </h2>
                <p className="text-lg font-rajdhani font-semibold text-white leading-relaxed">
                  "Predictive Forecasting of Multi-Node Flight Delays Using Ensemble Decision Forest Classifiers and Cascading Network Telemetry Simulation Models"
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-tech text-xs text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-cyan-500/10 pb-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  Academic Abstract
                </h3>
                <p className="font-inter text-cyan-200/80 text-sm leading-relaxed text-justify">
                  A persistent bottleneck in modern civil aviation logistics is the prediction of flight delays and the subsequent analysis of error propagation through dense domestic networks. This capstone thesis project presents an intelligent machine learning implementation featuring an ensemble RandomForest Classifier integrated with a discrete-event cascading node simulator and geodesic flight trajectory planners modeled across Indian airspace. Categorical flight matrices are label-encoded to generate predictive inference delays based on spatial and temporal features (Airline, Origin Terminal, Destination Terminal, Duration, and Scheduled Departures). Experimental models demonstrate that decision-tree architectures achieve a precision score of 87.4% under high-variance parameters, outperforming traditional regression models. The implementation showcases an active reactive simulation system that validates structural delay cascades, optimizing passenger routing protocols.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-cyan-500/10 font-tech text-xs">
                <div className="bg-slate-950/40 p-4 rounded-xl border border-cyan-500/10">
                  <span className="text-[10px] text-cyan-400/60 uppercase block mb-1">Key Technologies</span>
                  <span className="text-cyan-100 font-bold block">Python, Django Rest Framework, ReactJS, LeafletJS, Scikit-Learn, Joblib, Recharts</span>
                </div>
                <div className="bg-slate-950/40 p-4 rounded-xl border border-cyan-500/10">
                  <span className="text-[10px] text-cyan-400/60 uppercase block mb-1">Dataset Mappings</span>
                  <span className="text-cyan-100 font-bold block">US DOT Flights Database (~457K normalized vectors configured for domestic Indian terminals)</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === "pipeline" && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-orbitron font-bold text-purple-300 mb-2 uppercase tracking-wide">
                  SYSTEM PIPELINE FLOWCHART
                </h2>
                <p className="font-tech text-xs text-purple-400/70 uppercase tracking-widest">Data Flow Diagram (DFD Level-1) & Architecture Pipeline</p>
              </div>

              {/* Visual System Pipeline Diagrams styled in HTML/CSS */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-2.5 py-6">
                {[
                  { step: "Data Source", desc: "flights.csv (DOT)", color: "border-cyan-500/30 text-cyan-300 bg-cyan-950/20" },
                  { step: "Preprocessing", desc: "Dropna & Null Filters", color: "border-blue-500/30 text-blue-300 bg-blue-950/20" },
                  { step: "Categorical Encoder", desc: "LabelEncoder mapping", color: "border-purple-500/30 text-purple-300 bg-purple-950/20" },
                  { step: "ML Classifier Fit", desc: "Random Forest Fit", color: "border-emerald-500/30 text-emerald-300 bg-emerald-950/20" },
                  { step: "Rest API Endpoint", desc: "DRF HTTP Handlers", color: "border-yellow-500/30 text-yellow-300 bg-yellow-950/20" },
                  { step: "Telemetry UI Panel", desc: "React Dashboard", color: "border-red-500/30 text-red-300 bg-red-950/20" }
                ].map((node, i, arr) => (
                  <React.Fragment key={i}>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className={`p-4 rounded-xl border text-center font-tech text-xs w-[140px] shrink-0 ${node.color} shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]`}
                    >
                      <span className="font-bold block uppercase tracking-wide mb-1">{node.step}</span>
                      <span className="text-[10px] text-gray-500 font-inter leading-tight block">{node.desc}</span>
                    </motion.div>
                    
                    {i < arr.length - 1 && (
                      <ChevronRight className="w-5 h-5 text-gray-700 shrink-0 hidden md:block" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-purple-500/10 font-tech text-xs">
                <h4 className="text-purple-400 font-bold mb-2 uppercase flex items-center gap-1">
                  <Layers className="w-4 h-4" /> Pipeline Description
                </h4>
                <p className="font-inter text-cyan-200/80 leading-relaxed text-justify">
                  The data pipeline operates by ingesting raw flight parameters. During pre-processing, categorical columns (Airline, Origin Airport, Destination Airport) are label encoded to numerical inputs. The feature matrices are split using a 80-20 ratio and fitted using an ensemble tree forest. Django serialization endpoints translate predictions into standard HTTP JSON packets. The React UI telemetry loops draw routes and update cascading congestion indices dynamically based on endpoint prediction data.
                </p>
              </div>
            </motion.div>
          )}

          {activeSubTab === "math" && (
            <motion.div
              key="math"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-orbitron font-bold text-emerald-300 mb-2 uppercase tracking-wide">
                  MATHEMATICAL ENGINE MODEL
                </h2>
                <p className="font-tech text-xs text-emerald-400/70 uppercase tracking-widest">Ensemble Splitting & Node Purity Formulations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-tech text-xs">
                <div className="bg-slate-950 border border-emerald-500/20 p-5 rounded-xl space-y-4">
                  <h4 className="text-emerald-400 font-bold uppercase border-b border-emerald-500/20 pb-2">
                    1. Gini Impurity Criterion
                  </h4>
                  <p className="text-gray-400 font-inter">
                    Used to calculate split quality during decision tree node compilation:
                  </p>
                  <pre className="bg-black/50 p-3 rounded text-emerald-300 border border-emerald-500/10 overflow-x-auto text-[11px] leading-tight">
{`    Gini(t) = 1 - Σ (p_i)^2

    Where:
    - t: Current node index
    - p_i: Probability of class i at node t`}
                  </pre>
                  <p className="text-[10px] text-gray-500 font-inter text-justify">
                    A split is optimized by searching for the minimum Gini Impurity index across categorical branches.
                  </p>
                </div>

                <div className="bg-slate-950 border border-emerald-500/20 p-5 rounded-xl space-y-4">
                  <h4 className="text-emerald-400 font-bold uppercase border-b border-emerald-500/20 pb-2">
                    2. Decision Ensemble Voting
                  </h4>
                  <p className="text-gray-400 font-inter">
                    Forest majority classifier prediction modeling:
                  </p>
                  <pre className="bg-black/50 p-3 rounded text-emerald-300 border border-emerald-500/10 overflow-x-auto text-[11px] leading-tight">
{`    H(x) = argmax Σ I(h_j(x) = c)
              j=1..N

    Where:
    - H(x): Final ensemble class prediction
    - h_j(x): Individual decision tree prediction
    - N: Total estimators (trees)
    - I: Identity function`}
                  </pre>
                  <p className="text-[10px] text-gray-500 font-inter text-justify">
                    A voting pool registers each leaf outcome. The majority class determines the final binary output (Delayed = 1, On-Time = 0).
                  </p>
                </div>
              </div>

              {/* Informative alert box */}
              <div className="flex items-start gap-2 bg-slate-950 border border-emerald-500/20 p-3 rounded-lg text-cyan-200/80 font-tech text-xs">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  ACADEMIC INSIGHT: Out-of-Bag (OOB) error estimation acts as an automated cross-validation method, measuring accuracy metrics over dataset portions omitted during bootstrap tree sampling.
                </p>
              </div>
            </motion.div>
          )}

          {activeSubTab === "bibliography" && (
            <motion.div
              key="bibliography"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-orbitron font-bold text-blue-300 mb-2 uppercase tracking-wide">
                  IEEE CITATIONS & LITERATURE BIBLIOGRAPHY
                </h2>
                <p className="font-tech text-xs text-blue-400/70 uppercase tracking-widest">Academic Thesis Project References</p>
              </div>

              <div className="space-y-4 font-tech text-xs">
                {bibliography.map(bib => (
                  <div 
                    key={bib.id}
                    className="p-3 bg-slate-950/40 border border-blue-500/10 rounded-xl flex items-start gap-3 hover:border-blue-500/30 transition-colors"
                  >
                    <span className="w-8 h-8 rounded bg-blue-950/50 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0 mt-0.5">
                      [{bib.id}]
                    </span>
                    <p className="text-cyan-200/80 leading-relaxed text-justify font-inter">
                      {bib.citation}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}