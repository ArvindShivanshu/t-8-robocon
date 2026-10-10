import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Box, 
  Eye, 
  Rotate3d, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Layers, 
  Sparkles,
  Shield,
  Compass
} from 'lucide-react';
import './Robo3DCanvas.css';

export default function Robo3DCanvas({ 
  onTelemetryUpdate, 
  currentTheme = 'dark',
  scrollProgress = 0 
}) {
  const mountRef = useRef(null);
  const [exploded, setExploded] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showPayload, setShowPayload] = useState(true);
  const [viewPreset, setViewPreset] = useState('isometric');

  // References to 3D parts for exploded view & animation
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const robotRootRef = useRef(null);
  const cargoBoxRef = useRef(null);
  const risersRef = useRef(null);
  const deckRef = useRef(null);
  const pcbRef = useRef(null);
  const motorsRef = useRef([]);
  const wheelsRef = useRef([]);
  const cargoPkgRef = useRef(null);
  const materialsRef = useRef({});

  // Spherical camera orbit state
  const orbitRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    theta: 0.8,
    phi: 1.1,
    radius: 720,
    targetTheta: 0.8,
    targetPhi: 1.1,
    targetRadius: 720,
  });

  // Setup Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const isBlueprint = currentTheme === 'blueprint';
    scene.background = new THREE.Color(isBlueprint ? 0x071b36 : 0x070a0f);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 4000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.replaceChildren(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(400, 600, 400);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00f0ff, 1.8);
    dirLight2.position.set(-400, 300, -300);
    scene.add(dirLight2);

    const groundLight = new THREE.DirectionalLight(0xffb703, 1.0);
    groundLight.position.set(0, -300, 300);
    scene.add(groundLight);

    // 5. Floor Grid
    const gridHelper = new THREE.GridHelper(1000, 30, 0x00f0ff, isBlueprint ? 0x1e3a8a : 0x1a2638);
    gridHelper.position.y = -120;
    scene.add(gridHelper);

    // Coordinate Axes Guide Ring
    const ringGeo = new THREE.RingGeometry(240, 243, 64);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0x00f0ff, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.25 
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -119;
    scene.add(ring);

    // 6. Materials
    const materials = {
      chassisMetal: new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.85,
        roughness: 0.25,
      }),
      motorBody: new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.9,
        roughness: 0.2,
      }),
      motorShaft: new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.1,
      }),
      woodDeck: new THREE.MeshStandardMaterial({
        color: 0xba8c58, // Warm plywood tone matching CAD
        roughness: 0.65,
        metalness: 0.05,
      }),
      pcbBoard: new THREE.MeshStandardMaterial({
        color: 0x15803d, // Circuit board green
        roughness: 0.35,
        metalness: 0.3,
      }),
      pcbChip: new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.2,
        metalness: 0.8,
      }),
      riserColumn: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.9,
        roughness: 0.15,
      }),
      cargoBin: new THREE.MeshStandardMaterial({
        color: 0xd1d5db, // Sheet metal bin matching CAD
        metalness: 0.7,
        roughness: 0.3,
        side: THREE.DoubleSide,
      }),
      cargoPayload: new THREE.MeshStandardMaterial({
        color: 0xeab308, // 5kg yellow warehouse box
        roughness: 0.5,
        metalness: 0.1,
      }),
      omniHub: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.25,
      }),
      omniRoller: new THREE.MeshStandardMaterial({
        color: 0x475569, // Rubber rollers
        roughness: 0.85,
        metalness: 0.1,
      }),
      cyanAccent: new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.6,
      }),
    };
    materialsRef.current = materials;

    // 7. BUILD ROBOT HIERARCHY
    const robotRoot = new THREE.Group();
    robotRootRef.current = robotRoot;
    scene.add(robotRoot);

    // --- Base Chassis Frame ---
    const chassisGroup = new THREE.Group();
    robotRoot.add(chassisGroup);

    // Outer frame perimeter (chamfered rectangular base: 260mm x 260mm)
    const frameThickness = 12;
    const frameWidth = 240;
    const frameLength = 260;

    // Side frame rails
    const railMat = materials.chassisMetal;
    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameThickness, frameLength - 60), railMat);
    leftRail.position.set(-frameWidth / 2 + 6, -30, 0);
    leftRail.castShadow = true;
    chassisGroup.add(leftRail);

    const rightRail = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameThickness, frameLength - 60), railMat);
    rightRail.position.set(frameWidth / 2 - 6, -30, 0);
    rightRail.castShadow = true;
    chassisGroup.add(rightRail);

    const frontRail = new THREE.Mesh(new THREE.BoxGeometry(frameWidth - 60, frameThickness, frameThickness), railMat);
    frontRail.position.set(0, -30, frameLength / 2 - 6);
    frontRail.castShadow = true;
    chassisGroup.add(frontRail);

    const backRail = new THREE.Mesh(new THREE.BoxGeometry(frameWidth - 60, frameThickness, frameThickness), railMat);
    backRail.position.set(0, -30, -frameLength / 2 + 6);
    backRail.castShadow = true;
    chassisGroup.add(backRail);

    // Cross-member reinforcement
    const crossRail = new THREE.Mesh(new THREE.BoxGeometry(frameWidth - 60, frameThickness, frameThickness), railMat);
    crossRail.position.set(0, -30, 0);
    chassisGroup.add(crossRail);

    // 45-degree corner gussets for motor mounting
    const cornerAngles = [
      { x: -frameWidth / 2 + 35, z: frameLength / 2 - 35, rot: Math.PI / 4 },
      { x: frameWidth / 2 - 35, z: frameLength / 2 - 35, rot: -Math.PI / 4 },
      { x: -frameWidth / 2 + 35, z: -frameLength / 2 + 35, rot: 3 * Math.PI / 4 },
      { x: frameWidth / 2 - 35, z: -frameLength / 2 + 35, rot: -3 * Math.PI / 4 },
    ];

    cornerAngles.forEach((corner) => {
      const gusset = new THREE.Mesh(new THREE.BoxGeometry(45, frameThickness, frameThickness), railMat);
      gusset.position.set(corner.x, -30, corner.z);
      gusset.rotation.y = corner.rot;
      chassisGroup.add(gusset);
    });

    // --- 4x DC Motors & 4x Omni Wheels at 45° ---
    const motors = [];
    const wheels = [];

    // The 4 corners: 45° holonomic omni drive
    const motorConfigs = [
      { id: 'FL', x: -90, z: 90, angle: Math.PI / 4 },       // Front-Left
      { id: 'FR', x: 90, z: 90, angle: -Math.PI / 4 },      // Front-Right
      { id: 'RL', x: -90, z: -90, angle: 3 * Math.PI / 4 },  // Rear-Left
      { id: 'RR', x: 90, z: -90, angle: -3 * Math.PI / 4 }, // Rear-Right
    ];

    motorConfigs.forEach((cfg) => {
      const motorAssembly = new THREE.Group();
      motorAssembly.position.set(cfg.x, -30, cfg.z);
      motorAssembly.rotation.y = cfg.angle;
      chassisGroup.add(motorAssembly);

      // Motor cylindrical gearbox & body
      const motorBody = new THREE.Mesh(
        new THREE.CylinderGeometry(15, 15, 65, 24),
        materials.motorBody
      );
      motorBody.rotation.x = Math.PI / 2;
      motorBody.position.z = -15;
      motorAssembly.add(motorBody);

      // Motor shaft
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 4, 35, 16),
        materials.motorShaft
      );
      shaft.rotation.x = Math.PI / 2;
      shaft.position.z = 25;
      motorAssembly.add(shaft);

      // Double-Row Omni Wheel Assembly
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(0, 0, 52); // At shaft end
      motorAssembly.add(wheelGroup);

      // Main hub
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(28, 28, 18, 24),
        materials.omniHub
      );
      hub.rotation.x = Math.PI / 2;
      wheelGroup.add(hub);

      // Dual rows of omni barrel rollers
      const rollerCount = 10;
      const rollerRadius = 32;

      for (let r = 0; r < 2; r++) {
        const rowZ = (r === 0 ? -6 : 6);
        const rowOffset = (r === 0 ? 0 : Math.PI / rollerCount);

        for (let i = 0; i < rollerCount; i++) {
          const theta = (i * 2 * Math.PI) / rollerCount + rowOffset;
          const roller = new THREE.Mesh(
            new THREE.CylinderGeometry(5.5, 5.5, 11, 12),
            materials.omniRoller
          );
          // Position on circumference
          roller.position.set(
            Math.cos(theta) * rollerRadius,
            Math.sin(theta) * rollerRadius,
            rowZ
          );
          roller.rotation.z = theta + Math.PI / 2;
          wheelGroup.add(roller);
        }
      }

      motors.push(motorAssembly);
      wheels.push(wheelGroup);
    });

    motorsRef.current = motors;
    wheelsRef.current = wheels;

    // --- Middle Deck: Wooden Base Plate ---
    const deckGroup = new THREE.Group();
    deckRef.current = deckGroup;
    deckGroup.position.set(0, -18, 0);
    robotRoot.add(deckGroup);

    const woodPlate = new THREE.Mesh(
      new THREE.BoxGeometry(210, 8, 230),
      materials.woodDeck
    );
    woodPlate.castShadow = true;
    deckGroup.add(woodPlate);

    // Electronics Board (Green PCB with Microcontroller & Components)
    const pcbGroup = new THREE.Group();
    pcbRef.current = pcbGroup;
    pcbGroup.position.set(0, 6, 0);
    deckGroup.add(pcbGroup);

    const pcb = new THREE.Mesh(
      new THREE.BoxGeometry(150, 3, 110),
      materials.pcbBoard
    );
    pcbGroup.add(pcb);

    // Microcontroller IC & Motor Driver heatsinks
    const mcuChip = new THREE.Mesh(new THREE.BoxGeometry(32, 5, 32), materials.pcbChip);
    mcuChip.position.set(-25, 4, 0);
    pcbGroup.add(mcuChip);

    const heatsink1 = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 30), materials.riserColumn);
    heatsink1.position.set(35, 8, -25);
    pcbGroup.add(heatsink1);

    const heatsink2 = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 30), materials.riserColumn);
    heatsink2.position.set(35, 8, 25);
    pcbGroup.add(heatsink2);

    // Blinking status LEDs on PCB
    const led1 = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), materials.cyanAccent);
    led1.position.set(-55, 3, -35);
    pcbGroup.add(led1);

    // --- 4x Vertical Riser Columns / Standoffs ---
    const risersGroup = new THREE.Group();
    risersRef.current = risersGroup;
    robotRoot.add(risersGroup);

    const riserPositions = [
      { x: -75, z: 85 },
      { x: 75, z: 85 },
      { x: -75, z: -85 },
      { x: 75, z: -85 },
    ];

    riserPositions.forEach((pos) => {
      const riser = new THREE.Mesh(
        new THREE.CylinderGeometry(7, 7, 60, 20),
        materials.riserColumn
      );
      riser.position.set(pos.x, 15, pos.z);
      riser.castShadow = true;
      risersGroup.add(riser);
    });

    // --- Upper Payload Cargo Bin / Tray (5kg Container) ---
    const cargoBinGroup = new THREE.Group();
    cargoBoxRef.current = cargoBinGroup;
    cargoBinGroup.position.set(0, 75, 0);
    robotRoot.add(cargoBinGroup);

    // Bin Bottom
    const binBottom = new THREE.Mesh(
      new THREE.BoxGeometry(230, 4, 250),
      materials.cargoBin
    );
    binBottom.castShadow = true;
    cargoBinGroup.add(binBottom);

    // Bin 4 Walls
    const wallHeight = 55;
    const wallThick = 4;

    // Front & Back walls
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(230, wallHeight, wallThick), materials.cargoBin);
    frontWall.position.set(0, wallHeight / 2, 125);
    cargoBinGroup.add(frontWall);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(230, wallHeight, wallThick), materials.cargoBin);
    backWall.position.set(0, wallHeight / 2, -125);
    cargoBinGroup.add(backWall);

    // Left & Right walls
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, 250), materials.cargoBin);
    leftWall.position.set(-115, wallHeight / 2, 0);
    cargoBinGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, 250), materials.cargoBin);
    rightWall.position.set(115, wallHeight / 2, 0);
    cargoBinGroup.add(rightWall);

    // 5kg Payload Box inside the container
    const payloadPkg = new THREE.Mesh(
      new THREE.BoxGeometry(160, 45, 170),
      materials.cargoPayload
    );
    payloadPkg.position.set(0, 25, 0);
    payloadPkg.castShadow = true;
    cargoPkgRef.current = payloadPkg;
    cargoBinGroup.add(payloadPkg);

    // 8. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth camera interpolation towards orbit target
      const orb = orbitRef.current;
      orb.theta += (orb.targetTheta - orb.theta) * 0.08;
      orb.phi += (orb.targetPhi - orb.phi) * 0.08;
      orb.radius += (orb.targetRadius - orb.radius) * 0.08;

      if (autoRotate && !orb.isDragging) {
        orb.targetTheta += delta * 0.25;
      }

      updateCameraPosition();

      // Animate wheels rotation gently
      wheels.forEach((w) => {
        w.rotation.z += delta * 1.5;
      });

      // Subtle hover / suspension breathing
      if (!exploded) {
        robotRoot.position.y = Math.sin(elapsed * 2) * 2;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Listener
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [currentTheme]);

  // Update Camera from spherical coordinates
  const updateCameraPosition = () => {
    const orb = orbitRef.current;
    const camera = cameraRef.current;
    if (!camera) return;

    // Clamp phi to prevent flipping
    const clampedPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, orb.phi));

    const x = orb.radius * Math.sin(clampedPhi) * Math.sin(orb.theta);
    const y = orb.radius * Math.cos(clampedPhi);
    const z = orb.radius * Math.sin(clampedPhi) * Math.cos(orb.theta);

    camera.position.set(x, y, z);
    camera.lookAt(0, 10, 0);
  };

  // Scroll Choreography: update robot transform and report telemetry as user scrolls
  useEffect(() => {
    const robot = robotRootRef.current;
    if (!robot) return;

    // Normalizing scroll progression (0 to 1)
    const sp = Math.min(Math.max(scrollProgress, 0), 1);

    // Choreographed holonomic maneuvers across scroll
    if (sp < 0.25) {
      // Phase 1: Pure lateral strafe (demonstrating omnidirectional capability)
      const t = sp / 0.25;
      robot.position.x = Math.sin(t * Math.PI * 2) * 45;
      robot.position.z = (t - 0.5) * 40;
      robot.rotation.y = 0; // Notice: NO rotation, pure strafe!
    } else if (sp < 0.5) {
      // Phase 2: Diagonal 45° translation
      const t = (sp - 0.25) / 0.25;
      robot.position.x = 45 - t * 90;
      robot.position.z = 20 - t * 60;
      robot.rotation.y = t * 0.4;
    } else if (sp < 0.75) {
      // Phase 3: In-place yaw rotation (spinning on its center axis)
      const t = (sp - 0.5) / 0.25;
      robot.position.x = -45 + t * 45;
      robot.position.z = -40 + t * 40;
      robot.rotation.y = 0.4 + t * (Math.PI * 1.5);
    } else {
      // Phase 4: Docking reposition
      const t = (sp - 0.75) / 0.25;
      robot.position.x = 0;
      robot.position.z = 0;
      robot.rotation.y = (0.4 + Math.PI * 1.5) + t * 0.2;
    }

    // Report calculated pose to Telemetry HUD
    if (onTelemetryUpdate) {
      const headingDeg = ((robot.rotation.y * 180) / Math.PI) % 360;
      const normalizedAngle = headingDeg < 0 ? headingDeg + 360 : headingDeg;
      onTelemetryUpdate({
        x: robot.position.x * 20, // scale to mm
        y: robot.position.z * 20, // scale to mm
        theta: normalizedAngle,
        distance: 1.2 + sp * 8.4, // meters
        velocity: Math.abs(Math.sin(sp * 8)) * 0.85,
        motionState: sp < 0.25 ? 'HOLONOMIC_STRAFE' : sp < 0.5 ? 'DIAGONAL_45°' : sp < 0.75 ? 'IN_PLACE_SPIN' : 'DOCKED',
        source: '3D_SCROLL_CHOREOGRAPHY'
      });
    }
  }, [scrollProgress, onTelemetryUpdate]);

  // Handle Exploded View animation
  useEffect(() => {
    const cargoBox = cargoBoxRef.current;
    const risers = risersRef.current;
    const deck = deckRef.current;
    const motors = motorsRef.current;

    if (!cargoBox || !risers || !deck) return;

    if (exploded) {
      // Explode apart along Y and radial vectors
      cargoBox.position.y = 170;
      risers.position.y = 65;
      deck.position.y = 20;

      // Motors shift outward along their 45° shafts
      motors.forEach((m, idx) => {
        m.position.y = -45;
      });
    } else {
      // Reset back to assembled state
      cargoBox.position.y = 75;
      risers.position.y = 0;
      deck.position.y = -18;
      motors.forEach((m) => {
        m.position.y = -30;
      });
    }
  }, [exploded]);

  // Handle Wireframe Toggle
  useEffect(() => {
    const mats = materialsRef.current;
    Object.values(mats).forEach((mat) => {
      if (mat) mat.wireframe = wireframe;
    });
  }, [wireframe]);

  // Handle Payload Visibility Toggle
  useEffect(() => {
    if (cargoPkgRef.current) {
      cargoPkgRef.current.visible = showPayload;
    }
  }, [showPayload]);

  // Mouse Interaction handlers for Orbiting
  const handleMouseDown = (e) => {
    orbitRef.current.isDragging = true;
    orbitRef.current.prevX = e.clientX;
    orbitRef.current.prevY = e.clientY;
    setAutoRotate(false);
  };

  const handleMouseMove = (e) => {
    if (!orbitRef.current.isDragging) return;
    const deltaX = e.clientX - orbitRef.current.prevX;
    const deltaY = e.clientY - orbitRef.current.prevY;
    orbitRef.current.prevX = e.clientX;
    orbitRef.current.prevY = e.clientY;

    orbitRef.current.targetTheta -= deltaX * 0.008;
    orbitRef.current.targetPhi -= deltaY * 0.008;
  };

  const handleMouseUp = () => {
    orbitRef.current.isDragging = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    orbitRef.current.targetRadius += e.deltaY * 0.4;
    orbitRef.current.targetRadius = Math.max(380, Math.min(1200, orbitRef.current.targetRadius));
  };

  // View Preset Buttons
  const setCameraPreset = (preset) => {
    setViewPreset(preset);
    setAutoRotate(false);
    const orb = orbitRef.current;

    if (preset === 'isometric') {
      orb.targetTheta = 0.8;
      orb.targetPhi = 1.1;
      orb.targetRadius = 720;
    } else if (preset === 'top') {
      orb.targetTheta = 0;
      orb.targetPhi = 0.08; // directly above
      orb.targetRadius = 650;
    } else if (preset === 'bottom') {
      orb.targetTheta = 0.8;
      orb.targetPhi = Math.PI - 0.2; // underneath showing 45° motors
      orb.targetRadius = 650;
    } else if (preset === 'front') {
      orb.targetTheta = 0;
      orb.targetPhi = Math.PI / 2 - 0.05;
      orb.targetRadius = 680;
    }
  };

  return (
    <div className="robo-canvas-wrapper" id="cad-viewer-container">
      {/* Three.js Canvas Container */}
      <div 
        ref={mountRef} 
        className="canvas-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* 3D Viewport HUD Overlay Bar */}
      <div className="canvas-hud-overlay">
        <div className="hud-badge-tag mono">
          <span className="dot pulse"></span>
          <span>DIGITAL TWIN // 3D CAD MODEL</span>
        </div>

        {/* View presets */}
        <div className="view-presets-bar">
          <button 
            className={`preset-btn ${viewPreset === 'isometric' ? 'active' : ''}`}
            onClick={() => setCameraPreset('isometric')}
            id="preset-iso-btn"
          >
            ISO 3D
          </button>
          <button 
            className={`preset-btn ${viewPreset === 'bottom' ? 'active' : ''}`}
            onClick={() => setCameraPreset('bottom')}
            id="preset-bottom-btn"
          >
            UNDERSIDE (45° MOTORS)
          </button>
          <button 
            className={`preset-btn ${viewPreset === 'top' ? 'active' : ''}`}
            onClick={() => setCameraPreset('top')}
            id="preset-top-btn"
          >
            TOP (PAYLOAD BIN)
          </button>
          <button 
            className={`preset-btn ${viewPreset === 'front' ? 'active' : ''}`}
            onClick={() => setCameraPreset('front')}
            id="preset-front-btn"
          >
            FRONT ELEVATION
          </button>
        </div>

        {/* Action Toggles */}
        <div className="canvas-controls-group">
          {/* Exploded View Toggle */}
          <button 
            className={`canvas-tool-btn ${exploded ? 'active' : ''}`}
            onClick={() => setExploded(!exploded)}
            title="Toggle Exploded CAD Assembly View"
            id="exploded-view-toggle-btn"
          >
            <Layers size={14} />
            <span className="mono">{exploded ? 'COLLAPSE' : 'EXPLODE VIEW'}</span>
          </button>

          {/* Wireframe Toggle */}
          <button 
            className={`canvas-tool-btn ${wireframe ? 'active' : ''}`}
            onClick={() => setWireframe(!wireframe)}
            title="Toggle Wireframe Blueprint"
            id="wireframe-toggle-btn"
          >
            <Box size={14} />
            <span className="mono">{wireframe ? 'SHADED' : 'WIREFRAME'}</span>
          </button>

          {/* 5kg Payload Toggle */}
          <button 
            className={`canvas-tool-btn ${showPayload ? 'active' : ''}`}
            onClick={() => setShowPayload(!showPayload)}
            title="Toggle 5kg Cargo Payload in Bin"
            id="payload-box-toggle-btn"
          >
            <Shield size={14} />
            <span className="mono">{showPayload ? '5KG LOADED' : 'NO CARGO'}</span>
          </button>

          {/* Auto Rotate Toggle */}
          <button 
            className={`canvas-tool-btn ${autoRotate ? 'active' : ''}`}
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle Auto Rotation"
            id="autorotate-toggle-btn"
          >
            <Rotate3d size={14} />
            <span className="mono">{autoRotate ? 'PAUSE ROTATE' : 'AUTO ORBIT'}</span>
          </button>
        </div>

        {/* Instruction Hint */}
        <div className="canvas-hint mono">
          <span>DRAG MOUSE TO ORBIT • SCROLL PAGE TO ANIMATE KINEMATICS</span>
        </div>
      </div>
    </div>
  );
}
