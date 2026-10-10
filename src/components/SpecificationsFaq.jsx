import React from 'react';
import './SpecificationsFaq.css';

export default function SpecificationsFaq() {
  const specsMatrix = [
    { category: 'Physical & Structural', items: [
      { param: 'Chassis Dimensions', value: '260 mm (L) x 260 mm (W) x 175 mm (H)' },
      { param: 'Dry Platform Mass', value: '3.25 kg' },
      { param: 'Rated Manual Payload', value: '5.00 kg (Full Capacity)' },
      { param: 'Maximum Loaded Mass', value: '8.25 kg' },
      { param: 'Cargo Bin Interior', value: '230 mm x 250 mm x 55 mm' },
      { param: 'Riser Standoff Height', value: '60 mm (4x Cylindrical Columns)' },
    ]},
    { category: 'Drivetrain & Kinematics', items: [
      { param: 'Kinematic Topology', value: '4-Wheel 45° Holonomic Omni-Drive' },
      { param: 'Wheel Diameter', value: '64 mm (Double-Row Omni)' },
      { param: 'Roller Count per Wheel', value: '20 Rubber Barrel Rollers (2x Rows of 10)' },
      { param: 'Drive Motors', value: '4x Planetary Geared DC Motors (30:1)' },
      { param: 'Maximum Linear Speed', value: '1.45 m/s (5.22 km/h)' },
      { param: 'Maximum Yaw Velocity', value: '3.14 rad/s (180°/sec in-place)' },
      { param: 'Turning Radius', value: '0.00 mm (Instant Holonomic)' },
    ]},
    { category: 'Odometry & Telemetry', items: [
      { param: 'Wheel Encoders', value: '1024 CPR Optical Quadrature' },
      { param: 'IMU Sensor', value: '6-DoF Gyroscope + Accelerometer' },
      { param: 'Pose Update Frequency', value: '100 Hz (10 ms cycle)' },
      { param: 'Odometry Drift Margin', value: '< 1.8% per 10m traveled (EKF Fused)' },
      { param: 'Operator HUD Display', value: 'Persistent (X, Y, θ) Coordinates' },
      { param: 'Telemetry Link', value: '2.4 GHz Low-Latency (< 15 ms)' },
    ]},
    { category: 'Electrical & Power', items: [
      { param: 'Battery Pack', value: '14.8V 4S LiPo 4200 mAh' },
      { param: 'Motor Drivers', value: 'Dual High-Current MOSFET H-Bridges' },
      { param: 'Microcontroller', value: '32-Bit ARM Cortex-M4 / ESP32-S3' },
      { param: 'Operational Runtime', value: '45+ Minutes Under Full 5kg Load' },
    ]}
  ];

  return (
    <section className="specs-section-root" id="specs">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">Technical Specifications</h2>
          <p className="section-subtitle">
            Core dimensions, drivetrain kinematics, sensor telemetry, and power electronics matrix.
          </p>
        </div>

        {/* Specs Matrix - All 4 Cards in One Row */}
        <div className="specs-matrix-grid">
          {specsMatrix.map((cat, idx) => (
            <div key={idx} className="specs-cat-card glass-card">
              <div className="specs-cat-header">
                <span className="specs-cat-title mono">// {cat.category.toUpperCase()}</span>
              </div>
              <div className="specs-rows-list">
                {cat.items.map((it, itemIdx) => (
                  <div key={itemIdx} className="specs-row-item">
                    <span className="spec-param-name">{it.param}</span>
                    <span className="spec-param-val mono">{it.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
