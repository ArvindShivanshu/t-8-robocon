import React, { useState, useEffect, useRef } from 'react';
import { 
  Rotate3d, 
  ChevronDown, 
  Ruler, 
  Layers, 
  Orbit 
} from 'lucide-react';
import Robo3DCanvas from './Robo3DCanvas';
import './HeroSection.css';

export default function HeroSection({ 
  onTelemetryUpdate, 
  currentTheme 
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [renderMode, setRenderMode] = useState('shaded'); // 'shaded' (Solid), 'wireframe', 'blueprint'
  const [showDims, setShowDims] = useState(true);
  const [freeOrbit, setFreeOrbit] = useState(false);
  const heroRootRef = useRef(null);

  // 7 Sequence steps matching AnalytiX layout and our platform specifications
  const steps = [
    {
      label: '00',
      title: 'SOLIDWORKS MODEL',
      desc: '1:1 collegiate autonomous warehouse mobile platform with 4-wheel 45° holonomic omni drive',
      theta: 0.72,
      phi: 1.15,
      radius: 820,
      explode: 0,
      p: 0,
      pose: { x: 0, y: 0, theta: 0, motion: 'ORIGIN_DATUM' }
    },
    {
      label: '01',
      title: '45° OMNI CHASSIS',
      desc: 'Chamfered aluminum extrusion frame with 45° motor gusset mounts minimizing aisle envelope',
      theta: 1.08,
      phi: 0.92,
      radius: 560,
      explode: 0,
      p: 0.16,
      pose: { x: 350, y: 0, theta: 0, motion: 'HOLONOMIC_STRAFE' }
    },
    {
      label: '02',
      title: 'MOTOR DRIVETRAIN',
      desc: '4x high-torque planetary geared DC motors with double-row rubber barrel rollers for 360° translation',
      theta: 1.48,
      phi: 0.80,
      radius: 480,
      explode: 0,
      p: 0.32,
      pose: { x: 520, y: 380, theta: 45, motion: 'DIAGONAL_45°' }
    },
    {
      label: '03',
      title: 'EKF ODOMETRY DECK',
      desc: '1024 CPR optical quadrature encoders fused with 6-DoF IMU gyroscope for dead-reckoning',
      theta: 1.88,
      phi: 1.06,
      radius: 550,
      explode: 0,
      p: 0.49,
      pose: { x: 740, y: 740, theta: 90, motion: 'YAW_TRANSIT' }
    },
    {
      label: '04',
      title: 'STRUCTURAL RISERS',
      desc: '4x 60mm cylindrical load-bearing standoffs distributing up to 5kg payload directly to chassis rails',
      theta: 2.32,
      phi: 0.88,
      radius: 460,
      explode: 0,
      p: 0.66,
      pose: { x: 620, y: 1100, theta: 135, motion: 'AISLE_TRANSIT' }
    },
    {
      label: '05',
      title: '5KG PAYLOAD BIN',
      desc: 'Sheet metal cargo containment box engineered for stable manual warehouse loading',
      theta: 2.74,
      phi: 0.78,
      radius: 500,
      explode: 0,
      p: 0.82,
      pose: { x: 300, y: 1450, theta: 180, motion: 'PAYLOAD_LOADED' }
    },
    {
      label: '06',
      title: 'EXPLODED BOM',
      desc: 'Technical exploded breakdown of all modular sub-assemblies along axes',
      theta: 0.85,
      phi: 1.12,
      radius: 920,
      explode: 1,
      p: 0.93,
      pose: { x: 0, y: 1600, theta: 0, motion: 'EXPLODED_BOM' }
    },
  ];

  // Scroll event listener tracking progress through the 360vh corridor
  useEffect(() => {
    const handleScroll = () => {
      const hero = heroRootRef.current;
      if (!hero) return;

      const rect = hero.getBoundingClientRect();
      const totalDist = hero.offsetHeight - window.innerHeight;
      if (totalDist <= 0) return;

      const scrolledDist = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolledDist / totalDist));

      // Map progress to steps
      if (!freeOrbit) {
        let currentIdx = 0;
        for (let i = steps.length - 1; i >= 0; i--) {
          if (progress >= steps[i].p - 0.05) {
            currentIdx = i;
            break;
          }
        }
        setActiveStep(currentIdx);

        // Update telemetry data
        if (onTelemetryUpdate) {
          const pose = steps[currentIdx].pose;
          onTelemetryUpdate({
            x: pose.x,
            y: pose.y,
            theta: pose.theta,
            distance: progress * 4.2,
            velocity: progress > 0.05 && progress < 0.95 ? 0.65 : 0.0,
            payload: currentIdx >= 5 ? 5.0 : 3.5,
            motionState: pose.motion,
            source: 'CAD_SCROLL_CORRIDOR'
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [freeOrbit, onTelemetryUpdate]);

  // Click on a step button smoothly scrolls to that step's position
  const goToStep = (index) => {
    setActiveStep(index);
    setFreeOrbit(false);
    const hero = heroRootRef.current;
    if (!hero) return;

    const targetProgress = steps[index].p;
    const totalDist = hero.offsetHeight - window.innerHeight;
    const targetScrollY = hero.offsetTop + targetProgress * totalDist;

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  };

  const currentStep = steps[activeStep] || steps[0];

  return (
    <section ref={heroRootRef} className="hero-scroll-container" id="cad">
      <div className="hero-scroll-viewport">
        {/* Glow backdrop */}
        <div className="hero-solar-glow" />

        {/* 3D CAD Canvas taking 100% of viewport */}
        <Robo3DCanvas 
          activeStep={activeStep}
          renderMode={renderMode}
          showDims={showDims}
          freeOrbit={freeOrbit}
          onTelemetryUpdate={onTelemetryUpdate}
          currentTheme={currentTheme}
          steps={steps}
        />

        {/* Bottom Left Mode Dock (Matching screenshot) */}
        <div className="hero-mode-dock">
          {['shaded', 'wireframe', 'blueprint'].map((mode) => (
            <button
              key={mode}
              onClick={() => setRenderMode(mode)}
              className={`hud-mode-pill ${renderMode === mode ? 'active' : ''}`}
              id={`render-mode-${mode}`}
            >
              {mode === 'shaded' ? 'Solid' : mode}
            </button>
          ))}

          <button
            onClick={() => setShowDims(!showDims)}
            className={`hud-mode-pill ${showDims ? 'active' : ''}`}
            title="Toggle Dimension Annotations"
            id="toggle-dims-btn"
          >
            <Ruler size={13} />
            <span>Dims</span>
          </button>

          <div className="dock-divider" />

          <button
            onClick={() => setFreeOrbit(!freeOrbit)}
            className={`hud-mode-pill ${freeOrbit ? 'active' : ''}`}
            title="Click & Drag to freely orbit 3D model"
            id="toggle-free-orbit-btn"
          >
            <Orbit size={13} />
            <span>{freeOrbit ? 'Orbit Active' : 'Free Orbit'}</span>
          </button>
        </div>

        {/* Right Side Vertical Step Navigation (Matching screenshot) */}
        <div className="hero-cad-step-nav">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={step.label}
                onClick={() => goToStep(idx)}
                className={`step-nav-item ${isActive ? 'active' : ''}`}
                id={`step-pill-${step.label}`}
              >
                <span className="step-nav-num mono">{step.label}</span>
                <span className="step-nav-label mono">{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Center Caption Capsule (Matching screenshot) */}
        <div className="hero-step-caption-capsule">
          <span className="step-capsule-tag mono">{currentStep.label}</span>
          <span className="step-capsule-dot" />
          <span className="step-capsule-title mono">{currentStep.title}</span>
          <span className="step-capsule-sep">•</span>
          <span className="step-capsule-desc">{currentStep.desc}</span>
        </div>

        {/* Scroll Cue */}
        <div className="hero-scroll-cue">
          <ChevronDown size={18} className="prompt-chevron" />
        </div>
      </div>
    </section>
  );
}
