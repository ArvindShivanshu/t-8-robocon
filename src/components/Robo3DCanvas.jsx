import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Robo3DCanvas({
  activeStep = 0,
  renderMode = 'shaded',
  showDims = true,
  freeOrbit = false,
  onTelemetryUpdate,
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
  const arcCoreRef = useRef(null);
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

    // 1. Scene with Pure Studio Black Base
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const bgDark = new THREE.Color(0x000000);
    scene.background = bgDark;
    scene.fog = new THREE.Fog(0x000000, 950, 2800);

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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.replaceChildren(renderer.domElement);

    // 4. Lighting: Clean High-End Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(450, 700, 450);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Soft Studio Rim Light
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
    rimLight.position.set(-450, 300, -350);
    scene.add(rimLight);

    // Soft Studio Fill Light
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.2);
    fillLight.position.set(0, -180, 350);
    scene.add(fillLight);

    // 5. Floor Grid: Subtle Minimalist Hairline Grid
    const gridHelper = new THREE.GridHelper(1400, 28, 0x333338, 0x141416);
    gridHelper.position.y = -115;
    scene.add(gridHelper);

    // Subtle Concentric Studio Datum Ring on the Floor
    const ringGeo1 = new THREE.RingGeometry(220, 221.5, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = -Math.PI / 2;
    ring1.position.y = -114.6;
    scene.add(ring1);

    // 6. Materials: Stark Industries Titanium & Hot-Rod Red
    const materials = {
      chassisTitanium: new THREE.MeshStandardMaterial({
        color: 0x334155, // Aeronautic Titanium Alloy
        metalness: 0.88,
        roughness: 0.25,
      }),
      motorBody: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.92,
        roughness: 0.2,
      }),
      motorShaft: new THREE.MeshStandardMaterial({
        color: 0xf59e0b, // Gold-plated output shaft
        metalness: 0.95,
        roughness: 0.15,
      }),
      deckCarbon: new THREE.MeshStandardMaterial({
        color: 0x0f172a, // Carbon composite base
        roughness: 0.5,
        metalness: 0.3,
      }),
      pcbBoard: new THREE.MeshStandardMaterial({
        color: 0x1e3a8a, // High-spec Navy PCB
        roughness: 0.3,
        metalness: 0.4,
      }),
      pcbChip: new THREE.MeshStandardMaterial({
        color: 0x020617,
        roughness: 0.2,
        metalness: 0.9,
      }),
      riserColumn: new THREE.MeshStandardMaterial({
        color: 0xd4d4d8, // Polished Titanium Risers
        metalness: 0.92,
        roughness: 0.12,
      }),
      cargoBinStark: new THREE.MeshStandardMaterial({
        color: 0xb91c1c, // Stark Hot-Rod Crimson Red!
        metalness: 0.82,
        roughness: 0.22,
        side: THREE.DoubleSide,
      }),
      cargoPayloadGold: new THREE.MeshStandardMaterial({
        color: 0xf59e0b, // Vibranium Gold 5kg Payload
        metalness: 0.75,
        roughness: 0.28,
      }),
      omniHub: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.2,
      }),
      omniRoller: new THREE.MeshStandardMaterial({
        color: 0x475569, // High-traction rollers
        roughness: 0.85,
        metalness: 0.1,
      }),
      arcReactorGlow: new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 1.2,
      }),
      crimsonGlow: new THREE.MeshStandardMaterial({
        color: 0xe62429,
        emissive: 0xe62429,
        emissiveIntensity: 0.8,
      }),
      dimLineMat: new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        linewidth: 2,
      }),
    };
    materialsRef.current = materials;

    // 7. BUILD ROBOT HIERARCHY
    const robotRoot = new THREE.Group();
    robotRootRef.current = robotRoot;
    scene.add(robotRoot);

    // --- Base Chassis Frame (Titanium Alloy) ---
    const chassisGroup = new THREE.Group();
    robotRoot.add(chassisGroup);

    const frameThickness = 12;
    const frameWidth = 240;
    const frameLength = 260;

    const railMat = materials.chassisTitanium;
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

    // Corner Gussets
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
      motorBody.castShadow = true;
      motorAssembly.add(motorBody);

      // Gold shaft ring
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
      hub.castShadow = true;
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

    // --- Middle Deck: Carbon Base Deck ---
    const deckGroup = new THREE.Group();
    deckRef.current = deckGroup;
    deckGroup.position.set(0, -18, 0);
    robotRoot.add(deckGroup);

    const carbonPlate = new THREE.Mesh(
      new THREE.BoxGeometry(210, 8, 230),
      materials.deckCarbon
    );
    carbonPlate.castShadow = true;
    deckGroup.add(carbonPlate);

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

    // Glowing Arc Core on the Deck
    const arcCore = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 14, 5, 32),
      materials.arcReactorGlow
    );
    arcCore.position.set(0, 4, 0);
    arcCoreRef.current = arcCore;
    pcbGroup.add(arcCore);

    const mcuChip = new THREE.Mesh(new THREE.BoxGeometry(28, 5, 28), materials.pcbChip);
    mcuChip.position.set(-40, 4, 0);
    pcbGroup.add(mcuChip);

    const heatsink = new THREE.Mesh(new THREE.BoxGeometry(20, 14, 28), materials.riserColumn);
    heatsink.position.set(40, 8, 0);
    pcbGroup.add(heatsink);

    // --- 4x Vertical Riser Columns (Titanium) ---
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

    // --- Upper Payload Cargo Bin (Stark Hot-Rod Crimson Red) ---
    const cargoBinGroup = new THREE.Group();
    cargoBoxRef.current = cargoBinGroup;
    cargoBinGroup.position.set(0, 75, 0);
    robotRoot.add(cargoBinGroup);

    const binBottom = new THREE.Mesh(
      new THREE.BoxGeometry(230, 4, 250),
      materials.cargoBinStark
    );
    binBottom.castShadow = true;
    cargoBinGroup.add(binBottom);

    const wallHeight = 55;
    const wallThick = 4;

    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(230, wallHeight, wallThick), materials.cargoBinStark);
    frontWall.position.set(0, wallHeight / 2, 125);
    cargoBinGroup.add(frontWall);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(230, wallHeight, wallThick), materials.cargoBinStark);
    backWall.position.set(0, wallHeight / 2, -125);
    cargoBinGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, 250), materials.cargoBinStark);
    leftWall.position.set(-115, wallHeight / 2, 0);
    cargoBinGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, 250), materials.cargoBinStark);
    rightWall.position.set(115, wallHeight / 2, 0);
    cargoBinGroup.add(rightWall);

    // Gold Rim Trim around Top Edge
    const trimFront = new THREE.Mesh(new THREE.BoxGeometry(232, 2, 6), materials.cargoPayloadGold);
    trimFront.position.set(0, wallHeight, 125);
    cargoBinGroup.add(trimFront);

    // 5kg Vibranium-Gold Cargo Box
    const payloadPkg = new THREE.Mesh(
      new THREE.BoxGeometry(160, 45, 170),
      materials.cargoPayloadGold
    );
    payloadPkg.position.set(0, 25, 0);
    payloadPkg.castShadow = true;
    cargoBinGroup.add(payloadPkg);

    // --- 3D Dimension Annotation Lines (`↔ 260 mm`) ---
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

      orb.theta += (orb.targetTheta - orb.theta) * 0.06;
      orb.phi += (orb.targetPhi - orb.phi) * 0.06;
      orb.radius += (orb.targetRadius - orb.radius) * 0.06;
      orb.explode += (orb.targetExplode - orb.explode) * 0.08;

      if (cargoBoxRef.current && risersRef.current && deckRef.current) {
        cargoBoxRef.current.position.y = 75 + orb.explode * 125;
        risersRef.current.position.y = orb.explode * 55;
        deckRef.current.position.y = -18 - orb.explode * 30;
      }

      // Gentle Arc Reactor breathing pulse
      if (arcCoreRef.current) {
        const pulse = 1.0 + Math.sin(elapsed * 4) * 0.35;
        materials.arcReactorGlow.emissiveIntensity = pulse;
      }

      const clampedPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, orb.phi));
      const cx = orb.radius * Math.sin(clampedPhi) * Math.sin(orb.theta);
      const cy = orb.radius * Math.cos(clampedPhi);
      const cz = orb.radius * Math.sin(clampedPhi) * Math.cos(orb.theta);

      camera.position.set(cx, cy, cz);
      camera.lookAt(0, 15, 0);

      wheels.forEach((w) => {
        w.rotation.z += delta * 1.3;
      });

      renderer.render(scene, camera);
    };

    animate();

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
  }, []);

  // Update target when activeStep changes
  useEffect(() => {
    if (freeOrbit) return;
    const step = steps[activeStep];
    if (!step) return;

    const orb = orbitRef.current;
    orb.targetTheta = step.theta;
    orb.targetPhi = step.phi;
    orb.targetRadius = step.radius;
    orb.targetExplode = step.explode || 0;
  }, [activeStep, steps, freeOrbit]);

  // Render Modes
  useEffect(() => {
    const mats = materialsRef.current;
    if (!mats.chassisTitanium) return;

    const isWire = renderMode === 'wireframe';
    const isBlue = renderMode === 'blueprint';

    Object.values(mats).forEach((mat) => {
      if (mat && mat.isMaterial) {
        mat.wireframe = isWire;
      }
    });

    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(isBlue ? 0x0a1424 : 0x101624);
    }
  }, [renderMode]);

  // Dimension lines toggle
  useEffect(() => {
    if (dimsGroupRef.current) {
      dimsGroupRef.current.visible = showDims;
    }
  }, [showDims]);

  // Mouse Interaction handlers
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
