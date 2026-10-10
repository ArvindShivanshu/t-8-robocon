import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

export default function Robo3DCanvas({
  activeStep = 0,
  renderMode = 'shaded',
  showDims = true,
  freeOrbit = false,
  onTelemetryUpdate,
  currentTheme = 'dark',
  scrollProgress = 0,
  steps = []
}) {
  const mountRef = useRef(null);

  // References
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
  const dimsGroupRef = useRef(null);
  const materialsRef = useRef({});

  // Spherical camera orbit state
  const orbitRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    theta: 0.72,
    phi: 1.15,
    radius: 820,
    targetTheta: 0.72,
    targetPhi: 1.15,
    targetRadius: 820,
    explode: 0,
    targetExplode: 0,
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
    const isBlueprint = renderMode === 'blueprint' || currentTheme === 'blueprint';
    scene.background = new THREE.Color(isBlueprint ? 0x051329 : 0x070a0f);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 4000);
    cameraRef.current = camera;
    camera.position.set(450, 400, 550);
    camera.lookAt(0, 20, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.replaceChildren(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.6);
    dirLight1.position.set(450, 650, 450);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    scene.add(dirLight1);

    // Subtle blue/cyan fill light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    fillLight.position.set(-450, 300, -350);
    scene.add(fillLight);

    // Warm orange bottom rim light matching screenshot
    const orangeRimLight = new THREE.DirectionalLight(0xff7a00, 2.2);
    orangeRimLight.position.set(0, -200, 350);
    scene.add(orangeRimLight);

    // 5. Dark Orange Floor Grid (Matching Screenshot)
    const gridColor1 = isBlueprint ? 0x38bdf8 : 0xef6522;
    const gridColor2 = isBlueprint ? 0x0d3163 : 0x2a1005;
    const gridHelper = new THREE.GridHelper(1200, 36, gridColor1, gridColor2);
    gridHelper.position.y = -115;
    scene.add(gridHelper);

    // 6. Materials
    const materials = {
      chassisMetal: new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.82,
        roughness: 0.22,
      }),
      motorBody: new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.9,
        roughness: 0.25,
      }),
      motorShaft: new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.1,
      }),
      woodDeck: new THREE.MeshStandardMaterial({
        color: 0xb58852, // Warm plywood tone matching CAD
        roughness: 0.7,
        metalness: 0.05,
      }),
      pcbBoard: new THREE.MeshStandardMaterial({
        color: 0x166534, // Circuit board green
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
        metalness: 0.88,
        roughness: 0.18,
      }),
      cargoBin: new THREE.MeshStandardMaterial({
        color: 0xcbd5e1, // Sheet metal cargo bin matching CAD
        metalness: 0.75,
        roughness: 0.28,
        side: THREE.DoubleSide,
      }),
      cargoPayload: new THREE.MeshStandardMaterial({
        color: 0xff7a00, // Orange payload matching Analytix
        roughness: 0.45,
        metalness: 0.15,
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
      orangeAccent: new THREE.MeshStandardMaterial({
        color: 0xef6522,
        emissive: 0xef6522,
        emissiveIntensity: 0.6,
      }),
      dimLineMat: new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        linewidth: 1.5,
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

    const frameThickness = 12;
    const frameWidth = 240;
    const frameLength = 260;

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

    const motorConfigs = [
      { id: 'FL', x: -90, z: 90, angle: Math.PI / 4 },
      { id: 'FR', x: 90, z: 90, angle: -Math.PI / 4 },
      { id: 'RL', x: -90, z: -90, angle: 3 * Math.PI / 4 },
      { id: 'RR', x: 90, z: -90, angle: -3 * Math.PI / 4 },
    ];

    motorConfigs.forEach((cfg) => {
      const motorAssembly = new THREE.Group();
      motorAssembly.position.set(cfg.x, -30, cfg.z);
      motorAssembly.rotation.y = cfg.angle;
      chassisGroup.add(motorAssembly);

      const motorBody = new THREE.Mesh(
        new THREE.CylinderGeometry(15, 15, 65, 24),
        materials.motorBody
      );
      motorBody.rotation.x = Math.PI / 2;
      motorBody.position.z = -15;
      motorAssembly.add(motorBody);

      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 4, 35, 16),
        materials.motorShaft
      );
      shaft.rotation.x = Math.PI / 2;
      shaft.position.z = 25;
      motorAssembly.add(shaft);

      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(0, 0, 52);
      motorAssembly.add(wheelGroup);

      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(28, 28, 18, 24),
        materials.omniHub
      );
      hub.rotation.x = Math.PI / 2;
      wheelGroup.add(hub);

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

    // Electronics PCB Board
    const pcbGroup = new THREE.Group();
    pcbRef.current = pcbGroup;
    pcbGroup.position.set(0, 6, 0);
    deckGroup.add(pcbGroup);

    const pcb = new THREE.Mesh(
      new THREE.BoxGeometry(150, 3, 110),
      materials.pcbBoard
    );
    pcbGroup.add(pcb);

    const mcuChip = new THREE.Mesh(new THREE.BoxGeometry(32, 5, 32), materials.pcbChip);
    mcuChip.position.set(-25, 4, 0);
    pcbGroup.add(mcuChip);

    const heatsink1 = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 30), materials.riserColumn);
    heatsink1.position.set(35, 8, -25);
    pcbGroup.add(heatsink1);

    const heatsink2 = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 30), materials.riserColumn);
    heatsink2.position.set(35, 8, 25);
    pcbGroup.add(heatsink2);

    const led = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), materials.orangeAccent);
    led.position.set(-55, 3, -35);
    pcbGroup.add(led);

    // --- 4x Vertical Riser Columns ---
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

    // --- Upper Payload Cargo Bin (5kg Container) ---
    const cargoBinGroup = new THREE.Group();
    cargoBoxRef.current = cargoBinGroup;
    cargoBinGroup.position.set(0, 75, 0);
    robotRoot.add(cargoBinGroup);

    const binBottom = new THREE.Mesh(
      new THREE.BoxGeometry(230, 4, 250),
      materials.cargoBin
    );
    binBottom.castShadow = true;
    cargoBinGroup.add(binBottom);

    const wallHeight = 55;
    const wallThick = 4;

    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(230, wallHeight, wallThick), materials.cargoBin);
    frontWall.position.set(0, wallHeight / 2, 125);
    cargoBinGroup.add(frontWall);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(230, wallHeight, wallThick), materials.cargoBin);
    backWall.position.set(0, wallHeight / 2, -125);
    cargoBinGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, 250), materials.cargoBin);
    leftWall.position.set(-115, wallHeight / 2, 0);
    cargoBinGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, 250), materials.cargoBin);
    rightWall.position.set(115, wallHeight / 2, 0);
    cargoBinGroup.add(rightWall);

    // 5kg Payload Box inside (Orange accent top matching screenshot)
    const payloadPkg = new THREE.Mesh(
      new THREE.BoxGeometry(160, 45, 170),
      materials.cargoPayload
    );
    payloadPkg.position.set(0, 25, 0);
    payloadPkg.castShadow = true;
    cargoBinGroup.add(payloadPkg);

    // --- 3D Dimension Annotation Lines (Matching Screenshot `↔ 260 mm`) ---
    const dimsGroup = new THREE.Group();
    dimsGroupRef.current = dimsGroup;
    robotRoot.add(dimsGroup);

    const dimPoints = [
      new THREE.Vector3(-115, 125, 0),
      new THREE.Vector3(115, 125, 0),
    ];
    const dimGeo = new THREE.BufferGeometry().setFromPoints(dimPoints);
    const dimLine = new THREE.Line(dimGeo, materials.dimLineMat);
    dimsGroup.add(dimLine);

    // Left & Right tick marks
    const leftTick = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-115, 115, 0), new THREE.Vector3(-115, 135, 0)]),
      materials.dimLineMat
    );
    dimsGroup.add(leftTick);

    const rightTick = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(115, 115, 0), new THREE.Vector3(115, 135, 0)]),
      materials.dimLineMat
    );
    dimsGroup.add(rightTick);

    // 8. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const orb = orbitRef.current;

      // Smooth camera interpolation towards target
      orb.theta += (orb.targetTheta - orb.theta) * 0.06;
      orb.phi += (orb.targetPhi - orb.phi) * 0.06;
      orb.radius += (orb.targetRadius - orb.radius) * 0.06;
      orb.explode += (orb.targetExplode - orb.explode) * 0.08;

      // Update exploded position of parts
      if (cargoBoxRef.current && risersRef.current && deckRef.current) {
        cargoBoxRef.current.position.y = 75 + orb.explode * 120;
        risersRef.current.position.y = orb.explode * 50;
        deckRef.current.position.y = -18 - orb.explode * 25;
      }

      // Update camera position
      const clampedPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, orb.phi));
      const cx = orb.radius * Math.sin(clampedPhi) * Math.sin(orb.theta);
      const cy = orb.radius * Math.cos(clampedPhi);
      const cz = orb.radius * Math.sin(clampedPhi) * Math.cos(orb.theta);

      camera.position.set(cx, cy, cz);
      camera.lookAt(0, 15, 0);

      // Rotate wheels slowly
      wheels.forEach((w) => {
        w.rotation.z += delta * 1.2;
      });

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

  // Synchronize Camera Target when activeStep changes
  useEffect(() => {
    if (freeOrbit) return; // don't override camera if user is in free orbit
    const step = steps[activeStep];
    if (!step) return;

    const orb = orbitRef.current;
    orb.targetTheta = step.theta;
    orb.targetPhi = step.phi;
    orb.targetRadius = step.radius;
    orb.targetExplode = step.explode || 0;
  }, [activeStep, steps, freeOrbit]);

  // Render Modes: Shaded, Wireframe, Blueprint
  useEffect(() => {
    const mats = materialsRef.current;
    if (!mats.chassisMetal) return;

    const isWire = renderMode === 'wireframe';
    const isBlue = renderMode === 'blueprint';

    Object.values(mats).forEach((mat) => {
      if (mat && mat.isMaterial) {
        mat.wireframe = isWire;
      }
    });

    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(isBlue ? 0x051329 : 0x070a0f);
    }
  }, [renderMode]);

  // Toggle Dimension Annotations
  useEffect(() => {
    if (dimsGroupRef.current) {
      dimsGroupRef.current.visible = showDims;
    }
  }, [showDims]);

  // Mouse Orbit Dragging
  const handleMouseDown = (e) => {
    orbitRef.current.isDragging = true;
    orbitRef.current.prevX = e.clientX;
    orbitRef.current.prevY = e.clientY;
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
    if (!freeOrbit) return;
    e.preventDefault();
    orbitRef.current.targetRadius += e.deltaY * 0.35;
    orbitRef.current.targetRadius = Math.max(380, Math.min(1300, orbitRef.current.targetRadius));
  };

  return (
    <div
      ref={mountRef}
      className="hero-cad-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: freeOrbit ? (orbitRef.current.isDragging ? 'grabbing' : 'grab') : 'default' }}
    />
  );
}
