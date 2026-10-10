import React, { useState } from 'react';
import { 
  Zap, 
  RotateCw, 
  RefreshCw, 
  ChevronUp, 
  ChevronDown,
  Crosshair
} from 'lucide-react';
import './TelemetryHUD.css';

export default function TelemetryHUD({ telemetry, onResetOrigin, onTareDistance }) {
  const [expanded, setExpanded] = useState(false);

  const {
    x = 0,
    y = 0,
    theta = 0,
    distance = 0,
    payload = 15.0,
    velocity = 0,
    motionState = 'IDLE',
  } = telemetry || {};

  return (
    <div className={`telemetry-minimal-dock ${expanded ? 'expanded' : ''}`} id="telemetry-hud-dock">
      {/* Sleek Minimal Floating Architectural HUD Bar */}
      <div className="telemetry-pill-strip" onClick={() => setExpanded(!expanded)}>
        <span className="telemetry-pill-title mono">HUD //</span>
        <span className="telemetry-pill-val mono">
          X: {x >= 0 ? `+${(x / 1000).toFixed(2)}` : (x / 1000).toFixed(2)}m
        </span>
        <span className="telemetry-pill-val mono">
          Y: {y >= 0 ? `+${(y / 1000).toFixed(2)}` : (y / 1000).toFixed(2)}m
        </span>
        <span className="telemetry-pill-val mono highlight">
          θ: {Math.round(theta)}°
        </span>
        <span className="telemetry-pill-divider">|</span>
        <span className="telemetry-pill-val mono gold-val">{payload.toFixed(1)}kg</span>
        <span className="telemetry-expand-btn">
          {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </span>
      </div>

      {/* Expanded Quick Drawer */}
      {expanded && (
        <div className="telemetry-expanded-panel">
          <div className="expanded-header">
            <span className="expanded-title mono">
              <Crosshair size={12} /> STARK TACTICAL ODOMETRY
            </span>
            <span className="expanded-status-badge mono">ONLINE</span>
          </div>
          <div className="expanded-row">
            <span className="expanded-label mono">DISTANCE TRAVELED:</span>
            <span className="expanded-val mono">{distance.toFixed(2)} m</span>
          </div>
          <div className="expanded-row">
            <span className="expanded-label mono">LINEAR VELOCITY:</span>
            <span className="expanded-val mono">{velocity.toFixed(2)} m/s</span>
          </div>
          <div className="expanded-row">
            <span className="expanded-label mono">MARK-VIII STATE:</span>
            <span className="expanded-val mono highlight">{motionState}</span>
          </div>
          <div className="expanded-actions">
            <button onClick={onResetOrigin} className="mini-hud-btn mono" id="hud-zero-btn">
              <RefreshCw size={12} />
              <span>ZERO DATUM (0,0)</span>
            </button>
            <button onClick={onTareDistance} className="mini-hud-btn secondary mono" id="hud-tare-btn">
              <RotateCw size={12} />
              <span>TARE DIST</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
