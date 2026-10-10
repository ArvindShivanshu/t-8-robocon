import React, { useState } from 'react';
import { 
  Wrench, 
  Cpu, 
  Zap, 
  Radio, 
  CheckCircle2, 
  ChevronRight,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import './SubsystemsSection.css';

export default function SubsystemsSection() {
  const [activeTab, setActiveTab] = useState('mechanical');

  const subsystems = {
    mechanical: {
      id: 'mechanical',
      title: 'Mechanical Kinematics & Structure',
      tag: 'DIVISION // STARK MECHANICS',
      icon: <Wrench size={22} />,
      lead: 'Custom fabricated lightweight titanium-aluminum alloy chassis designed for 4-wheel 45° holonomic omni mobility and 5kg cargo containment.',
      features: [
        {
          name: '45° Omni-Wheel Geometry',
          desc: 'Four double-row omnidirectional wheels mounted symmetrically at 45° to provide equal translation authority in both surge and sway axes.'
        },
        {
          name: '5kg Payload Cargo Bin & Risers',
          desc: 'High-strength aluminum containment tray supported by 4 precision cylindrical standoffs, optimizing vertical load distribution.'
        },
        {
          name: 'Chamfered Footprint Enclosure',
          desc: 'Beveled corners reduce collision hazards when maneuvering through restricted warehouse passageways and pallet racks.'
        },
        {
          name: 'Dual-Row Barrel Rollers',
          desc: '10 rubber-coated rollers per wheel ring eliminate lateral wheel scrub and provide continuous contact during high-speed transitions.'
        }
      ],
      specs: [
        { key: 'Chassis Dimensions', val: '260 mm x 260 mm x 175 mm' },
        { key: 'Chassis Mass', val: '3.2 kg (Dry) / 8.2 kg (Loaded)' },
        { key: 'Wheel Diameter', val: '64 mm (Double-Row Omni)' },
        { key: 'Payload Bin Volume', val: '230 x 250 x 55 mm' },
      ]
    },
    embedded: {
      id: 'embedded',
      title: 'Embedded Firmware & Odometry Fusion',
      tag: 'DIVISION // JARVIS EMBEDDED',
      icon: <Cpu size={22} />,
      lead: 'High-speed deterministic control loop running on 32-bit hardware timers for sub-millimeter dead-reckoning position tracking.',
      features: [
        {
          name: '100Hz Extended Kalman Filter (EKF)',
          desc: 'Fuses high-frequency optical encoder delta pulses with 6-axis IMU gyro rates to cancel wheel slip drift and heading bias.'
        },
        {
          name: 'Hardware Quadrature Timers',
          desc: 'Direct microsecond encoder capture prevents missed pulses during high acceleration, preserving absolute origin integrity.'
        },
        {
          name: 'PID Velocity Trajectory Controller',
          desc: 'Independent closed-loop PID controllers on all 4 wheel drives with feedforward friction compensation.'
        },
        {
          name: 'Real-Time Pose Broadcasting',
          desc: 'Streams X, Y coordinates and θ orientation at 100 Hz to fulfill the operator mandate for continuous display.'
        }
      ],
      specs: [
        { key: 'Microcontroller', val: 'STM32F4 / ESP32-S3 Dual-Core' },
        { key: 'Control Loop Rate', val: '100 Hz (10 ms period)' },
        { key: 'Encoder Resolution', val: '1024 CPR Optical Quad' },
        { key: 'IMU Sensor', val: '6-DoF 16-bit Gyro + Accelerometer' },
      ]
    },
    actuation: {
      id: 'actuation',
      title: 'Actuation & Arc Power Electronics',
      tag: 'DIVISION // ARC POWER',
      icon: <Zap size={22} />,
      lead: 'High-torque planetary geared drivetrains backed by synchronous MOSFET H-bridges and regulated lithium power rails.',
      features: [
        {
          name: 'High-Torque Planetary Geared Motors',
          desc: 'Metal-gear reduction delivers 28 kg-cm stall torque per motor, providing ample acceleration headroom under full 5 kg load.'
        },
        {
          name: 'Dual High-Current H-Bridges',
          desc: 'MOSFET drivers with active regenerative braking, thermal throttling, and fast current-sensing feedback.'
        },
        {
          name: 'Isolated DC-DC Buck Regulators',
          desc: 'Independent electrical rails for MCU logic (3.3V), sensor bus (5V), and motor power (14.8V) preventing electrical noise.'
        },
        {
          name: 'Smart Battery Monitoring',
          desc: 'Real-time cell voltage and current telemetry with low-voltage cutoff protection.'
        }
      ],
      specs: [
        { key: 'Operating Voltage', val: '14.8V (4S LiPo 4200 mAh)' },
        { key: 'Peak Motor Current', val: '8.5A per channel' },
        { key: 'Gear Reduction', val: '30:1 All-Steel Planetary' },
        { key: 'Continuous Run Time', val: '45+ minutes nominal' },
      ]
    },
    telemetry: {
      id: 'telemetry',
      title: 'JARVIS Tactical HMI & Telemetry',
      tag: 'DIVISION // TACTICAL TELEMETRY',
      icon: <Radio size={22} />,
      lead: 'Industrial wireless control pendant and digital twin interface delivering responsive control and zero-latency coordinate HUD.',
      features: [
        {
          name: 'Precision Dual Thumbstick Pendant',
          desc: 'Hall-effect analog gimbals allow fine millimeter translation control in restricted warehouse spaces.'
        },
        {
          name: '2.4GHz Ultra-Low Latency Link',
          desc: 'Proprietary frequency-hopping protocol ensuring sub-15ms packet latency even with warehouse radio interference.'
        },
        {
          name: 'Always-On Coordinate Display',
          desc: 'Instant visual readouts of X, Y displacement and heading angle θ displayed on both pendant OLED and web telemetry.'
        },
        {
          name: 'Single-Touch Datum Calibration',
          desc: 'Instant origin zeroing and odometer reset at pallet loading bays.'
        }
      ],
      specs: [
        { key: 'Radio Frequency', val: '2.4 GHz NRF24L01+ / Wi-Fi' },
        { key: 'Telemetry Latency', val: '< 15 ms End-to-End' },
        { key: 'Operating Range', val: '50+ meters in-warehouse' },
        { key: 'Encryption', val: 'AES-128 Frame Verification' },
      ]
    }
  };

  const current = subsystems[activeTab];

  return (
    <section className="subsystems-section-root" id="subsystems">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <span className="dot"></span>
            <span>STARK AVIONICS & MECHANICS // PROTOCOL</span>
          </div>
          <h2 className="section-title">Subsystems & Armor Divisions</h2>
          <p className="section-subtitle">
            Multidisciplinary engineering breakdown spanning mechanical kinematics, 
            embedded dead-reckoning odometry, Arc power distribution, and JARVIS telemetry.
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
            <div className="detail-badge-group">
              <span className="detail-tag mono">{current.tag}</span>
              <span className="detail-status mono">VERIFIED CAD & PROTO</span>
            </div>
            <h3 className="detail-title">{current.title}</h3>
            <p className="detail-lead">{current.lead}</p>
          </div>

          <div className="detail-content-grid">
            {/* Features */}
            <div className="detail-features-column">
              <span className="features-col-title mono">// ARCHITECTURAL SPECIFICATIONS</span>
              <div className="features-list">
                {current.features.map((f, idx) => (
                  <div key={idx} className="feature-item-row">
                    <div className="feature-check"><CheckCircle2 size={16} /></div>
                    <div className="feature-item-body">
                      <h4 className="feature-item-name">{f.name}</h4>
                      <p className="feature-item-desc">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specs List */}
            <div className="detail-specs-column">
              <span className="specs-col-title mono">// BENCHMARK PARAMETERS</span>
              <div className="specs-data-card">
                {current.specs.map((s, idx) => (
                  <div key={idx} className="spec-data-row">
                    <span className="spec-data-key mono">{s.key}</span>
                    <span className="spec-data-val mono">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
