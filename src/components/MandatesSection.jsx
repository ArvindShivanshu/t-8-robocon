import React from 'react';
import './MandatesSection.css';

export default function MandatesSection() {
  const mandates = [
    {
      num: '01',
      title: 'Restricted Workspace Agility',
      lead: '4-Wheel 45° holonomic omni-drive configuration enabling instantaneous lateral strafe, 45° diagonals, and 0-radius in-place rotation inside narrow aisles.',
      metricLabel: 'Turning Radius',
      metricVal: '0.00 mm (Holonomic)',
      category: 'Kinematics'
    },
    {
      num: '02',
      title: '5.0 kg Manual Payload Capacity',
      lead: 'Elevated cargo containment bin mounted upon 4 vertical cylindrical load-bearing risers, lowering dynamic chassis deflection and stabilizing acceleration.',
      metricLabel: 'Payload Rating',
      metricVal: '5.0 kg (50 N Load)',
      category: 'Structure'
    },
    {
      num: '03',
      title: 'Dependable Dead-Reckoning',
      lead: 'Continuous tracking of distance travelled and relative position via sensor fusion combining high-resolution 1024 CPR wheel encoders with a 6-axis IMU gyro.',
      metricLabel: 'Drift Mitigation',
      metricVal: 'EKF Sensor Fusion',
      category: 'Odometry'
    },
    {
      num: '04',
      title: 'Continuous Coordinate HUD',
      lead: 'Mandatory operator teleoperation requirement: continuous (X, Y, θ) coordinate pose streaming at 100 Hz to both physical handheld pendant and web telemetry.',
      metricLabel: 'Refresh Rate',
      metricVal: '100 Hz Streaming',
      category: 'Telemetry'
    },
  ];

  return (
    <section className="mandates-section-root" id="mandates">
      <div className="container">
        {/* Terafab-Style Editorial Statement */}
        <div className="statement-block">
          <p className="statement-kicker mono">// PROBLEM STATEMENT 08 SPECIFICATION</p>
          <blockquote className="statement-quote">
            “A warehouse operator controls a mobile platform which can carry up to <strong>5kgs</strong> manually 
            inside a restricted workspace where movement in several directions is useful. The platform should be able to 
            <strong> translate and reposition itself while keeping track of how far it has travelled and where it believes it is relative to its starting point</strong>. 
            The operator demands the x, y coordinates as well as the angle of the mobile platform to be displayed at all times.”
          </blockquote>
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
