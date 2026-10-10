import React, { useState } from 'react';
import { 
  Calculator, 
  RotateCw, 
  Compass, 
  Cpu, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import './KinematicsEngine.css';

export default function KinematicsEngine() {
  // Desired chassis velocities
  const [vx, setVx] = useState(0.5);   // m/s (surge)
  const [vy, setVy] = useState(0.2);   // m/s (sway)
  const [omega, setOmega] = useState(0.0); // rad/s (yaw rate)

  // Platform Physical Parameters (matching CAD model)
  const R = 0.032; // wheel radius = 32mm (0.032 m)
  const L = 0.140; // distance from chassis geometric center to wheel = 140mm (0.140 m)

  // 4 Wheels mounted at 45° angles:
  // α1 = 45°, α2 = 135°, α3 = 225°, α4 = 315°
  // For each wheel: ω_i = (1/R) * [-sin(α_i)*vx + cos(α_i)*vy + L*omega]
  const rad45 = Math.PI / 4;
  const sin45 = Math.SQRT1_2; // ~0.7071
  const cos45 = Math.SQRT1_2;

  // Wheel 1 (Front-Left, 45°):
  const w1_rad = (1 / R) * (-sin45 * vx + cos45 * vy + L * omega);
  // Wheel 2 (Front-Right, 135°):
  const w2_rad = (1 / R) * (-sin45 * vx - cos45 * vy + L * omega);
  // Wheel 3 (Rear-Left, 225°):
  const w3_rad = (1 / R) * (sin45 * vx - cos45 * vy + L * omega);
  // Wheel 4 (Rear-Right, 315°):
  const w4_rad = (1 / R) * (sin45 * vx + cos45 * vy + L * omega);

  const toRPM = (rad) => (rad * 60) / (2 * Math.PI);

  const wheels = [
    { id: 'M1', name: 'Front-Left Wheel', angle: '45°', rad: w1_rad, rpm: toRPM(w1_rad), pos: 'top-left' },
    { id: 'M2', name: 'Front-Right Wheel', angle: '135°', rad: w2_rad, rpm: toRPM(w2_rad), pos: 'top-right' },
    { id: 'M3', name: 'Rear-Left Wheel', angle: '225°', rad: w3_rad, rpm: toRPM(w3_rad), pos: 'bottom-left' },
    { id: 'M4', name: 'Rear-Right Wheel', angle: '315°', rad: w4_rad, rpm: toRPM(w4_rad), pos: 'bottom-right' },
  ];

  return (
    <section className="kinematics-section-root" id="kinematics">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">4-Wheel 45° Holonomic Kinematics</h2>
          <p className="section-subtitle">
            Derivation of platform velocity mapping, transformation matrices, and real-time wheel angular speed equations.
          </p>
        </div>

        <div className="kinematics-grid">
          {/* Interactive Calculator Panel */}
          <div className="glass-card calc-card">
            <div className="calc-header">
              <Calculator size={18} className="calc-icon" />
              <div className="calc-title-group">
                <span className="calc-title mono">JARVIS REAL-TIME INVERSE KINEMATICS</span>
                <span className="calc-sub mono">INPUT DESIRED [Vx, Vy, ω] → SOLVE [ω1, ω2, ω3, ω4]</span>
              </div>
            </div>

            {/* Sliders for Vx, Vy, Omega */}
            <div className="kin-sliders-container">
              {/* Vx Slider */}
              <div className="kin-slider-block">
                <div className="kin-slider-header mono">
                  <span>SURGE VELOCITY (Vx - FORWARD/BACK):</span>
                  <span className="kin-val text-crimson">{vx >= 0 ? `+${vx.toFixed(2)}` : vx.toFixed(2)} m/s</span>
                </div>
                <input 
                  type="range" 
                  min="-1.5" 
                  max="1.5" 
                  step="0.05" 
                  value={vx} 
                  onChange={(e) => setVx(parseFloat(e.target.value))}
                  className="custom-range-slider"
                  id="slider-vx"
                />
              </div>

              {/* Vy Slider */}
              <div className="kin-slider-block">
                <div className="kin-slider-header mono">
                  <span>SWAY VELOCITY (Vy - LATERAL STRAFE):</span>
                  <span className="kin-val text-crimson">{vy >= 0 ? `+${vy.toFixed(2)}` : vy.toFixed(2)} m/s</span>
                </div>
                <input 
                  type="range" 
                  min="-1.5" 
                  max="1.5" 
                  step="0.05" 
                  value={vy} 
                  onChange={(e) => setVy(parseFloat(e.target.value))}
                  className="custom-range-slider"
                  id="slider-vy"
                />
              </div>

              {/* Omega Slider */}
              <div className="kin-slider-block">
                <div className="kin-slider-header mono">
                  <span>YAW RATE (ω - IN-PLACE ROTATION):</span>
                  <span className="kin-val text-gold">{omega >= 0 ? `+${omega.toFixed(2)}` : omega.toFixed(2)} rad/s</span>
                </div>
                <input 
                  type="range" 
                  min="-3.0" 
                  max="3.0" 
                  step="0.1" 
                  value={omega} 
                  onChange={(e) => setOmega(parseFloat(e.target.value))}
                  className="custom-range-slider"
                  id="slider-omega"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="kin-presets-row">
                <button onClick={() => { setVx(1.0); setVy(0); setOmega(0); }} className="kin-preset-btn mono">
                  PURE FORWARD
                </button>
                <button onClick={() => { setVx(0); setVy(1.0); setOmega(0); }} className="kin-preset-btn mono">
                  PURE STRAFE
                </button>
                <button onClick={() => { setVx(0.7); setVy(0.7); setOmega(0); }} className="kin-preset-btn mono">
                  45° DIAGONAL
                </button>
                <button onClick={() => { setVx(0); setVy(0); setOmega(2.0); }} className="kin-preset-btn mono">
                  PURE YAW SPIN
                </button>
              </div>
            </div>

            {/* Solved Wheel Speeds Grid */}
            <div className="wheels-solution-grid">
              {wheels.map((w) => (
                <div key={w.id} className="wheel-solution-card">
                  <div className="wheel-sol-header">
                    <span className="wheel-id mono">{w.id} // {w.angle}</span>
                    <span className="wheel-pos mono">{w.name}</span>
                  </div>
                  <div className="wheel-val-row">
                    <span className="wheel-rpm mono">{Math.round(w.rpm)}</span>
                    <span className="wheel-unit mono">RPM</span>
                  </div>
                  <div className="wheel-rad mono">
                    {w.rad.toFixed(2)} rad/s
                  </div>
                  <div className="wheel-vector-indicator">
                    <RotateCw 
                      size={14} 
                      className={`spin-indicator ${w.rpm > 0 ? 'cw' : w.rpm < 0 ? 'ccw' : 'idle'}`}
                      style={{ animationDuration: `${Math.max(0.2, 50 / (Math.abs(w.rpm) + 1))}s` }}
                    />
                    <span className="mono vector-text">
                      {w.rpm > 0 ? 'FORWARD ROTATION' : w.rpm < 0 ? 'REVERSE ROTATION' : 'HOLD'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mathematical Formulations & Dead-Reckoning Card */}
          <div className="glass-card math-card">
            <div className="math-header">
              <Cpu size={18} className="math-icon" />
              <span className="math-title mono">KINEMATIC MATRIX & DEAD RECKONING</span>
            </div>

            {/* Matrix Block */}
            <div className="matrix-block">
              <span className="matrix-label mono">// INVERSE KINEMATICS MATRIX FORMULATION</span>
              <div className="matrix-equation mono">
                <div className="matrix-bracket left"></div>
                <div className="matrix-col">
                  <div>ω₁</div>
                  <div>ω₂</div>
                  <div>ω₃</div>
                  <div>ω₄</div>
                </div>
                <div className="matrix-bracket right"></div>
                <span className="eq-sign">=</span>
                <span className="scalar">1/R</span>
                <div className="matrix-bracket left"></div>
                <div className="matrix-grid-3x4">
                  <div>-sin(45°)</div><div> cos(45°)</div><div>L</div>
                  <div>-sin(135°)</div><div> cos(135°)</div><div>L</div>
                  <div>-sin(225°)</div><div> cos(225°)</div><div>L</div>
                  <div>-sin(315°)</div><div> cos(315°)</div><div>L</div>
                </div>
                <div className="matrix-bracket right"></div>
                <div className="matrix-bracket left"></div>
                <div className="matrix-col">
                  <div>Vx</div>
                  <div>Vy</div>
                  <div>ωz</div>
                </div>
                <div className="matrix-bracket right"></div>
              </div>
            </div>

            {/* Dead Reckoning Equations */}
            <div className="dead-reckoning-block">
              <span className="matrix-label mono">// DEAD-RECKONING ODOMETRY INTEGRATION</span>
              <p className="math-desc">
                Optical quadrature wheel ticks are converted into incremental displacements, then rotated into 
                the global coordinate frame relative to starting point <span className="mono text-cyan">(0, 0, 0°)</span>:
              </p>

              <div className="equation-box mono">
                <div>ΔX_local = (Δs₄ - Δs₂) / (2√2)</div>
                <div>ΔY_local = (Δs₁ - Δs₃) / (2√2)</div>
                <div>Δθ = (Δs₁ + Δs₂ + Δs₃ + Δs₄) / (4·L)</div>
              </div>

              <div className="equation-box mono global">
                <div>X_new = X_prev + (ΔX_local · cos θ - ΔY_local · sin θ)</div>
                <div>Y_new = Y_prev + (ΔX_local · sin θ + ΔY_local · cos θ)</div>
                <div>θ_fused = α · θ_gyro + (1 - α) · θ_encoders  (EKF Fusion)</div>
              </div>
            </div>

            <div className="params-strip mono">
              <div>R = 32 mm (Wheel Radius)</div>
              <div>L = 140 mm (Radius to Center)</div>
              <div>CPR = 1024 Optical Ticks</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
