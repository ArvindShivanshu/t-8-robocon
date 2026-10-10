import React, { useRef, useEffect } from 'react';
import './TextLoop.css';

const defaultRow1 = [
  { tag: 'TOPOLOGY', label: '4-WHEEL 45° HOLONOMIC OMNI' },
  { tag: 'ODOMETRY', label: '1024 CPR OPTICAL QUADRATURE' },
  { tag: 'FILTER', label: '100 HZ EXTENDED KALMAN FILTER (EKF)' },
  { tag: 'PAYLOAD', label: '5.00 KG HIGH-STOWAGE BIN' },
  { tag: 'AGILITY', label: '0.00 MM TURNING RADIUS' },
  { tag: 'TELEMETRY', label: 'CONTINUOUS (X, Y, θ) POSE' },
];

const defaultRow2 = [
  { tag: 'POWER', label: '14.8V 4S LIPO 4200 MAH' },
  { tag: 'LINEAR SPEED', label: '1.45 M/S (5.22 KM/H)' },
  { tag: 'YAW VELOCITY', label: '3.14 RAD/S (180°/SEC)' },
  { tag: 'DRIVE MOTORS', label: '4X PLANETARY GEARED (30:1)' },
  { tag: 'CHASSIS', label: '260 × 260 MM TITANIUM-ALUMINUM' },
  { tag: 'COMMUNICATION', label: '2.4 GHZ LOW-LATENCY WIRELESS' },
];

export default function TextLoop({
  row1 = defaultRow1,
  row2 = defaultRow2,
  speed = 1.0,
}) {
  const track1Ref = useRef(null);
  const track2Ref = useRef(null);
  const lastScrollY = useRef(0);
  const scrollVelocity = useRef(0);
  const animFrame = useRef(null);

  const pos1 = useRef(0);
  const pos2 = useRef(0);

  useEffect(() => {
    let lastTime = performance.now();

    const handleScroll = () => {
      const currentY = window.scrollY;
      const deltaY = Math.abs(currentY - lastScrollY.current);
      lastScrollY.current = currentY;
      // Add velocity boost on scroll
      scrollVelocity.current = Math.min(scrollVelocity.current + deltaY * 0.12, 12);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const animate = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Decay scroll velocity smoothly back to baseline
      scrollVelocity.current *= 0.94;
      const currentSpeed = speed + scrollVelocity.current;

      pos1.current -= currentSpeed * 40 * dt;
      pos2.current += currentSpeed * 40 * dt;

      if (track1Ref.current) {
        track1Ref.current.style.transform = `translate3d(${pos1.current % 1200}px, 0, 0)`;
      }
      if (track2Ref.current) {
        track2Ref.current.style.transform = `translate3d(${pos2.current % 1200}px, 0, 0)`;
      }

      animFrame.current = requestAnimationFrame(animate);
    };

    animFrame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [speed]);

  return (
    <div className="text-loop-section-root">
      {/* Top Track (Moves Left) */}
      <div className="loop-track-wrapper">
        <div ref={track1Ref} className="loop-track-inner">
          {[...row1, ...row1, ...row1, ...row1].map((item, idx) => (
            <div key={`r1-${idx}`} className="loop-pill-card">
              <span className="loop-tag-badge mono">{item.tag}</span>
              <span className="loop-item-label mono">{item.label}</span>
              <span className="loop-dot-sep" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Track (Moves Right) */}
      <div className="loop-track-wrapper reverse">
        <div ref={track2Ref} className="loop-track-inner">
          {[...row2, ...row2, ...row2, ...row2].map((item, idx) => (
            <div key={`r2-${idx}`} className="loop-pill-card accent">
              <span className="loop-tag-badge mono">{item.tag}</span>
              <span className="loop-item-label mono">{item.label}</span>
              <span className="loop-dot-sep" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
