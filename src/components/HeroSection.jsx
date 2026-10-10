import React from 'react';
import { 
  ArrowRight, 
  Gamepad2, 
  Compass, 
  Cpu, 
  Weight, 
  Maximize2,
  Sparkles,
  Activity,
  ChevronDown
} from 'lucide-react';
import Robo3DCanvas from './Robo3DCanvas';
import './HeroSection.css';

export default function HeroSection({ 
  onTelemetryUpdate, 
  currentTheme, 
  scrollProgress 
}) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section-root" id="cad">
      <div className="container hero-container">
        {/* Top Header Block */}
        <div className="hero-intro-block">
          <div className="hero-badge-row">
            <div className="hero-badge mono">
              <span className="dot"></span>
              <span>SRM ROBOCON // PROBLEM STATEMENT 8</span>
            </div>
            <div className="hero-status-tag mono">
              <span>HOLONOMIC PLATFORM v2.4</span>
            </div>
          </div>

          <h1 className="hero-headline">
            OMNI-CARRIER <span className="highlight">5K</span>
          </h1>

          <p className="hero-lead">
            High-payload warehouse mobile platform engineered for multi-directional translation 
            in restricted workspaces with continuous real-time <span className="mono text-cyan">(X, Y, θ)</span> dead-reckoning 
            position estimation and intuitive manual teleoperation.
          </p>

          {/* Quick Metrics Bar */}
          <div className="hero-metrics-strip">
            <div className="hero-metric-item">
              <span className="metric-icon"><Weight size={18} /></span>
              <div className="metric-info">
                <span className="metric-val mono">5.0 kg</span>
                <span className="metric-desc">Max Cargo Payload</span>
              </div>
            </div>

            <div className="hero-metric-divider"></div>

            <div className="hero-metric-item">
              <span className="metric-icon"><Compass size={18} /></span>
              <div className="metric-info">
                <span className="metric-val mono">4-Wheel 45°</span>
                <span className="metric-desc">Holonomic Omni-Drive</span>
              </div>
            </div>

            <div className="hero-metric-divider"></div>

            <div className="hero-metric-item">
              <span className="metric-icon"><Activity size={18} /></span>
              <div className="metric-info">
                <span className="metric-val mono">Real-Time</span>
                <span className="metric-desc">X, Y, θ Telemetry HUD</span>
              </div>
            </div>

            <div className="hero-metric-divider"></div>

            <div className="hero-metric-item">
              <span className="metric-icon"><Cpu size={18} /></span>
              <div className="metric-info">
                <span className="metric-val mono">&plusmn; 2.5 mm</span>
                <span className="metric-desc">Odometry Precision</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Canvas Visualizer */}
        <div className="hero-canvas-block">
          <Robo3DCanvas 
            onTelemetryUpdate={onTelemetryUpdate} 
            currentTheme={currentTheme}
            scrollProgress={scrollProgress}
          />
        </div>

        {/* Hero Actions Callout */}
        <div className="hero-actions-row">
          <button 
            onClick={() => scrollTo('simulator')} 
            className="btn-primary hero-btn-main"
            id="hero-launch-sim-btn"
          >
            <Gamepad2 size={18} />
            <span>Launch Warehouse Drive Sim</span>
            <ArrowRight size={16} />
          </button>

          <button 
            onClick={() => scrollTo('mandates')} 
            className="btn-secondary"
            id="hero-view-mandates-btn"
          >
            <span>Problem Mandates</span>
          </button>

          <button 
            onClick={() => scrollTo('kinematics')} 
            className="btn-secondary"
            id="hero-view-kinematics-btn"
          >
            <span>Omni Kinematics Math</span>
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="hero-scroll-indicator" onClick={() => scrollTo('mandates')}>
          <span className="mono">SCROLL TO INSPECT PLATFORM</span>
          <ChevronDown size={16} className="scroll-arrow" />
        </div>
      </div>
    </section>
  );
}
