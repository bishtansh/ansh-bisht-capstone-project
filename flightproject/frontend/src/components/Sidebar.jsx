import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

const navItems = [
  { to: "/",              icon: "◈", label: "Predictive Inference", sub: "Feature Inference Core" },
  { to: "/dashboard",    icon: "◉", label: "Statistical Dashboard", sub: "Operational Analysis" },
  { to: "/airport-stats",icon: "◐", label: "Network Congestion Model", sub: "Cascading Congestion" },
  { to: "/model-info",   icon: "◫", label: "System Architecture & Report", sub: "UML Pipelines & Thesis" },
  { to: "/ml-playground",icon: "⧇", label: "Ensemble Hyper-Tuning", sub: "Hyperparameter tuning" },
  { to: "/radar",        icon: "◍", label: "Airspace Telemetry Simulator", sub: "Airspace Tracking" },
];

export default function Sidebar({ isDark, toggleTheme }) {
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
  const dateStr = time.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase();

  const localStyles = {
    aside: {
      ...styles.aside,
      background: isDark ? "linear-gradient(180deg, #080f1e 0%, #060d18 100%)" : "linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)",
      borderRight: isDark ? "1px solid rgba(0,195,255,0.12)" : "1px solid rgba(168,85,247,0.2)",
    },
    topLine: {
      ...styles.topLine,
      background: isDark ? "linear-gradient(90deg, transparent, #00c3ff, transparent)" : "linear-gradient(90deg, transparent, #7c3aed, transparent)",
    },
    logoTitle: {
      ...styles.logoTitle,
      color: isDark ? "#e8f4ff" : "#1e1b4b",
    },
    logoSub: {
      ...styles.logoSub,
      color: isDark ? "#00c3ff" : "#7c3aed",
    },
    clockBox: {
      ...styles.clockBox,
      background: isDark ? "rgba(0,195,255,0.04)" : "rgba(124,58,237,0.04)",
      border: isDark ? "1px solid rgba(0,195,255,0.1)" : "1px solid rgba(124,58,237,0.2)",
    },
    clockTime: {
      ...styles.clockTime,
      color: isDark ? "#00c3ff" : "#7c3aed",
    },
    clockDate: {
      ...styles.clockDate,
      color: isDark ? "#7aa3cc" : "#4f46e5",
    },
    statusBox: {
      ...styles.statusBox,
      background: isDark ? "rgba(0,195,255,0.03)" : "rgba(124,58,237,0.03)",
      border: isDark ? "1px solid rgba(0,195,255,0.08)" : "1px solid rgba(124,58,237,0.15)",
    },
    statusTitle: {
      ...styles.statusTitle,
      color: isDark ? "#3d6080" : "#4f46e5",
    },
    navLabel: {
      ...styles.navLabel,
      color: isDark ? "#3d6080" : "#4f46e5",
    },
    navLabel2: (active) => ({
      ...styles.navLabel2,
      color: active ? (isDark ? "#e8f4ff" : "#1e1b4b") : (isDark ? "#7aa3cc" : "#475569"),
    }),
    navSub: {
      ...styles.navSub,
      color: isDark ? "#3d6080" : "#64748b",
    },
    navIcon: (active) => ({
      ...styles.navIcon,
      color: active ? (isDark ? "#00c3ff" : "#7c3aed") : (isDark ? "#3d6080" : "#64748b"),
    }),
    navItem: (active) => ({
      ...styles.navItem,
      background: active ? (isDark ? "rgba(0,195,255,0.08)" : "rgba(124,58,237,0.08)") : "transparent",
      border: active ? (isDark ? "1px solid rgba(0,195,255,0.15)" : "1px solid rgba(124,58,237,0.2)") : "1px solid transparent",
    }),
    activeBar: {
      ...styles.activeBar,
      background: isDark ? "#00c3ff" : "#7c3aed",
      boxShadow: isDark ? "0 0 6px #00c3ff" : "0 0 6px #7c3aed",
    },
    activeDot: {
      ...styles.activeDot,
      background: isDark ? "#00c3ff" : "#7c3aed",
      boxShadow: isDark ? "0 0 6px #00c3ff" : "0 0 6px #7c3aed",
    }
  };

  return (
    <aside style={localStyles.aside}>
      {/* Top glow line */}
      <div style={localStyles.topLine} />

      {/* Logo */}
      <div style={styles.logoWrap}>
        <div style={styles.logoIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 5px #a855f7)' }}>
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
          </svg>
        </div>
        <div>
          <div style={localStyles.logoTitle}>ANSH BISHT</div>
          <div style={localStyles.logoSub}>B.TECH FINAL YEAR CAPSTONE PROJECT</div>
        </div>
      </div>

      {/* Clock */}
      <div style={localStyles.clockBox}>
        <div style={localStyles.clockTime}>{timeStr}</div>
        <div style={localStyles.clockDate}>{dateStr}</div>
        <div style={styles.clockLabel}>UTC LIVE CLOCK</div>
      </div>

      {/* Theme Toggle Button */}
      <div 
        onClick={toggleTheme}
        style={{
          margin: "0 1.25rem 1rem",
          padding: "0.6rem 1rem",
          background: isDark ? "rgba(168,85,247,0.06)" : "rgba(124,58,237,0.06)",
          border: isDark ? "1px solid rgba(168,85,247,0.2)" : "1px solid rgba(124,58,237,0.3)",
          borderRadius: 4,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "all 0.3s ease",
        }}
        className="hover:scale-102 hover:border-purple-500 transition-all duration-300"
      >
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.65rem", color: isDark ? "#c084fc" : "#7c3aed", fontWeight: "bold", letterSpacing: "0.1em" }}>
          THEME: {isDark ? "CYBERPUNK DARK" : "PREMIUM BRIGHT"}
        </span>
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400" style={{ filter: "drop-shadow(0 0 4px #fbbf24)" }} />
        ) : (
          <Moon className="w-4 h-4 text-purple-600" />
        )}
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={localStyles.navLabel}>NAVIGATION</div>
        {navItems.map(({ to, icon, label, sub }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              style={{ textDecoration: "none" }}
            >
              <div style={localStyles.navItem(active)}>
                {active && <div style={localStyles.activeBar} />}
                <span style={localStyles.navIcon(active)}>{icon}</span>
                <div>
                  <div style={localStyles.navLabel2(active)}>{label}</div>
                  <div style={localStyles.navSub}>{sub}</div>
                </div>
                {active && <div style={localStyles.activeDot} />}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Submission details block */}
      <div style={localStyles.statusBox}>
        <div style={localStyles.statusTitle}>CAPSTONE METADATA</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.62rem', fontFamily: "'Share Tech Mono', monospace", color: isDark ? '#7aa3cc' : '#475569' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>SUBMITTED BY:</span>
            <span style={{ color: isDark ? '#a855f7' : '#7c3aed', fontWeight: 'bold' }}>ANSH BISHT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>ROLL / REG NO:</span>
            <span style={{ color: isDark ? '#00c3ff' : '#4f46e5' }}>CSE-2022-ANSH</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>FACULTY GUIDE:</span>
            <span style={{ color: isDark ? '#00ff9d' : '#059669' }}>DR. R. SHARMA</span>
          </div>
        </div>
      </div>

      {/* Bottom decoration */}
      <div style={styles.bottomLine} />
    </aside>
  );
}

const styles = {
  aside: {
    width: 240,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: "0 0 1rem 0",
    position: "sticky",
    top: 0,
    height: "100vh",
    flexShrink: 0,
    overflow: "hidden",
  },
  topLine: {
    height: 2,
    marginBottom: "1.5rem",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0 1.25rem 1.5rem",
    borderBottom: "1px solid rgba(168,85,247,0.12)",
  },
  logoIcon: {
    width: 40, height: 40,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(168,85,247,0.06)",
    border: "1px solid rgba(168,85,247,0.2)",
    borderRadius: 4,
  },
  logoTitle: {
    fontFamily: "'Orbitron', monospace",
    fontSize: "0.9rem",
    fontWeight: 700,
    letterSpacing: "0.15em",
  },
  logoSub: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "0.52rem",
    letterSpacing: "0.15em",
    marginTop: 2,
  },
  clockBox: {
    margin: "1rem 1.25rem 0.5rem",
    padding: "0.75rem 1rem",
    borderRadius: 4,
    textAlign: "center",
  },
  clockTime: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "1.4rem",
    letterSpacing: "0.1em",
  },
  clockDate: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "0.6rem",
    letterSpacing: "0.12em",
    marginTop: 2,
  },
  clockLabel: {
    fontFamily: "'Orbitron', monospace",
    fontSize: "0.45rem",
    color: "#4f46e5",
    letterSpacing: "0.2em",
    marginTop: 4,
  },
  nav: { padding: "0.5rem 0.75rem", flex: 1 },
  navLabel: {
    fontFamily: "'Orbitron', monospace",
    fontSize: "0.5rem",
    letterSpacing: "0.25em",
    padding: "0 0.5rem 0.75rem",
    marginBottom: "0.25rem",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.7rem 0.75rem",
    borderRadius: 4,
    marginBottom: 2,
    position: "relative",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  activeBar: {
    position: "absolute",
    left: 0, top: "25%", bottom: "25%",
    width: 2,
    borderRadius: 2,
  },
  activeDot: {
    marginLeft: "auto",
    width: 4, height: 4,
    borderRadius: "50%",
  },
  navIcon: {
    fontSize: "1rem",
    width: 20, textAlign: "center",
    fontStyle: "normal",
  },
  navLabel2: {
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 600,
    fontSize: "0.9rem",
    letterSpacing: "0.05em",
  },
  navSub: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "0.55rem",
    letterSpacing: "0.1em",
  },
  statusBox: {
    margin: "0.5rem 1.25rem",
    padding: "0.75rem 1rem",
    borderRadius: 4,
  },
  statusTitle: {
    fontFamily: "'Orbitron', monospace",
    fontSize: "0.48rem",
    letterSpacing: "0.2em",
    marginBottom: "0.6rem",
  },
  bottomLine: {
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.2), transparent)",
    margin: "0.75rem 0 0",
  },
};
