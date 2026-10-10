import React, { useRef, useEffect, useState, useMemo, useId } from 'react';
import './CurvedLoop.css';

export default function CurvedLoop({
  marqueeText = '// 4-WHEEL 45° HOLONOMIC AGV • 100HZ EKF SENSOR FUSION • ZERO TURNING RADIUS • 5.0 KG PAYLOAD TWIN • STARK ROBOTICS MK-VIII •',
  speed = 1.6,
  curveAmount = 90,
  direction = 'left',
  interactive = true,
  className = '',
}) {
  const uid = useId().replace(/:/g, '');
  const pathId = `curve-path-${uid}`;
  const measureRef = useRef(null);
  const textPathRef = useRef(null);
  const svgRef = useRef(null);

  const [spacing, setSpacing] = useState(0);
  const offsetRef = useRef(0);
  const animFrameRef = useRef(null);

  // Drag interaction state
  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const velRef = useRef(0);

  // Prepare text with trailing non-breaking space
  const text = useMemo(() => {
    const clean = marqueeText.trim();
    return clean + '\u00A0\u00A0\u00A0\u00A0';
  }, [marqueeText]);

  // Quadratic SVG curve: starts at x=-100, curves through midpoint, ends at 1700
  const pathD = `M-100,50 Q750,${50 + curveAmount} 1700,50`;

  // Repeat text to fill the path completely
  const totalText = useMemo(() => {
    if (!spacing) return text;
    const count = Math.ceil(2800 / spacing) + 3;
    return Array(count).fill(text).join('');
  }, [text, spacing]);

  // Measure text length accurately in DOM
  useEffect(() => {
    if (measureRef.current) {
      const len = measureRef.current.getComputedTextLength();
      if (len > 0) setSpacing(len);
    }
  }, [text]);

  // Continuous animation loop
  useEffect(() => {
    if (!spacing) return;

    const dirMultiplier = direction === 'left' ? -1 : 1;

    const loop = () => {
      if (!dragRef.current) {
        // Friction decay on drag momentum
        velRef.current *= 0.94;
        offsetRef.current += (speed * dirMultiplier) + velRef.current;
      }

      // Seamless modulo wrap
      if (spacing > 0) {
        if (offsetRef.current < -spacing) {
          offsetRef.current += spacing;
        } else if (offsetRef.current > 0) {
          offsetRef.current -= spacing;
        }
      }

      if (textPathRef.current) {
        textPathRef.current.setAttribute('startOffset', `${offsetRef.current}px`);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [spacing, speed, direction]);

  // Pointer drag interactions
  const handlePointerDown = (e) => {
    if (!interactive) return;
    dragRef.current = true;
    lastXRef.current = e.clientX;
    velRef.current = 0;
    if (svgRef.current) svgRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current || !interactive) return;
    const delta = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    offsetRef.current += delta;
    velRef.current = delta * 0.8;
  };

  const handlePointerUp = (e) => {
    if (!interactive) return;
    dragRef.current = false;
    if (svgRef.current) {
      try {
        svgRef.current.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <div className={`curved-loop-container ${className}`}>
      {/* Background glow ambiance */}
      <div className="curved-loop-glow" />

      <svg
        ref={svgRef}
        viewBox="0 0 1600 180"
        className="curved-loop-svg"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ cursor: interactive ? 'grab' : 'default' }}
      >
        <defs>
          {/* Main animated text trajectory curve */}
          <path id={pathId} d={pathD} fill="none" />

          {/* Neon gradient for the subtle circuit guide line */}
          <linearGradient id={`grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0" />
            <stop offset="25%" stopColor="#00f0ff" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.65" />
            <stop offset="75%" stopColor="#00f0ff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </linearGradient>

          {/* Glow filter for energy pulses */}
          <filter id={`neon-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Hidden measurement probe */}
        <text
          ref={measureRef}
          className="curved-loop-probe"
          aria-hidden="true"
        >
          {text}
        </text>

        {/* Futuristic circuit guide track underneath */}
        <path
          d={pathD}
          fill="none"
          stroke={`url(#grad-${uid})`}
          strokeWidth="1.6"
          strokeDasharray="8 12"
          className="curved-circuit-track"
        />

        {/* Animated Flowing Text */}
        <text className="curved-loop-text">
          <textPath
            ref={textPathRef}
            href={`#${pathId}`}
            startOffset="0px"
          >
            {totalText}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
