import React from 'react';
import './MandatesSection.css';

export default function MandatesSection() {
  const mandates = [
    {
      num: '01',
      title: '360° Holonomic Agility',
      lead: 'Instantaneous lateral strafe and 0-radius rotation inside restricted warehouse aisles.',
      metricLabel: 'Turning Radius',
      metricVal: '0.00 mm',
      category: 'Kinematics'
    },
    {
      num: '02',
      title: '15.0 kg Payload Capacity',
      lead: 'Elevated cargo containment bin on 4 vertical risers with low center of gravity.',
      metricLabel: 'Rated Load',
      metricVal: '15.0 kg (150 N)',
      category: 'Structure'
    },
    {
      num: '03',
      title: 'Dead-Reckoning Fusion',
      lead: '1024 CPR quadrature encoders fused with 6-axis IMU gyroscope via 100Hz EKF.',
      metricLabel: 'Odometry Drift',
      metricVal: '< 1.8% / 10m',
      category: 'Odometry'
    },
    {
      num: '04',
      title: 'Live Coordinate HUD',
      lead: 'Continuous real-time (X, Y, θ) pose telemetry streamed at 100 Hz to operator display.',
      metricLabel: 'Refresh Rate',
      metricVal: '100 Hz Stream',
      category: 'Telemetry'
    },
  ];

  return (
    <section className="mandates-section-root" id="mandates">
      <div className="container">
        {/* Streamlined Header */}
        <div className="mandates-header-row">
          <h2 className="mandates-heading">Core System Directives</h2>
          <p className="mandates-subhead">
            Operational mandates engineered directly into the Mark-VIII architecture.
          </p>
        </div>

        {/* Minimalist 4-Column Grid */}
        <div className="mandates-clean-grid">
          {mandates.map((m) => (
            <div key={m.num} className="mandate-clean-col">
              <div className="mandate-col-top">
                <span className="mandate-num mono">{m.num}</span>
                <span className="mandate-cat mono">{m.category}</span>
              </div>
              <h3 className="mandate-col-title">{m.title}</h3>
              <p className="mandate-col-desc">{m.lead}</p>
              <div className="mandate-col-metric">
                <span className="metric-label mono">{m.metricLabel}</span>
                <span className="metric-val mono">{m.metricVal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
