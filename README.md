# T-8 ROBOCON // OMNI-CARRIER 15K

Official interactive web platform and 3D digital twin for **Robocon Team 8 (T-8 Robocon)**, built with React, Vite, and Three.js. Tailored specifically for **Problem Statement 8**.

---

## 🏆 Problem Statement 8 Brief

> *A warehouse operator controls a mobile platform which can carry up to 15kgs manually inside a restricted workspace where movement in several directions is useful. The platform should be able to translate and reposition itself while keeping track of how far it has travelled and where it believes it is relative to its starting point. The challenge is to combine intuitive manual control with dependable motion and position estimation. The operator demands the x, y coordinates as well as the angle of the mobile platform to be displayed at all times.*

---

## 🚀 Key Features

1. **3D CAD Digital Twin with Scroll Choreography**:
   - High-fidelity Three.js procedural model matching the CAD blueprints: 4-wheel 45° omni-drive chassis, aluminum perimeter rails, wooden mounting plate, electronics PCB with status LEDs, 4 vertical cylindrical risers, and the 15 kg payload cargo container bin.
   - Smooth scroll choreography: translates laterally, executes 45° diagonal passages, and spins in-place on yaw axis as the user scrolls.
   - Interactive orbit controls, **Exploded Assembly View toggle**, Wireframe mode, and 15kg cargo load toggle.

2. **Persistent Telemetry HUD (Operator Mandate)**:
   - Always-visible floating telemetry bar continuously displaying:
     - Real-time **$X$ coordinate** ($mm$ and $m$)
     - Real-time **$Y$ coordinate** ($mm$ and $m$)
     - Real-time **Heading Angle $\theta$** ($^\circ$ with rotating compass widget and radians)
     - **Odometer** total distance traveled ($m$) and linear velocity ($m/s$)
     - **15.0 kg Payload Monitor** with rated capacity indicator
     - Local datum zeroing (`ZERO ORIGIN`) and odometer tare buttons

3. **Interactive Warehouse Arena & Manual Drive Simulator**:
   - 2D top-down warehouse floor grid with restricted aisles, pallet storage racks, and obstacle zones.
   - **Virtual 360° Touch Joystick** for direct analog holonomic translation.
   - **Keyboard teleoperation** (`W/A/S/D` or Arrow keys for translation, `Q/E` for in-place rotation).
   - Real-time breadcrumb trajectory trail drawing on the arena floor.
   - Dynamic 0.0 - 15.0 kg payload inertia slider.
   - Automated maneuvers: Square strafe, 45° diagonal aisle transit, 360° yaw spin.

4. **4-Wheel 45° Holonomic Inverse Kinematics Engine**:
   - Real-time kinematic matrix solver mapping chassis $[V_x, V_y, \omega]$ into individual wheel angular speeds $[\omega_1, \omega_2, \omega_3, \omega_4]$.
   - Interactive velocity sliders with live RPM and rad/s wheel vector gauges.
   - Full mathematical derivations for encoder quadrature ticks and Extended Kalman Filter (EKF) sensor fusion.

5. **Subsystems & Engineering Divisions**:
   - **SAMBED**: Mechanical Kinematics & Chassis Structure
   - **SPACED**: Embedded Firmware & 100Hz EKF Odometry Fusion
   - **SIESED**: Actuation & 14.8V Power Electronics
   - **MCSOCD**: Operator HMI & 2.4GHz Telemetry Protocol

6. **CAD Blueprint Archives & Technical FAQ**:
   - High-resolution renders of underside chassis, side elevation risers, full isometric assembly, and problem statement brief.
   - Interactive lightbox with engineering rationale and feature callouts.
   - Comprehensive technical specifications table and engineering FAQ.

7. **Dual Industrial Themes**:
   - **Dark Void Mode** (cybernetic obsidian, electric cyan, caution amber)
   - **Technical Blueprint Mode** (engineering grid, cobalt guidelines, white CAD annotations)

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Bundler & Dev Server**: Vite 5
- **3D Graphics**: Three.js
- **Icons**: Lucide React
- **Styling**: Vanilla CSS Design Token System (Dark Void / Blueprint Modes)

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Run Locally
```bash
# Clone the repository
git clone <repo-url>
cd t-8-robocon

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [`http://localhost:3000`](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run preview
```
