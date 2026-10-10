import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import './ScrollVelocity.css';

function VelocityRow({ 
  text, 
  baseVelocity = 25, 
  direction = 1, 
  isOutline = false 
}) {
  const containerRef = useRef(null);
  const blockRef = useRef(null);
  const [blockWidth, setBlockWidth] = useState(0);
  const [numCopies, setNumCopies] = useState(4);

  const xPosRef = useRef(0);
  const velocityRef = useRef(baseVelocity);
  const lastScrollYRef = useRef(0);
  const animFrameRef = useRef(null);

  // Measure single text block width to compute perfect seamless repetition
  useLayoutEffect(() => {
    const updateSize = () => {
      if (blockRef.current && containerRef.current) {
        const singleW = blockRef.current.offsetWidth;
        if (singleW > 0) {
          setBlockWidth(singleW);
          const screenW = containerRef.current.offsetWidth || window.innerWidth;
          // Calculate how many copies needed to fill screen plus buffer
          const needed = Math.max(4, Math.ceil((screenW * 2) / singleW) + 2);
          setNumCopies(needed);
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [text]);

  // Velocity tracking & smooth kinetic scroll reaction
  useEffect(() => {
    let lastTime = performance.now();

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = Math.abs(currentScrollY - lastScrollYRef.current);
      lastScrollYRef.current = currentScrollY;

      // Add dynamic acceleration boost proportional to scroll velocity
      const boost = Math.min(delta * 1.5, 120);
      velocityRef.current = (baseVelocity + boost) * direction;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Smoothly damp velocity back to target base velocity
      const targetVel = baseVelocity * direction;
      velocityRef.current += (targetVel - velocityRef.current) * 0.08;

      xPosRef.current += velocityRef.current * dt;

      // Modulo wrap once we've traveled one complete text block width
      if (blockWidth > 0) {
        if (xPosRef.current <= -blockWidth) {
          xPosRef.current += blockWidth;
        } else if (xPosRef.current >= 0) {
          xPosRef.current -= blockWidth;
        }
      }

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${xPosRef.current}px, 0, 0)`;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [baseVelocity, direction, blockWidth]);

  return (
    <div className={`velocity-row-wrapper ${isOutline ? 'outline-style' : 'solid-style'}`}>
      <div ref={containerRef} className="velocity-track">
        {/* Render copies for continuous seamless flow */}
        {Array.from({ length: numCopies }).map((_, i) => (
          <span 
            key={i} 
            ref={i === 0 ? blockRef : null} 
            className="velocity-text-block"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ScrollVelocity({
  texts = [
    'HOLONOMIC 45° OMNI-DRIVE • 360° TRANSLATION • 5KG LOAD TWIN •',
    '100HZ SENSOR FUSION • ZERO TURNING RADIUS • DIGITAL TWIN HUD •'
  ],
  velocity = 35,
  className = ''
}) {
  return (
    <section className={`scroll-velocity-root ${className}`}>
      {/* Top ambient hairline */}
      <div className="velocity-hairline top" />

      {/* Row 1: Solid Typography Moving Left */}
      <VelocityRow
        text={texts[0]}
        baseVelocity={velocity}
        direction={-1}
        isOutline={false}
      />

      {/* Row 2: Outline Ghost Typography Moving Right */}
      <VelocityRow
        text={texts[1] || texts[0]}
        baseVelocity={velocity * 0.9}
        direction={1}
        isOutline={true}
      />

      {/* Bottom ambient hairline */}
      <div className="velocity-hairline bottom" />
    </section>
  );
}
