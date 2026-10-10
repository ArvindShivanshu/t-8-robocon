import React from 'react';
import { 
  Move, 
  Weight, 
  Compass, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Crosshair,
  Zap
} from 'lucide-react';
import './MandatesSection.css';

export default function MandatesSection() {
  const mandates = [
    {
      id: '01',
      title: 'Restricted Workspace Agility',
      icon: <Move size={24} />,
      tag: 'HOLONOMIC MOBILITY',
      requirement: 'Movement in several directions is essential inside confined warehouse aisles where traditional steering cannot maneuver.',
      solution: '4-Wheel 45° omnidirectional wheel configuration enabling instantaneous lateral strafe, 45° diagonals, and 0-radius in-place rotation.',
      specs: [
        { label: 'Turning Radius', val: '0.00 mm (In-Place)' },
        { label: 'Degrees of Freedom', val: '3 DoF (X, Y, Yaw)' },
      ],
      color: 'crimson'
    },
    {
      id: '02',
      title: '5.0 kg Manual Payload Capacity',
      icon: <Weight size={24} />,
      tag: 'ARMOR STRUCTURAL STABILITY',
      requirement: 'Must safely carry up to 5 kg of industrial payload while preserving acceleration, balance, and motor torque headroom.',
      solution: 'Elevated cargo containment bin mounted upon 4 vertical cylindrical load-bearing risers, lowering dynamic chassis deflection.',
      specs: [
        { label: 'Rated Payload', val: '5.0 kg (50 N load)' },
        { label: 'Safety Factor', val: '2.4x Dynamic Load' },
      ],
      color: 'gold'
    },
    {
      id: '03',
      title: 'Dependable Dead-Reckoning Odometry',
      icon: <Compass size={24} />,
      tag: 'LOCAL POSITION ESTIMATION',
      requirement: 'Must track distance travelled and maintain an accurate estimate of position relative to starting datum point (0, 0, 0°).',
      solution: 'Dual-sensor fusion integrating high-resolution optical wheel encoders with 6-DoF IMU gyroscope dead-reckoning equations.',
      specs: [
        { label: 'Encoder Resolution', val: '1024 CPR Optical' },
        { label: 'Drift Mitigation', val: 'EKF / Complementary' },
      ],
      color: 'cyan'
    },
    {
      id: '04',
      title: 'Continuous Coordinate HUD Display',
      icon: <Activity size={24} />,
      tag: 'JARVIS TACTICAL TELEMETRY',
      requirement: 'The operator demands the x, y coordinates as well as the angle of the mobile platform to be displayed at all times.',
      solution: 'Dedicated high-refresh telemetry stream broadcasting continuous pose (X, Y, θ) to persistent handheld HMI and digital twin HUD.',
      specs: [
        { label: 'Stream Frequency', val: '100 Hz Streaming' },
        { label: 'Telemetry Latency', val: '< 15 ms Response' },
      ],
      color: 'crimson'
    },
  ];

  return (
    <section className="mandates-section-root" id="mandates">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <span className="dot"></span>
            <span>AVENGERS INITIATIVE // MANDATE 08</span>
          </div>
          <h2 className="section-title">Mission Parameters & Directives</h2>
          <p className="section-subtitle">
            Engineering specifications derived from Problem Statement 8 for warehouse agile teleoperation, 
            45° omni-kinematics, and continuous JARVIS coordinate telemetry.
          </p>
        </div>

        {/* Problem Statement Box Quote */}
        <div className="problem-quote-card">
          <div className="quote-header">
            <div className="quote-badge mono">
              <ShieldAlert size={15} />
              <span>STARK INDUSTRIES DIRECTIVE // PROBLEM STATEMENT #8</span>
            </div>
            <span className="quote-ref mono">ROBOCON DESIGN BENCHMARK</span>
          </div>
          <p className="quote-text">
            “A warehouse operator controls a mobile platform which can carry up to <strong>5kgs</strong> manually 
            inside a restricted workspace where movement in several directions is useful. The platform should be able to 
            <strong> translate and reposition itself while keeping track of how far it has travelled and where it believes it is relative to its starting point</strong>. 
            The challenge is to combine intuitive manual control with dependable motion and position estimation. 
            <strong> The operator demands the x, y coordinates as well as the angle of the mobile platform to be displayed at all times.</strong>”
          </p>
        </div>

        {/* Mandate Grid */}
        <div className="mandates-grid">
          {mandates.map((m) => (
            <div key={m.id} className={`glass-card mandate-card color-${m.color}`}>
              <div className="mandate-card-header">
                <div className="mandate-icon-box">
                  {m.icon}
                </div>
                <div className="mandate-header-meta">
                  <span className="mandate-id mono">MANDATE // {m.id}</span>
                  <span className="mandate-tag mono">{m.tag}</span>
                </div>
              </div>

              <h3 className="mandate-card-title">{m.title}</h3>

              <div className="mandate-body">
                <div className="mandate-block">
                  <span className="mandate-block-label mono">OPERATIONAL DEMAND:</span>
                  <p className="mandate-block-desc">{m.requirement}</p>
                </div>

                <div className="mandate-block solution">
                  <span className="mandate-block-label mono">STARK SOLUTION:</span>
                  <p className="mandate-block-desc">{m.solution}</p>
                </div>
              </div>

              <div className="mandate-specs-row">
                {m.specs.map((s, idx) => (
                  <div key={idx} className="mandate-spec-item">
                    <span className="spec-label mono">{s.label}</span>
                    <span className="spec-val mono">{s.val}</span>
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
