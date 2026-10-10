import React, { useState } from 'react';
import { 
  Navigation, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Weight, 
  Radio, 
  Zap, 
  RefreshCw,
  Compass,
  Gauge
} from 'lucide-react';
import './TelemetryHUD.css';

export default function TelemetryHUD({ telemetry, onResetOrigin, onTareDistance, onSetPayload }) {
  const [minimized, setMinimized] = useState(false);

  const {
    x = 0,             // mm
    y = 0,             // mm
    theta = 0,         // degrees
    distance = 0,      // meters
    payload = 5.0,     // kg
    velocity = 0,      // m/s
    motionState = 'IDLE',
    source = 'STANDBY'
  } = telemetry || {};

  return (
    <aside 
      className={`telemetry-hud-root ${minimized ? 'minimized' : ''}`} 
      aria-label="Real-time Platform Telemetry HUD"
      id="telemetry-hud-bar"
    >
      <div className="hud-container">
        {/* Header / Collapse Bar */}
        <div className="hud-header">
          <div className="hud-title-cluster">
            <span className="hud-beacon"></span>
            <span className="hud-title mono">OPERATOR MANDATE // TELEMETRY HUD</span>
            <span className="hud-state-pill mono">{motionState}</span>
          </div>

          <div className="hud-controls">
            <span className="hud-source-badge mono">{source}</span>
            <button 
              onClick={() => setMinimized(!minimized)} 
              className="hud-min-btn"
              title={minimized ? "Expand Telemetry HUD" : "Minimize HUD"}
            >
              {minimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            </button>
          </div>
        </div>

        {/* Full Telemetry Content */}
        {!minimized && (
          <div className="hud-body">
            {/* Coordinates Cluster: X and Y */}
            <div className="hud-metric-card coordinate-card">
              <div className="metric-header">
                <span className="metric-label mono">POSITION (X, Y)</span>
                <span className="metric-unit mono">LOCAL FRAME</span>
              </div>
              <div className="coords-row">
                <div className="coord-item">
                  <span className="coord-axis mono">X:</span>
                  <span className="coord-value mono">
                    {x >= 0 ? `+${(x / 1000).toFixed(3)}` : (x / 1000).toFixed(3)}
                  </span>
                  <span className="coord-unit mono">m</span>
                  <span className="coord-sub mono">({Math.round(x)} mm)</span>
                </div>
                <div className="coord-divider"></div>
                <div className="coord-item">
                  <span className="coord-axis mono">Y:</span>
                  <span className="coord-value mono">
                    {y >= 0 ? `+${(y / 1000).toFixed(3)}` : (y / 1000).toFixed(3)}
                  </span>
                  <span className="coord-unit mono">m</span>
                  <span className="coord-sub mono">({Math.round(y)} mm)</span>
                </div>
              </div>
            </div>

            {/* Angle & Compass Cluster: θ */}
            <div className="hud-metric-card heading-card">
              <div className="metric-header">
                <span className="metric-label mono">ORIENTATION (θ)</span>
                <span className="metric-unit mono">YAW ANGLE</span>
              </div>
              <div className="heading-row">
                <div className="compass-widget">
                  <div 
                    className="compass-needle" 
                    style={{ transform: `rotate(${theta}deg)` }}
                  >
                    <div className="needle-north"></div>
                    <div className="needle-south"></div>
                  </div>
                  <span className="compass-n mono">N</span>
                </div>
                <div className="heading-data">
                  <span className="heading-val mono">{theta.toFixed(1)}°</span>
                  <span className="heading-rad mono">{((theta * Math.PI) / 180).toFixed(3)} rad</span>
                </div>
              </div>
            </div>

            {/* Odometer Cluster */}
            <div className="hud-metric-card odo-card">
              <div className="metric-header">
                <span className="metric-label mono">ODOMETER</span>
                <span className="metric-unit mono">TOTAL TRAVELED</span>
              </div>
              <div className="odo-content">
                <div className="odo-val-row">
                  <span className="odo-value mono">{distance.toFixed(2)}</span>
                  <span className="odo-unit mono">meters</span>
                </div>
                <div className="odo-speed mono">
                  Vel: {velocity.toFixed(2)} m/s
                </div>
              </div>
            </div>

            {/* Payload 5kg Monitor */}
            <div className="hud-metric-card payload-card">
              <div className="metric-header">
                <span className="metric-label mono">PAYLOAD LOAD</span>
                <span className="metric-unit mono">RATED: 5.0 kg</span>
              </div>
              <div className="payload-content">
                <div className="payload-val-row">
                  <span className="payload-value mono">{payload.toFixed(1)}</span>
                  <span className="payload-unit mono">kg</span>
                  <span className={`payload-badge mono ${payload >= 5.0 ? 'max' : ''}`}>
                    {payload >= 5.0 ? 'MAX CAPACITY' : 'NOMINAL'}
                  </span>
                </div>
                <div className="payload-bar-track">
                  <div 
                    className="payload-bar-fill"
                    style={{ width: `${Math.min(100, (payload / 5.0) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Actions: Reset Origin & Tare */}
            <div className="hud-actions-card">
              <button 
                onClick={onResetOrigin} 
                className="hud-action-btn"
                title="Reset local pose origin (X=0, Y=0, θ=0)"
                id="reset-origin-btn"
              >
                <RefreshCw size={13} />
                <span>ZERO ORIGIN</span>
              </button>
              <button 
                onClick={onTareDistance} 
                className="hud-action-btn secondary"
                title="Tare odometer distance"
                id="tare-distance-btn"
              >
                <RotateCw size={13} />
                <span>TARE DIST</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
