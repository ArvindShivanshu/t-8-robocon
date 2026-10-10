import React from 'react';
import './TechDivider.css';

export default function TechDivider({ label = 'STARK ARCHITECTURE // PS-08' }) {
  return (
    <div className="tech-divider-root">
      <div className="tech-divider-line" />
      <div className="tech-divider-badge mono">
        <span className="tech-divider-dot" />
        <span>{label}</span>
      </div>
      <div className="tech-divider-line" />
    </div>
  );
}
