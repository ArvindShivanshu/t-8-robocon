import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Gamepad2, 
  RotateCw, 
  RotateCcw, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Trash2, 
  Play, 
  Pause, 
  Sliders, 
  Weight, 
  Navigation,
  Compass,
  AlertCircle
} from 'lucide-react';
import './ArenaSimulator.css';

export default function ArenaSimulator({ onTelemetryUpdate, currentTheme }) {
  const canvasRef = useRef(null);

  // Platform state in arena (units: arena pixels, where 1 pixel = 10 mm)
  const robotRef = useRef({
    x: 400,       // pixels (4000 mm)
    y: 300,       // pixels (3000 mm)
    theta: 0,     // radians
    vx: 0,
    vy: 0,
    omega: 0,
    trail: [],
    distanceTraveled: 0, // meters
  });

  const [activeKeys, setActiveKeys] = useState({});
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [payloadKg, setPayloadKg] = useState(5.0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayStepRef = useRef(0);

  // Preset warehouse obstacles and racks
  const obstacles = [
    { x: 120, y: 80, w: 160, h: 60, label: 'RACK A1 (STORAGE)' },
    { x: 520, y: 80, w: 160, h: 60, label: 'RACK A2 (STORAGE)' },
    { x: 120, y: 460, w: 160, h: 60, label: 'RACK B1 (STORAGE)' },
    { x: 520, y: 460, w: 160, h: 60, label: 'RACK B2 (STORAGE)' },
    { x: 340, y: 240, w: 120, h: 120, label: 'RESTRICTED PALLET ZONE' },
  ];

  // Zero Origin function
  const resetToOrigin = () => {
    const r = robotRef.current;
    r.x = 400;
    r.y = 300;
    r.theta = 0;
    r.vx = 0;
    r.vy = 0;
    r.omega = 0;
    r.trail = [{ x: 400, y: 300 }];
    r.distanceTraveled = 0;

    if (onTelemetryUpdate) {
      onTelemetryUpdate({
        x: 0,
        y: 0,
        theta: 0,
        distance: 0,
        velocity: 0,
        payload: payloadKg,
        motionState: 'ZERO_RESET',
        source: 'MANUAL_ARENA_SIM'
      });
    }
  };

  const clearTrail = () => {
    robotRef.current.trail = [{ x: robotRef.current.x, y: robotRef.current.y }];
  };

  // Keyboard listeners for intuitive WASD / Arrows
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'q', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        setActiveKeys((prev) => ({ ...prev, [key]: true }));
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      setActiveKeys((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Preset Maneuvers
  const runPreset = (maneuver) => {
    setIsAutoPlaying(true);
    let step = 0;
    const interval = setInterval(() => {
      const r = robotRef.current;
      step++;

      if (maneuver === 'square') {
        // Pure strafe in a 120px square without turning
        if (step < 30) r.vx = 2.5;
        else if (step < 60) { r.vx = 0; r.vy = 2.5; }
        else if (step < 90) { r.vx = -2.5; r.vy = 0; }
        else if (step < 120) { r.vx = 0; r.vy = -2.5; }
        else {
          r.vx = 0; r.vy = 0;
          clearInterval(interval);
          setIsAutoPlaying(false);
        }
      } else if (maneuver === 'spin') {
        // In-place 360 spin
        if (step < 80) {
          r.omega = 0.08;
        } else {
          r.omega = 0;
          clearInterval(interval);
          setIsAutoPlaying(false);
        }
      } else if (maneuver === 'diagonal') {
        // 45 degree diagonal holonomic pass
        if (step < 40) {
          r.vx = 2.2;
          r.vy = 2.2;
        } else if (step < 80) {
          r.vx = -2.2;
          r.vy = -2.2;
        } else {
          r.vx = 0;
          r.vy = 0;
          clearInterval(interval);
          setIsAutoPlaying(false);
        }
      }
    }, 40);
  };

  // Main 60FPS Physics and Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const render = () => {
      animationId = requestAnimationFrame(render);
      const r = robotRef.current;

      // Inertia calculation based on 5kg payload (higher payload = slight inertia smoothing)
      const inertiaFactor = 1.0 - (payloadKg / 5.0) * 0.15;
      const speed = 3.2 * speedMultiplier * inertiaFactor;
      const rotSpeed = 0.045;

      // Process manual inputs
      let targetVx = 0;
      let targetVy = 0;
      let targetOmega = 0;

      // Keyboard input
      if (activeKeys['w'] || activeKeys['arrowup']) targetVy -= speed;
      if (activeKeys['s'] || activeKeys['arrowdown']) targetVy += speed;
      if (activeKeys['a'] || activeKeys['arrowleft']) targetVx -= speed;
      if (activeKeys['d'] || activeKeys['arrowright']) targetVx += speed;
      if (activeKeys['q']) targetOmega -= rotSpeed;
      if (activeKeys['e']) targetOmega += rotSpeed;

      // Virtual Joystick input
      if (joystickActive) {
        targetVx += (joystickPos.x / 40) * speed;
        targetVy += (joystickPos.y / 40) * speed;
      }

      // Smooth velocity interpolation
      if (!isAutoPlaying) {
        r.vx += (targetVx - r.vx) * 0.25;
        r.vy += (targetVy - r.vy) * 0.25;
        r.omega += (targetOmega - r.omega) * 0.3;
      }

      // Compute step displacement
      const dx = r.vx;
      const dy = r.vy;
      const stepDistMeters = Math.hypot(dx, dy) * 0.01; // 1px = 10mm = 0.01m
      r.distanceTraveled += stepDistMeters;

      r.x += dx;
      r.y += dy;
      r.theta += r.omega;

      // Constrain inside arena boundary (800 x 600)
      r.x = Math.max(35, Math.min(canvas.width - 35, r.x));
      r.y = Math.max(35, Math.min(canvas.height - 35, r.y));

      // Append to path trail (subsampled for performance)
      if (Math.hypot(dx, dy) > 0.4 || Math.abs(r.omega) > 0.01) {
        if (r.trail.length === 0 || Math.hypot(r.trail[r.trail.length - 1].x - r.x, r.trail[r.trail.length - 1].y - r.y) > 6) {
          r.trail.push({ x: r.x, y: r.y });
          if (r.trail.length > 500) r.trail.shift();
        }
      }

      // Send telemetry updates
      if (onTelemetryUpdate) {
        const thetaDeg = ((r.theta * 180) / Math.PI) % 360;
        const normalizedTheta = thetaDeg < 0 ? thetaDeg + 360 : thetaDeg;
        const velMps = Math.hypot(r.vx, r.vy) * 0.6;

        let motion = 'IDLE';
        if (Math.abs(r.omega) > 0.01 && Math.hypot(r.vx, r.vy) < 0.2) motion = 'IN_PLACE_SPIN';
        else if (Math.abs(r.vx) > 0.5 && Math.abs(r.vy) > 0.5) motion = 'DIAGONAL_45°';
        else if (Math.abs(r.vx) > 0.5) motion = 'HOLONOMIC_STRAFE';
        else if (Math.abs(r.vy) > 0.5) motion = 'TRANSLATING';

        onTelemetryUpdate({
          x: (r.x - 400) * 10, // mm relative to arena origin (400, 300)
          y: (300 - r.y) * 10, // mm (inverted Y for standard cartesian coordinate)
          theta: normalizedTheta,
          distance: r.distanceTraveled,
          velocity: velMps,
          payload: payloadKg,
          motionState: motion,
          source: 'ARENA_SIMULATOR'
        });
      }

      // DRAW CANVAS: Minimal Studio Warehouse Floor (Terafab Style)
      ctx.fillStyle = '#08080a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor Grid (Subtle Hairlines)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Minimal Datum Origin Marker (400, 300)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(400, 300, 20, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(400, 300, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px "JetBrains Mono"';
      ctx.fillText('(0, 0) DATUM ORIGIN', 412, 296);

      // Draw Warehouse Obstacles & Racks (Minimalist Architectural Blocks)
      obstacles.forEach((obs) => {
        ctx.fillStyle = '#111114';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);

        // Rack Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '9px "JetBrains Mono"';
        ctx.fillText(obs.label, obs.x + 10, obs.y + 20);
      });

      // Draw Breadcrumb Path Trail (Clean Hairline Path)
      if (r.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(r.trail[0].x, r.trail[0].y);
        for (let i = 1; i < r.trail.length; i++) {
          ctx.lineTo(r.trail[i].x, r.trail[i].y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw Robot Sprite (Minimal Holonomic Mobile Platform)
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(r.theta);

      // Chassis Base Rect
      ctx.fillStyle = '#1c1c20';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-24, -26, 48, 52);
      ctx.strokeRect(-24, -26, 48, 52);

      // 4x 45° Omni Wheels at corners
      const wheelOffsets = [
        { x: -22, y: -24, rot: Math.PI / 4 },
        { x: 22, y: -24, rot: -Math.PI / 4 },
        { x: -22, y: 24, rot: 3 * Math.PI / 4 },
        { x: 22, y: 24, rot: -3 * Math.PI / 4 },
      ];

      wheelOffsets.forEach((w) => {
        ctx.save();
        ctx.translate(w.x, w.y);
        ctx.rotate(w.rot);
        ctx.fillStyle = '#0a0a0c';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.fillRect(-4, -9, 8, 18);
        ctx.strokeRect(-4, -9, 8, 18);
        ctx.restore();
      });

      // Cargo Container (Center Tray)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.fillRect(-18, -20, 36, 40);
      ctx.strokeRect(-18, -20, 36, 40);

      // Payload Text Inside Tray
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px "JetBrains Mono"';
      ctx.textAlign = 'center';
      ctx.fillText(`${payloadKg.toFixed(1)}kg`, 0, 3);

      // Heading Vector (Pointing forward)
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(0, -36);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-3, -33);
      ctx.lineTo(0, -40);
      ctx.lineTo(3, -33);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [activeKeys, joystickActive, joystickPos, payloadKg, speedMultiplier, isAutoPlaying, currentTheme, onTelemetryUpdate]);

  // Touch / Mouse Joystick dragging
  const handleJoystickMove = (e) => {
    if (!joystickActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const dist = Math.hypot(deltaX, deltaY);
    const maxDist = 38;

    if (dist <= maxDist) {
      setJoystickPos({ x: deltaX, y: deltaY });
    } else {
      const angle = Math.atan2(deltaY, deltaX);
      setJoystickPos({
        x: Math.cos(angle) * maxDist,
        y: Math.sin(angle) * maxDist,
      });
    }
  };

  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
  };

  return (
    <section className="simulator-section-root" id="timeline">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">Restricted Workspace Flight & Telemetry Sim</h2>
          <p className="section-subtitle">
            Interact with the Mark-VIII holonomic platform in real-time. Navigate confined aisles, 
            test 45° lateral strafe, zero datum coordinates, and simulate 5 kg payload inertia.
          </p>
        </div>

        {/* Simulator Grid Workspace */}
        <div className="sim-layout">
          {/* Main 2D Canvas Arena */}
          <div className="canvas-arena-card glass-card">
            <div className="arena-header-bar">
              <div className="arena-title mono">
                <span className="beacon-dot"></span>
                <span>TACTICAL ARENA GRID // 8.0m x 6.0m RESTRICTED ZONE</span>
              </div>
              <div className="arena-tools">
                <button 
                  onClick={resetToOrigin} 
                  className="arena-tool-btn mono"
                  title="Zero datum origin to (0,0)"
                  id="arena-zero-origin-btn"
                >
                  <RefreshCw size={13} />
                  <span>ZERO DATUM</span>
                </button>
                <button 
                  onClick={clearTrail} 
                  className="arena-tool-btn mono"
                  title="Clear trajectory path"
                  id="arena-clear-trail-btn"
                >
                  <Trash2 size={13} />
                  <span>CLEAR TRAIL</span>
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="canvas-wrapper">
              <canvas 
                ref={canvasRef} 
                width={800} 
                height={550} 
                className="arena-canvas"
                id="warehouse-arena-canvas"
              />
            </div>

            {/* Arena Legend */}
            <div className="arena-legend mono">
              <div className="legend-item"><span className="legend-color crimson"></span><span>CRIMSON TRAIL</span></div>
              <div className="legend-item"><span className="legend-color cyan"></span><span>ARC VECTOR (θ)</span></div>
              <div className="legend-item"><span className="legend-color gold"></span><span>5KG GOLD PAYLOAD</span></div>
              <div className="legend-item"><span className="legend-color rack"></span><span>STORAGE RACKS</span></div>
            </div>
          </div>

          {/* Control Pendant Panel */}
          <div className="control-pendant-card glass-card">
            <div className="pendant-header">
              <Gamepad2 size={18} className="pendant-icon" />
              <div className="pendant-title-group">
                <span className="pendant-title mono">JARVIS TACTICAL PENDANT</span>
                <span className="pendant-sub mono">MARK-VIII TELEMETRY FLIGHT CONTROLLER</span>
              </div>
            </div>

            {/* Virtual Touch Joystick */}
            <div className="joystick-container">
              <span className="mono joystick-label">// 360° HOLONOMIC OMNI JOYSTICK</span>
              <div 
                className="joystick-base"
                onMouseDown={() => setJoystickActive(true)}
                onMouseMove={handleJoystickMove}
                onMouseUp={handleJoystickEnd}
                onMouseLeave={handleJoystickEnd}
                onTouchStart={() => setJoystickActive(true)}
                onTouchMove={handleJoystickMove}
                onTouchEnd={handleJoystickEnd}
                id="virtual-touch-joystick"
              >
                <div 
                  className="joystick-thumb"
                  style={{
                    transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
                  }}
                >
                  <div className="thumb-center"></div>
                </div>
              </div>
              <span className="mono joystick-sub">DRAG ARC THUMBSTICK FOR DIRECT OMNI TRANSLATION</span>
            </div>

            {/* Discrete Direction Buttons */}
            <div className="discrete-controls-group">
              <span className="mono control-group-label">// DISCRETE DIRECTIONAL THRUST</span>
              <div className="dpad-grid">
                <button 
                  className={`dpad-btn up ${activeKeys['w'] ? 'pressed' : ''}`}
                  onMouseDown={() => setActiveKeys(p => ({ ...p, w: true }))}
                  onMouseUp={() => setActiveKeys(p => { const n = {...p}; delete n.w; return n; })}
                  id="btn-move-forward"
                >
                  <ArrowUp size={16} />
                </button>
                <button 
                  className={`dpad-btn left ${activeKeys['a'] ? 'pressed' : ''}`}
                  onMouseDown={() => setActiveKeys(p => ({ ...p, a: true }))}
                  onMouseUp={() => setActiveKeys(p => { const n = {...p}; delete n.a; return n; })}
                  id="btn-strafe-left"
                >
                  <ArrowLeft size={16} />
                </button>
                <button 
                  className="dpad-btn center mono"
                  onClick={resetToOrigin}
                >
                  (0,0)
                </button>
                <button 
                  className={`dpad-btn right ${activeKeys['d'] ? 'pressed' : ''}`}
                  onMouseDown={() => setActiveKeys(p => ({ ...p, d: true }))}
                  onMouseUp={() => setActiveKeys(p => { const n = {...p}; delete n.d; return n; })}
                  id="btn-strafe-right"
                >
                  <ArrowRight size={16} />
                </button>
                <button 
                  className={`dpad-btn down ${activeKeys['s'] ? 'pressed' : ''}`}
                  onMouseDown={() => setActiveKeys(p => ({ ...p, s: true }))}
                  onMouseUp={() => setActiveKeys(p => { const n = {...p}; delete n.s; return n; })}
                  id="btn-move-backward"
                >
                  <ArrowDown size={16} />
                </button>
              </div>

              {/* Rotation buttons */}
              <div className="yaw-buttons-row">
                <button 
                  className="yaw-btn mono"
                  onMouseDown={() => setActiveKeys(p => ({ ...p, q: true }))}
                  onMouseUp={() => setActiveKeys(p => { const n = {...p}; delete n.q; return n; })}
                  id="btn-spin-ccw"
                >
                  <RotateCcw size={14} />
                  <span>SPIN CCW (Q)</span>
                </button>
                <button 
                  className="yaw-btn mono"
                  onMouseDown={() => setActiveKeys(p => ({ ...p, e: true }))}
                  onMouseUp={() => setActiveKeys(p => { const n = {...p}; delete n.e; return n; })}
                  id="btn-spin-cw"
                >
                  <RotateCw size={14} />
                  <span>SPIN CW (E)</span>
                </button>
              </div>
            </div>

            {/* Automated Presets */}
            <div className="presets-group">
              <span className="mono control-group-label">// FLIGHT PROTOCOLS</span>
              <div className="preset-buttons-row">
                <button onClick={() => runPreset('square')} className="preset-action-btn mono" id="preset-square-btn">
                  SQUARE PATROL
                </button>
                <button onClick={() => runPreset('diagonal')} className="preset-action-btn mono" id="preset-diag-btn">
                  45° DIAGONAL
                </button>
                <button onClick={() => runPreset('spin')} className="preset-action-btn mono" id="preset-spin-btn">
                  360° YAW SPIN
                </button>
              </div>
            </div>

            {/* 5kg Payload Weight Slider */}
            <div className="slider-control-group">
              <div className="slider-header mono">
                <span>PAYLOAD LOAD:</span>
                <span className="slider-val text-gold">{payloadKg.toFixed(1)} kg</span>
              </div>
              <input 
                type="range" 
                min="0.0" 
                max="5.0" 
                step="0.5" 
                value={payloadKg}
                onChange={(e) => setPayloadKg(parseFloat(e.target.value))}
                className="custom-range-slider"
                id="payload-weight-slider"
              />
              <span className="mono slider-hint">MANDATED CAPACITY: 0 to 5.0 kg</span>
            </div>

            {/* Keyboard shortcut legend */}
            <div className="keyboard-shortcuts-pill mono">
              <span>KEYS: <strong>WASD / ARROWS</strong> (STRAFE) • <strong>Q / E</strong> (ROTATE)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
