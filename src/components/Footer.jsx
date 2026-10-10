import React from 'react';
import { 
  ArrowUp, 
  Radio, 
  Cpu, 
  Layers, 
  ShieldCheck,
  Compass
} from 'lucide-react';
import './Footer.css';

export default function Footer({ onScrollTop }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'instant' });
    }
  };

  return (
    <footer className="footer-root">
      <div className="container footer-container">
        {/* Top Grid */}
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <div className="footer-brand-badge" onClick={onScrollTop}>
              <span className="brand-code">MK-8</span>
              <div className="brand-pulse"></div>
            </div>
            <h4 className="footer-brand-title">STARK INDUSTRIES // SRM ROBOCON</h4>
            <p className="footer-brand-desc">
              Mark-VIII Holonomic 4-Wheel 45° Mobile Platform for collegiate robotics intra-logistics.
            </p>
            <div className="footer-status-pill mono">
              <span className="dot pulse"></span>
              <span>100Hz EKF TELEMETRY ACTIVE</span>
            </div>
          </div>

          {/* Quick Nav Col */}
          <div className="footer-nav-col">
            <h5 className="footer-col-title mono">// NAVIGATION INDEX</h5>
            <ul className="footer-links-list">
              <li><button onClick={() => scrollTo('cad')}>3D Digital Twin</button></li>
              <li><button onClick={() => scrollTo('mandates')}>System Mandates</button></li>
              <li><button onClick={() => scrollTo('simulator')}>Arena Teleoperation</button></li>
              <li><button onClick={() => scrollTo('kinematics')}>Kinematics Solver</button></li>
              <li><button onClick={() => scrollTo('subsystems')}>Subsystems</button></li>
              <li><button onClick={() => scrollTo('gallery')}>CAD Blueprints</button></li>
              <li><button onClick={() => scrollTo('specs')}>Specifications</button></li>
              <li><button onClick={() => scrollTo('team')}>Team</button></li>
            </ul>
          </div>

          {/* Divisions Col */}
          <div className="footer-divisions-col">
            <h5 className="footer-col-title mono">// ROBOTICS DIVISIONS</h5>
            <div className="divisions-list">
              <div className="division-item">
                <span className="div-code mono">STARK MECHANICS</span>
                <span className="div-desc">Mechanical Kinematics & Chassis</span>
              </div>
              <div className="division-item">
                <span className="div-code mono">JARVIS EMBEDDED</span>
                <span className="div-desc">Embedded Firmware & EKF Odometry</span>
              </div>
              <div className="division-item">
                <span className="div-code mono">ARC POWER</span>
                <span className="div-desc">Actuation & 14.8V Power Electronics</span>
              </div>
              <div className="division-item">
                <span className="div-code mono">TACTICAL TELEMETRY</span>
                <span className="div-desc">Operator HMI & 2.4GHz Telemetry</span>
              </div>
            </div>
          </div>

          {/* Action & Back to Top Col */}
          <div className="footer-action-col">
            <h5 className="footer-col-title mono">// HEADQUARTERS</h5>
            <div className="hq-info">
              <p className="hq-name">SRM Robocon Innovation Lab</p>
              <p className="hq-spec">Autonomous Robotics Division • Team 8</p>
              <p className="hq-brief mono">PROBLEM STATEMENT 8 // MARK-VIII</p>
            </div>

            <button 
              onClick={onScrollTop} 
              className="footer-back-top-btn"
              id="footer-back-to-top-btn"
            >
              <ArrowUp size={15} />
              <span>RETURN TO TOP</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="bottom-left mono">
            &copy; {new Date().getFullYear()} SRM Robocon Team 8 • Stark Industries Mark-VIII. All rights reserved.
          </div>
          <div className="bottom-center mono">
            <span className="dot pulse"></span>
            <span>MANDATE 08: CONTINUOUS (X, Y, θ) POSE TELEMETRY</span>
          </div>
          <div className="bottom-right mono">
            SRM ROBOCON '26
          </div>
        </div>
      </div>
    </footer>
  );
}
