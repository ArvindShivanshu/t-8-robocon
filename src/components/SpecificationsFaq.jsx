import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Gauge, 
  Cpu, 
  Compass, 
  Weight 
} from 'lucide-react';
import './SpecificationsFaq.css';

export default function SpecificationsFaq() {
  const [openFaq, setOpenFaq] = useState(0);

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

  const faqs = [
    {
      q: 'How does the platform eliminate wheel slip errors during dead-reckoning odometry?',
      a: 'In omnidirectional platforms, wheel rollers can experience micro-slip during abrupt diagonal accelerations. Our system uses a 100Hz Extended Kalman Filter (EKF) that fuses high-speed quadrature encoder pulses with an onboard 6-axis IMU gyroscope. When encoder derivative data deviates from inertial angular rates, the EKF rejects erroneous encoder ticks and relies on gyroscope integration, bounding coordinate drift to under 1.8% over long translation runs.'
    },
    {
      q: 'Why was a 4-wheel 45° omnidirectional configuration chosen over Mecanum or differential drive?',
      a: 'Restricted warehouse corridors require instantaneous translation in any direction without turning radius (R_turn = 0). A differential drive requires pivoting before translating laterally, risking collisions in narrow aisles. Mecanum drives exhibit uneven roller contact and higher friction wear. The 4-wheel 45° omni drive provides symmetric thrust vectors along all 360° directions, providing balanced surge, sway, and yaw control authority.'
    },
    {
      q: 'How is structural stability maintained when carrying the maximum 5 kg manual payload?',
      a: 'The payload cargo bin is elevated on four 60mm cylindrical risers bolted directly to the chassis cross-members, transferring the load symmetrically to all four motor mounts. Heavy electrical components (14.8V battery, motor drivers, and microcontroller PCB) are mounted on the lower wooden baseplate, maintaining a low overall center of gravity that prevents tipping during emergency braking.'
    },
    {
      q: 'How does the continuous (X, Y, θ) coordinate feedback fulfill the operator demand?',
      a: 'Problem Statement 8 explicitly demands that the operator has the x, y coordinates as well as the angle displayed at all times. Our embedded firmware packages the fused pose (X in mm, Y in mm, θ in degrees) into a prioritized telemetry packet streamed over a 2.4 GHz low-latency wireless protocol. This feeds both the physical handheld pendant display and the web-based digital twin HUD simultaneously at 100 Hz.'
    }
  ];

  return (
    <section className="specs-section-root" id="team">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <span className="dot"></span>
            <span>SYSTEM SPECIFICATIONS & ENGINEERING ROSTER</span>
          </div>
          <h2 className="section-title">Specifications & Engineering Clarifications</h2>
          <p className="section-subtitle">
            Comprehensive parameters and engineering justifications addressing warehouse navigation, 
            load carrying, and odometry estimation.
          </p>
        </div>

        {/* Specs Matrix */}
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

        {/* Technical FAQ */}
        <div className="faq-wrapper" id="faq">
          <div className="faq-header">
            <HelpCircle size={20} className="faq-icon" />
            <h3 className="faq-title">Technical FAQ & Design Rationale</h3>
          </div>

          <div className="faq-accordion">
            {faqs.map((f, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className={`faq-item glass-card ${isOpen ? 'open' : ''}`}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <div className="faq-question-row">
                    <span className="faq-q-text">{f.q}</span>
                    <ChevronDown size={18} className={`faq-chevron ${isOpen ? 'rotated' : ''}`} />
                  </div>
                  {isOpen && (
                    <div className="faq-answer-block">
                      <p className="faq-answer-text">{f.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
