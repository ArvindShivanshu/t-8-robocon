import React, { useState } from 'react';
import { 
  Wrench, 
  Cpu, 
  Zap, 
  Radio, 
  CheckCircle2, 
} from 'lucide-react';
import './SubsystemsSection.css';

export default function SubsystemsSection() {
  const [activeTab, setActiveTab] = useState('mechanical');

  const subsystems = {
    mechanical: {
      id: 'mechanical',
      title: 'Mechanical Kinematics & Structure',
      tag: 'MECHANICAL ARCHITECTURE',
      icon: <Wrench size={20} />,
      lead: 'Custom precision aluminum alloy chassis designed for 45° holonomic omni mobility and 5kg cargo containment.',
      features: [
        {
          name: '45° Omni-Wheel Geometry',
          desc: 'Symmetric 45° wheel vectors deliver equal translation authority across surge and sway axes.'
        },
        {
          name: '5kg Payload Cargo Bin & Risers',
          desc: 'High-strength aluminum tray supported by 4 cylindrical standoffs, optimizing vertical load distribution.'
        },
        {
          name: 'Chamfered Enclosure',
          desc: 'Beveled 260×260mm corners prevent collision hazards when maneuvering through restricted warehouse passageways.'
        },
        {
          name: 'Dual-Row Barrel Rollers',
          desc: '20 rubber-coated rollers per wheel ring eliminate lateral scrub during high-speed diagonal transitions.'
        }
      ]
    },
    embedded: {
      id: 'embedded',
      title: 'Embedded Firmware & Sensor Fusion',
      tag: 'EMBEDDED CONTROL',
      icon: <Cpu size={20} />,
      lead: 'Sub-millimeter dead-reckoning position tracking powered by 32-bit hardware timers and inertial integration.',
      features: [
        {
          name: '100Hz Extended Kalman Filter (EKF)',
          desc: 'Fuses optical encoder delta pulses with 6-axis IMU gyro rates to cancel wheel slip drift and heading bias.'
        },
        {
          name: 'Hardware Quadrature Timers',
          desc: 'Microsecond encoder capture prevents missed pulses during high acceleration, preserving absolute origin integrity.'
        },
        {
          name: 'PID Velocity Controller',
          desc: 'Independent closed-loop PID control on all 4 wheel drives with feedforward friction compensation.'
        },
        {
          name: 'Real-Time Pose Broadcasting',
          desc: 'Streams X, Y coordinates and θ orientation at 100 Hz to fulfill continuous operator display requirements.'
        }
      ]
    },
    actuation: {
      id: 'actuation',
      title: 'Actuation & Power Electronics',
      tag: 'ACTUATION & POWER',
      icon: <Zap size={20} />,
      lead: 'High-torque planetary geared drivetrains backed by synchronous MOSFET H-bridges and regulated power rails.',
      features: [
        {
          name: 'Planetary Geared DC Motors',
          desc: 'Metal-gear 30:1 reduction delivers 28 kg-cm stall torque per motor under full 5 kg load.'
        },
        {
          name: 'Dual High-Current H-Bridges',
          desc: 'MOSFET drivers with active regenerative braking, thermal throttling, and fast current-sensing feedback.'
        },
        {
          name: 'Isolated DC-DC Regulators',
          desc: 'Independent electrical rails for MCU logic (3.3V), sensor bus (5V), and motors (14.8V) preventing noise.'
        },
        {
          name: 'Smart Battery Monitoring',
          desc: 'Real-time cell voltage and current telemetry with low-voltage cutoff protection.'
        }
      ]
    },
    telemetry: {
      id: 'telemetry',
      title: 'Tactical HMI & Telemetry Link',
      tag: 'WIRELESS TELEMETRY',
      icon: <Radio size={20} />,
      lead: 'Industrial wireless control pendant and digital twin interface delivering zero-latency coordinate HUD.',
      features: [
        {
          name: 'Precision Dual Thumbstick Pendant',
          desc: 'Hall-effect analog gimbals allow fine millimeter translation control in restricted warehouse aisles.'
        },
        {
          name: '2.4GHz Low-Latency Link',
          desc: 'Frequency-hopping wireless protocol ensuring sub-15ms packet latency even under warehouse interference.'
        },
        {
          name: 'Always-On Coordinate Display',
          desc: 'Visual readouts of X, Y displacement and heading angle θ displayed on pendant OLED and digital twin HUD.'
        },
        {
          name: 'Single-Touch Datum Calibration',
          desc: 'Instant origin zeroing and odometer tare at pallet loading bays with dedicated datum module.'
        }
      ]
    }
  };

  const current = subsystems[activeTab];

  return (
    <section className="subsystems-section-root" id="subsystems">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">Hardware & Firmware Architecture</h2>
          <p className="section-subtitle">
            Modular engineering divisions powering the Mark-VIII autonomous platform.
          </p>
        </div>

        {/* Division Tabs */}
        <div className="subsystem-tabs-row">
          {Object.keys(subsystems).map((key) => {
            const sub = subsystems[key];
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`subsystem-tab-btn ${isActive ? 'active' : ''}`}
                id={`tab-${key}`}
              >
                <div className="tab-icon">{sub.icon}</div>
                <div className="tab-meta">
                  <span className="tab-tag mono">{sub.tag}</span>
                  <span className="tab-name">{sub.title}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Subsystem Details Card */}
        <div className="glass-card subsystem-detail-card">
          <div className="detail-header-block">
            <span className="detail-tag mono">{current.tag}</span>
            <h3 className="detail-title">{current.title}</h3>
            <p className="detail-lead">{current.lead}</p>
          </div>

          {/* Clean 2x2 Feature Grid */}
          <div className="features-grid-2x2">
            {current.features.map((f, idx) => (
              <div key={idx} className="feature-item-card">
                <div className="feature-item-header">
                  <div className="feature-check"><CheckCircle2 size={15} /></div>
                  <h4 className="feature-item-name">{f.name}</h4>
                </div>
                <p className="feature-item-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
