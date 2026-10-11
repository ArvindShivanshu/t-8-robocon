import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { wheelAudio } from '../utils/wheelAudio';

const partInfoMap = {
  chassis: {
    group: 'chassis',
    code: 'CH-01',
    name: '45° OMNI CHASSIS FRAME',
    dims: '240 mm (W) × 260 mm (L) × 45 mm (H)',
    spec: '6061-T6 Aluminum Alloy // 4 mm Plate Thickness',
    material: 'Anodized 6061-T6 Aluminum CNC Rails',
    datum: 'Primary Kinematics Datum',
  },
  motors: {
    group: 'motors',
    code: 'DR-02',
    name: 'REPULSOR DRIVE MOTORS',
    dims: 'Ø 42 mm Diameter × 85 mm Length',
    spec: '4x Planetary Geared 12V DC // 450 RPM Max',
    material: 'Neodymium Core // Hardened Steel Gearbox',
    datum: '45° Holonomic Vector Mount',
  },
  wheels: {
    group: 'wheels',
    code: 'WH-03',
    name: '45° HOLONOMIC OMNI ROLLERS',
    dims: 'Ø 100 mm Roller OD × 38 mm Width',
    spec: '14x High-Grip TPU Sub-Rollers // 360° Translation',
    material: 'Die-Cast Aluminum Hub + Molded TPU',
    datum: 'Continuous Zero-Scrub Ground Contact',
  },
  deck: {
    group: 'deck',
    code: 'SN-04',
    name: 'ARC ODOMETRY & SENSOR DECK',
    dims: '180 mm (W) × 180 mm (L) × 25 mm (H)',
    spec: '1024 CPR Optical Encoders + 6-DoF IMU Fusion',
    material: '3K Carbon Twill Plate + FR-4 Circuitry',
    datum: 'EKF Navigation Datum @ Y=15 mm',
  },
  risers: {
    group: 'risers',
    code: 'ST-05',
    name: 'LOAD-BEARING ALUMINUM RISERS',
    dims: '4x Ø 16 mm Diameter × 60 mm Height',
    spec: 'Solid Aluminum Columns // Direct Rail Standoffs',
    material: 'High-Tensile Anodized Aluminum',
    datum: 'Zero-Deflection Payload Mount',
  },
  cargo: {
    group: 'cargo',
    code: 'PL-06',
    name: '15.0 KG PAYLOAD CONTAINMENT BAY',
    dims: '190 mm (W) × 170 mm (L) × 110 mm (H)',
    spec: '15.0 kg Max Load // Internal Volume: 3.55 L',
    material: 'Deep-Stamped Crimson Sheet Alloy',
    datum: 'Warehouse Transport Envelope',
  },
  docking: {
    group: 'docking',
    code: 'DK-07',
    name: 'AUTONOMOUS LASER DOCKING PORT',
    dims: '70 mm (W) × 35 mm (L) × 28 mm (H)',
    spec: 'Dual Optical Targets + ±2.5 mm Laser Guide Pins',
    material: 'Titanium Guide Pins + Optical Receiver Lens',
    datum: 'Return-to-Dock Bay Lock Datum',
  },
};

export default function Robo3DCanvas({
  activeStep = 0,
  scrollProgress = 0,
  renderMode = 'shaded',
  showDims = false,
  freeOrbit = false,
  onTelemetryUpdate,
  steps = []
}) {
  const mountRef = useRef(null);
  const scrollProgressRef = useRef(scrollProgress);
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  // Hover dimension inspection state
  const [hoveredPart, setHoveredPart] = useState(null);
  const hoveredPartRef = useRef(null);
  const caliperGroupRef = useRef(null);
  const cadInteractiveMeshesRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const dimTooltipRef = useRef(null);

  // Continuous simulation progress & wheel physics
  const simProgressRef = useRef(0);
  const robotPathProgressRef = useRef(0);
  const wheelVelocityRef = useRef(0);

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
  const highlightsRef = useRef({ chassis: 0, motors: 0, deck: 0, risers: 0, cargo: 0, docking: 0, root: 0 });
  const edgeMatsRef = useRef({});
  const wireMatsRef = useRef({});

  // Spherical camera orbit state
  const orbitRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    theta: 0.72,
    phi: 1.15,
    radius: 1480,
    targetTheta: 0.72,
    targetPhi: 1.15,
    targetRadius: 1480,
  });

  const activeStepRef = useRef(activeStep);
  useEffect(() => {
    activeStepRef.current = activeStep;
  }, [activeStep]);

  const stepsRef = useRef(steps);
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  // 3D holographic beacon & 2D CAD callout leader line DOM refs
  const beaconGroupRef = useRef(null);
  const calloutSvgRef = useRef(null);
  const linePathRef = useRef(null);
  const reticlePulseRef = useRef(null);
  const reticleDotRef = useRef(null);
  const terminalDotRef = useRef(null);
  const crosshairsRef = useRef([]);
  const cardRef = useRef(null);

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
    scene.fog = new THREE.Fog(0x000000, 5500, 14000);

    // 2. Camera: Initial Wide Overview Vista showing entire arena circuit
    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 16000);
    cameraRef.current = camera;

    const initArenaCenter = new THREE.Vector3(0, 15, -100);
    const initOverviewR = 3900;
    const initOverviewPhi = 45 * Math.PI / 180;
    const initOverviewTheta = -20 * Math.PI / 180;
    camera.position.set(
      initArenaCenter.x + initOverviewR * Math.sin(initOverviewPhi) * Math.sin(initOverviewTheta),
      initArenaCenter.y + initOverviewR * Math.cos(initOverviewPhi),
      initArenaCenter.z + initOverviewR * Math.sin(initOverviewPhi) * Math.cos(initOverviewTheta)
    );
    camera.lookAt(initArenaCenter);

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

    // 5. Floor Grid: Expanded Minimalist Hairline Arena Grid (aligned with bottom of omni wheels at Y = -67.5)
    const gridHelper = new THREE.GridHelper(8000, 160, 0x333338, 0x141416);
    gridHelper.position.y = -67.5;
    scene.add(gridHelper);

    // 6. Navigation Path Waypoints & Catmull-Rom Simulation Trajectory (Expansive, Non-Intersecting Circuit)
    const waypoints = [
      new THREE.Vector3(-1200, 0, -1400), // 00 Southwest Origin Depot
      new THREE.Vector3(-1200, 0, -200),  // 01 West Aisle Transit
      new THREE.Vector3(-500, 0, 800),    // 02 Northwest Junction
      new THREE.Vector3(700, 0, 1200),    // 03 Northeast High-Bay Arc
      new THREE.Vector3(1400, 0, 200),    // 04 East Storage Corridor
      new THREE.Vector3(1000, 0, -1000),  // 05 Southeast Transfer Bay
      new THREE.Vector3(-100, 0, -400),   // 06 Central Destination Dock
    ];
    const simPath = new THREE.CatmullRomCurve3(waypoints, false, 'catmullrom', 0.5);

    // Dual Glowing Tactical AGV Track: Illuminated floor runway ribbon + dashed centerline
    const ribbonSamples = simPath.getPoints(360);
    const ribbonPositions = [];
    const ribbonIndices = [];
    const ribbonWidth = 24;

    for (let i = 0; i < ribbonSamples.length; i++) {
      const pt = ribbonSamples[i];
      const t = i / (ribbonSamples.length - 1);
      const tangent = simPath.getTangentAt(Math.max(0.0001, Math.min(0.9999, t))).normalize();
      const nx = -tangent.z;
      const nz = tangent.x;

      ribbonPositions.push(
        pt.x - nx * (ribbonWidth * 0.5), -67.3, pt.z - nz * (ribbonWidth * 0.5),
        pt.x + nx * (ribbonWidth * 0.5), -67.3, pt.z + nz * (ribbonWidth * 0.5)
      );

      if (i < ribbonSamples.length - 1) {
        const v0 = i * 2;
        const v1 = i * 2 + 1;
        const v2 = (i + 1) * 2;
        const v3 = (i + 1) * 2 + 1;
        ribbonIndices.push(v0, v1, v2, v1, v3, v2);
      }
    }

    const ribbonGeo = new THREE.BufferGeometry();
    ribbonGeo.setAttribute('position', new THREE.Float32BufferAttribute(ribbonPositions, 3));
    ribbonGeo.setIndex(ribbonIndices);
    ribbonGeo.computeVertexNormals();

    const ribbonMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    scene.add(ribbonMesh);

    // Glowing Tactical Path Ribbon on the Floor Grid
    const pathPoints = ribbonSamples.map((pt) => new THREE.Vector3(pt.x, -67.0, pt.z));
    const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const pathMat = new THREE.LineDashedMaterial({
      color: 0x00f0ff,
      dashSize: 32,
      gapSize: 18,
      transparent: true,
      opacity: 0.85,
    });
    const pathLine = new THREE.Line(pathGeo, pathMat);
    pathLine.computeLineDistances();
    scene.add(pathLine);

    // Tactical Waypoint Stations along the Trajectory
    // 00 Start Depot Launchpad (Where the 3D model is parked)
    const depotRing = new THREE.Mesh(
      new THREE.RingGeometry(38, 42, 36),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
    );
    depotRing.rotation.x = -Math.PI / 2;
    depotRing.position.set(waypoints[0].x, -67.2, waypoints[0].z);
    scene.add(depotRing);

    const depotOuterRing = new THREE.Mesh(
      new THREE.RingGeometry(70, 73, 48),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })
    );
    depotOuterRing.rotation.x = -Math.PI / 2;
    depotOuterRing.position.set(waypoints[0].x, -67.2, waypoints[0].z);
    scene.add(depotOuterRing);

    const depotGlow = new THREE.Mesh(
      new THREE.CircleGeometry(70, 36),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.12, depthWrite: false })
    );
    depotGlow.rotation.x = -Math.PI / 2;
    depotGlow.position.set(waypoints[0].x, -67.35, waypoints[0].z);
    scene.add(depotGlow);

    // Waypoints 01 to 05 (Aisle Transit Stations)
    for (let idx = 1; idx < 6; idx++) {
      const wp = waypoints[idx];
      const wpRing = new THREE.Mesh(
        new THREE.RingGeometry(22, 25, 32),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
      );
      wpRing.rotation.x = -Math.PI / 2;
      wpRing.position.set(wp.x, -67.2, wp.z);
      scene.add(wpRing);

      const wpDot = new THREE.Mesh(
        new THREE.CircleGeometry(4, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
      );
      wpDot.rotation.x = -Math.PI / 2;
      wpDot.position.set(wp.x, -67.1, wp.z);
      scene.add(wpDot);
    }

    // 06 Destination Dock Station
    const dockRing = new THREE.Mesh(
      new THREE.RingGeometry(38, 42, 36),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
    );
    dockRing.rotation.x = -Math.PI / 2;
    dockRing.position.set(waypoints[6].x, -67.2, waypoints[6].z);
    scene.add(dockRing);

    const dockOuterRing = new THREE.Mesh(
      new THREE.RingGeometry(70, 73, 48),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })
    );
    dockOuterRing.rotation.x = -Math.PI / 2;
    dockOuterRing.position.set(waypoints[6].x, -67.2, waypoints[6].z);
    scene.add(dockOuterRing);

    const dockGlow = new THREE.Mesh(
      new THREE.CircleGeometry(70, 36),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide, transparent: true, opacity: 0.12, depthWrite: false })
    );
    dockGlow.rotation.x = -Math.PI / 2;
    dockGlow.position.set(waypoints[6].x, -67.35, waypoints[6].z);
    scene.add(dockGlow);

    // 6. Materials: Structural Aluminum Alloy & Hot-Rod Red
    const materials = {
      chassisAluminum: new THREE.MeshStandardMaterial({
        color: 0x334155, // Aeronautic Aluminum Alloy
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
        color: 0xd4d4d8, // Polished Aluminum Risers
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
        color: 0xf59e0b, // Vibranium Gold 15kg Payload
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
      dockingHousing: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.88,
        roughness: 0.2,
      }),
      dockingLaser: new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x22c55e,
        emissiveIntensity: 1.5,
      }),
      dockingTarget: new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.82,
        roughness: 0.28,
      }),
      dimLineMat: new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        linewidth: 2,
      }),
    };
    materials.chassisTitanium = materials.chassisAluminum;
    materialsRef.current = materials;

    // 7. BUILD ROBOT HIERARCHY
    const robotRoot = new THREE.Group();
    robotRootRef.current = robotRoot;
    scene.add(robotRoot);
    cadInteractiveMeshesRef.current = [];

    // Dynamic ground datum ring that moves across the floor with the robot
    const contactRing = new THREE.Mesh(
      new THREE.RingGeometry(160, 161.5, 64),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.15 })
    );
    contactRing.rotation.x = -Math.PI / 2;
    contactRing.position.y = -67.2;
    robotRoot.add(contactRing);

    // --- High-Tech CAD Component Edge Contours (Glowing Stark Cyan & Emerald Docking) ---
    const edgeMats = {
      chassis: new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      }),
      motors: new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      }),
      deck: new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      }),
      risers: new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      }),
      cargo: new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      }),
      docking: new THREE.LineBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      }),
      root: new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
      }),
    };
    edgeMatsRef.current = edgeMats;

    // --- Holographic CAD Wireframe Lattice Shells for High-Contrast Visibility ---
    const wireMats = {
      chassis: new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
      motors: new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
      deck: new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
      risers: new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
      cargo: new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
      docking: new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        wireframe: true,
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
      root: new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    };
    wireMatsRef.current = wireMats;

    // Dual-Layer CAD Highlight: Edges + Wireframe Lattice + Interactive Measurement Raycast Registration
    const addCadHighlight = (mesh, groupKey, threshold = 20) => {
      if (!mesh || !mesh.geometry) return;
      mesh.userData = mesh.userData || {};
      mesh.userData.partGroup = groupKey;
      mesh.userData.partInfo = partInfoMap[groupKey] || partInfoMap.chassis;
      cadInteractiveMeshesRef.current.push(mesh);

      // 1. Sharp silhouette & feature edges with negative polygon offset
      const edges = new THREE.EdgesGeometry(mesh.geometry, threshold);
      const edgeLine = new THREE.LineSegments(edges, edgeMats[groupKey] || edgeMats.root);
      edgeLine.renderOrder = 20;
      mesh.add(edgeLine);

      // 2. Holographic CAD wireframe lattice shell scaled 1.003
      const wireMesh = new THREE.Mesh(mesh.geometry, wireMats[groupKey] || wireMats.root);
      wireMesh.scale.set(1.003, 1.003, 1.003);
      wireMesh.renderOrder = 15;
      mesh.add(wireMesh);
    };

    // Alias for existing call sites
    const addEdgeWire = addCadHighlight;

    // --- Base Chassis Frame (Aluminum Alloy) ---
    const chassisGroup = new THREE.Group();
    robotRoot.add(chassisGroup);

    const frameThickness = 12;
    const frameWidth = 240;
    const frameLength = 260;

    const railMat = materials.chassisTitanium;
    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameThickness, frameLength - 60), railMat);
    leftRail.position.set(-frameWidth / 2 + 6, -30, 0);
    leftRail.castShadow = true;
    addEdgeWire(leftRail, 'chassis');
    chassisGroup.add(leftRail);

    const rightRail = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, frameThickness, frameLength - 60), railMat);
    rightRail.position.set(frameWidth / 2 - 6, -30, 0);
    rightRail.castShadow = true;
    addEdgeWire(rightRail, 'chassis');
    chassisGroup.add(rightRail);

    const frontRail = new THREE.Mesh(new THREE.BoxGeometry(frameWidth - 60, frameThickness, frameThickness), railMat);
    frontRail.position.set(0, -30, frameLength / 2 - 6);
    frontRail.castShadow = true;
    addEdgeWire(frontRail, 'chassis');
    chassisGroup.add(frontRail);

    const backRail = new THREE.Mesh(new THREE.BoxGeometry(frameWidth - 60, frameThickness, frameThickness), railMat);
    backRail.position.set(0, -30, -frameLength / 2 + 6);
    backRail.castShadow = true;
    addEdgeWire(backRail, 'chassis');
    chassisGroup.add(backRail);

    const crossRail = new THREE.Mesh(new THREE.BoxGeometry(frameWidth - 60, frameThickness, frameThickness), railMat);
    crossRail.position.set(0, -30, 0);
    addEdgeWire(crossRail, 'chassis');
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
      addEdgeWire(gusset, 'chassis');
      chassisGroup.add(gusset);
    });

    // --- 4x DC Motors & 4x Omni Wheels at 45° ---
    const motors = [];
    const wheels = [];

    const motorConfigs = [
      { id: 'FL', x: -85, z: 95, angle: -Math.PI / 4 },
      { id: 'FR', x: 85, z: 95, angle: Math.PI / 4 },
      { id: 'RL', x: -85, z: -95, angle: -3 * Math.PI / 4 },
      { id: 'RR', x: 85, z: -95, angle: 3 * Math.PI / 4 },
    ];

    motorConfigs.forEach((cfg) => {
      const motorAssembly = new THREE.Group();
      motorAssembly.position.set(cfg.x, -30, cfg.z);
      motorAssembly.rotation.y = cfg.angle;
      chassisGroup.add(motorAssembly);

      // High-torque DC motor body pointing inward under chassis frame
      const motorBody = new THREE.Mesh(
        new THREE.CylinderGeometry(15, 15, 65, 24),
        materials.motorBody
      );
      motorBody.rotation.x = Math.PI / 2;
      motorBody.position.z = -20;
      motorBody.castShadow = true;
      addEdgeWire(motorBody, 'motors');
      motorAssembly.add(motorBody);

      // Aluminum mounting clamp securing motor to 45° corner frame rail
      const mountBracket = new THREE.Mesh(
        new THREE.BoxGeometry(34, 18, 16),
        materials.chassisTitanium
      );
      mountBracket.position.set(0, 0, 5);
      addEdgeWire(mountBracket, 'chassis');
      motorAssembly.add(mountBracket);

      // Gold output drive shaft pointing outward through corner rail
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 4, 38, 16),
        materials.motorShaft
      );
      shaft.rotation.x = Math.PI / 2;
      shaft.position.z = 24;
      addEdgeWire(shaft, 'motors');
      motorAssembly.add(shaft);

      // Double-row 45° omni wheel assembly mounted at the corner
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(0, 0, 48);
      motorAssembly.add(wheelGroup);

      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(28, 28, 18, 24),
        materials.omniHub
      );
      hub.rotation.x = Math.PI / 2;
      hub.castShadow = true;
      addEdgeWire(hub, 'motors');
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
          roller.userData = {
            partGroup: 'wheels',
            partInfo: partInfoMap.wheels,
          };
          cadInteractiveMeshesRef.current.push(roller);
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
    addEdgeWire(carbonPlate, 'deck');
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
    addEdgeWire(pcb, 'deck');
    pcbGroup.add(pcb);

    // Glowing Arc Core on the Deck
    const arcCore = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 14, 5, 32),
      materials.arcReactorGlow
    );
    arcCore.position.set(0, 4, 0);
    arcCoreRef.current = arcCore;
    addEdgeWire(arcCore, 'deck');
    pcbGroup.add(arcCore);

    const mcuChip = new THREE.Mesh(new THREE.BoxGeometry(28, 5, 28), materials.pcbChip);
    mcuChip.position.set(-40, 4, 0);
    addEdgeWire(mcuChip, 'deck');
    pcbGroup.add(mcuChip);

    const heatsinkMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.88,
      roughness: 0.18,
    });
    const heatsink = new THREE.Mesh(new THREE.BoxGeometry(20, 14, 28), heatsinkMat);
    heatsink.position.set(40, 8, 0);
    addEdgeWire(heatsink, 'deck');
    pcbGroup.add(heatsink);

    // --- 4x Vertical Riser Columns (Aluminum) ---
    const risersGroup = new THREE.Group();
    risersRef.current = risersGroup;
    robotRoot.add(risersGroup);

    const riserPositions = [
      { x: -90, z: 90 },
      { x: 90, z: 90 },
      { x: -90, z: -90 },
      { x: 90, z: -90 },
    ];

    riserPositions.forEach((pos) => {
      // Main load-bearing cylindrical riser column (60mm height, 14mm diameter)
      const riser = new THREE.Mesh(
        new THREE.CylinderGeometry(7, 7, 60, 20),
        materials.riserColumn
      );
      riser.position.set(pos.x, 15, pos.z);
      riser.castShadow = true;
      addEdgeWire(riser, 'risers');
      risersGroup.add(riser);

      // Top mounting flange boss - sits flush against underside of cargo box
      const topFlange = new THREE.Mesh(
        new THREE.CylinderGeometry(11, 11, 2, 20),
        materials.riserColumn
      );
      topFlange.position.set(pos.x, 44, pos.z);
      addEdgeWire(topFlange, 'risers');
      risersGroup.add(topFlange);

      // Bottom mounting flange boss - anchored to chassis frame
      const btmFlange = new THREE.Mesh(
        new THREE.CylinderGeometry(11, 11, 2, 20),
        materials.riserColumn
      );
      btmFlange.position.set(pos.x, -14, pos.z);
      addEdgeWire(btmFlange, 'risers');
      risersGroup.add(btmFlange);
    });

    // --- Upper Payload Cargo Bin (Stark Hot-Rod Crimson Red) ---
    const cargoBinGroup = new THREE.Group();
    cargoBoxRef.current = cargoBinGroup;
    cargoBinGroup.position.set(0, 47, 0);
    robotRoot.add(cargoBinGroup);

    const binBottom = new THREE.Mesh(
      new THREE.BoxGeometry(230, 4, 250),
      materials.cargoBinStark
    );
    binBottom.castShadow = true;
    addEdgeWire(binBottom, 'cargo');
    cargoBinGroup.add(binBottom);

    const wallHeight = 55;
    const wallThick = 4;

    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(230, wallHeight, wallThick), materials.cargoBinStark);
    frontWall.position.set(0, wallHeight / 2, 125);
    addEdgeWire(frontWall, 'cargo');
    cargoBinGroup.add(frontWall);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(230, wallHeight, wallThick), materials.cargoBinStark);
    backWall.position.set(0, wallHeight / 2, -125);
    addEdgeWire(backWall, 'cargo');
    cargoBinGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, 250), materials.cargoBinStark);
    leftWall.position.set(-115, wallHeight / 2, 0);
    addEdgeWire(leftWall, 'cargo');
    cargoBinGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, 250), materials.cargoBinStark);
    rightWall.position.set(115, wallHeight / 2, 0);
    addEdgeWire(rightWall, 'cargo');
    cargoBinGroup.add(rightWall);

    // Gold Rim Trim around Top Edge
    const trimFront = new THREE.Mesh(new THREE.BoxGeometry(232, 2, 6), materials.cargoPayloadGold);
    trimFront.position.set(0, wallHeight, 125);
    addEdgeWire(trimFront, 'cargo');
    cargoBinGroup.add(trimFront);

    // 15kg Vibranium-Gold Cargo Box
    const payloadPkg = new THREE.Mesh(
      new THREE.BoxGeometry(160, 45, 170),
      materials.cargoPayloadGold
    );
    payloadPkg.position.set(0, 25, 0);
    payloadPkg.castShadow = true;
    addEdgeWire(payloadPkg, 'cargo');
    cargoBinGroup.add(payloadPkg);

    // --- Autonomous Docking Datum Module (Laser Alignment & Bay Lock) ---
    const dockingGroup = new THREE.Group();
    dockingGroup.position.set(0, -30, 124);
    robotRoot.add(dockingGroup);

    // CNC-machined aluminum docking receiver bracket mounted on front rail
    const datumBracket = new THREE.Mesh(
      new THREE.BoxGeometry(84, 18, 14),
      materials.dockingHousing
    );
    datumBracket.position.set(0, 4, 7);
    datumBracket.castShadow = true;
    addCadHighlight(datumBracket, 'docking');
    dockingGroup.add(datumBracket);

    // Left optical alignment target lens
    const leftTarget = new THREE.Mesh(
      new THREE.CylinderGeometry(5.5, 5.5, 6, 16),
      materials.dockingTarget
    );
    leftTarget.rotation.x = Math.PI / 2;
    leftTarget.position.set(-26, 4, 14);
    addCadHighlight(leftTarget, 'docking');
    dockingGroup.add(leftTarget);

    // Right optical alignment target lens
    const rightTarget = new THREE.Mesh(
      new THREE.CylinderGeometry(5.5, 5.5, 6, 16),
      materials.dockingTarget
    );
    rightTarget.rotation.x = Math.PI / 2;
    rightTarget.position.set(26, 4, 14);
    addCadHighlight(rightTarget, 'docking');
    dockingGroup.add(rightTarget);

    // Central precision laser datum beacon emitter
    const laserCore = new THREE.Mesh(
      new THREE.CylinderGeometry(4.5, 4.5, 8, 20),
      materials.dockingLaser
    );
    laserCore.rotation.x = Math.PI / 2;
    laserCore.position.set(0, 4, 15);
    addCadHighlight(laserCore, 'docking');
    dockingGroup.add(laserCore);

    // Dual forward-facing docking lock guide pins
    [-14, 14].forEach((xOff) => {
      const pin = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 2.5, 14, 12),
        materials.chassisTitanium
      );
      pin.rotation.x = Math.PI / 2;
      pin.position.set(xOff, 4, 18);
      addCadHighlight(pin, 'docking');
      dockingGroup.add(pin);
    });

    // --- 3D Dimension Annotation Lines (`↔ 260 mm`) ---
    const dimsGroup = new THREE.Group();
    dimsGroup.visible = showDims;
    dimsGroupRef.current = dimsGroup;
    robotRoot.add(dimsGroup);

    const dimPoints = [
      new THREE.Vector3(-115, 108, 0),
      new THREE.Vector3(115, 108, 0),
    ];
    const dimGeo = new THREE.BufferGeometry().setFromPoints(dimPoints);
    const dimLine = new THREE.Line(dimGeo, materials.dimLineMat);
    dimsGroup.add(dimLine);

    const leftTick = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-115, 100, 0), new THREE.Vector3(-115, 116, 0)]),
      materials.dimLineMat
    );
    dimsGroup.add(leftTick);

    const rightTick = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(115, 100, 0), new THREE.Vector3(115, 116, 0)]),
      materials.dimLineMat
    );
    dimsGroup.add(rightTick);

    // --- 3D Interactive Caliper Measurement Group ---
    const caliperGroup = new THREE.Group();
    caliperGroup.visible = false;
    caliperGroupRef.current = caliperGroup;
    robotRoot.add(caliperGroup);

    // --- 3D Holographic Callout Target Beacon with Concentric Reticle Rings ---
    const beaconGroup = new THREE.Group();
    beaconGroupRef.current = beaconGroup;
    robotRoot.add(beaconGroup);

    const beaconPulseRing = new THREE.Mesh(
      new THREE.RingGeometry(8, 10.5, 32),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthTest: false })
    );
    beaconPulseRing.renderOrder = 999;
    beaconGroup.add(beaconPulseRing);

    const beaconOuterRing = new THREE.Mesh(
      new THREE.RingGeometry(18, 19.5, 32),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.55, depthTest: false })
    );
    beaconOuterRing.renderOrder = 999;
    beaconGroup.add(beaconOuterRing);

    const beaconCenterDot = new THREE.Mesh(
      new THREE.CircleGeometry(3.5, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 1.0, depthTest: false })
    );
    beaconCenterDot.renderOrder = 1000;
    beaconGroup.add(beaconCenterDot);

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

      // Solid Assembly: Robot parts remain fully assembled (zero explosion)
      if (cargoBoxRef.current && risersRef.current && deckRef.current) {
        cargoBoxRef.current.position.y = 47;
        risersRef.current.position.y = 0;
        deckRef.current.position.y = -18;
      }

      // Gentle Arc Reactor breathing pulse
      if (arcCoreRef.current) {
        const pulse = 1.0 + Math.sin(elapsed * 4) * 0.35;
        materials.arcReactorGlow.emissiveIntensity = pulse;
      }

      // 1. Simulation progress along trajectory driven by scroll
      const rawScroll = Math.max(0, Math.min(1, scrollProgressRef.current || 0));
      // Smoothly interpolate scroll progress for silky physics
      simProgressRef.current += (rawScroll - simProgressRef.current) * 0.08;
      const s = simProgressRef.current;

      // Camera Zoom Factor Choreography:
      // - s in [0, 0.12]: zooms in from overview (radius 3900) to max zoom (radius 1480, matching user screenshot)
      // - s in [0.12, 0.78]: robot travels along path and reaches destination dock
      // - s in [0.78, 0.83]: robot stays docked at destination dock with callout active
      // - s in [0.83, 0.96]: camera smoothly zooms back OUT to wide overview ("zoom out like before on next scroll")
      // - s in [0.96, 1.0]: wide arena overview; on next scroll smoothly rolls into next section
      const zoomIn = THREE.MathUtils.smoothstep(s, 0.0, 0.12);
      const zoomOut = THREE.MathUtils.smoothstep(s, 0.83, 0.96);
      const zoomBlend = freeOrbit ? 1.0 : zoomIn * (1.0 - zoomOut);

      // Path Movement: robot stays at start depot (s <= 0.12)
      // then accelerates and travels smoothly along path to destination dock (s in [0.12, 0.78])
      const pathP = s <= 0.12 ? 0 : Math.min(1, (s - 0.12) / 0.66);
      const prevPathP = robotPathProgressRef.current || 0;
      robotPathProgressRef.current = pathP;
      const pathDelta = pathP - prevPathP;

      // 2. Wheels physically rotate when the robot is moving along the path
      if (Math.abs(pathDelta) > 0.00002) {
        wheelVelocityRef.current = pathDelta * 195;
      } else {
        wheelVelocityRef.current *= 0.82;
      }

      const wheelSpeedMag = Math.abs(wheelVelocityRef.current);
      if (wheelSpeedMag > 0.0001) {
        wheels.forEach((w) => {
          w.rotation.z += wheelVelocityRef.current;
        });
      }

      // Audio: wheel moving sound modulated by scroll velocity
      wheelAudio.setSpeed('scroll', wheelSpeedMag * 1.5);

      // 3. Drive robot along Catmull-Rom simulation path
      const robotPos = simPath.getPointAt(pathP);
      robotRoot.position.set(robotPos.x, 0, robotPos.z);

      // 4. Realistic steering yaw aligned with path curve at all times
      const tangent = simPath.getTangentAt(pathP);
      const pathHeading = Math.atan2(tangent.x, tangent.z);
      robotRoot.rotation.y = pathHeading;
      robotRoot.updateMatrixWorld(true);

      // 5. Cinematic Camera:
      // In overview (zoomBlend = 0): camera is at overview coordinates looking at arena center
      // On scroll: smoothly tracks the robot without zooming in more than 1480
      const overviewCenter = new THREE.Vector3(0, 15, -100);
      const robotCenter = new THREE.Vector3(robotPos.x, robotPos.y + 15, robotPos.z);
      const targetCenter = new THREE.Vector3().lerpVectors(overviewCenter, robotCenter, zoomBlend);

      const overviewRadius = 3900;
      const overviewPhi = 45 * Math.PI / 180;   // 0.785 rad
      const overviewTheta = -20 * Math.PI / 180; // -0.349 rad

      // Never zoom closer than 1480 (preserves user screenshot zoom distance exactly)
      const targetRadius = Math.max(1480, orb.radius);
      const effectiveRadius = THREE.MathUtils.lerp(overviewRadius, targetRadius, zoomBlend);
      const effectivePhi = THREE.MathUtils.lerp(overviewPhi, orb.phi, zoomBlend);
      const effectiveTheta = THREE.MathUtils.lerp(overviewTheta, orb.theta, zoomBlend);

      const clampedPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, effectivePhi));
      const cx = targetCenter.x + effectiveRadius * Math.sin(clampedPhi) * Math.sin(effectiveTheta);
      const cy = targetCenter.y + effectiveRadius * Math.cos(clampedPhi);
      const cz = targetCenter.z + effectiveRadius * Math.sin(clampedPhi) * Math.cos(effectiveTheta);

      camera.position.set(cx, cy, cz);
      camera.lookAt(targetCenter);

      // 3D-to-2D CAD Callout Leader Line projection & Part Highlighting
      const curSteps = stepsRef.current || [];
      const curStepIdx = activeStepRef.current || 0;
      const curStep = curSteps[curStepIdx] || curSteps[0];

      // Smoothly fade in callout card and 3D part highlights as camera zooms in onto the model
      const cardOpacity = zoomBlend > 0.4 ? Math.min(1, (zoomBlend - 0.4) / 0.4) : 0;

      // 6. Dynamic 3D CAD Component Highlighting on Model
      // When the CAD callout card is highlighting a component or user is hovering in Dims mode, illuminate that specific part!
      const isDimHover = Boolean(showDims && hoveredPartRef.current);
      const activePart = (showDims && hoveredPartRef.current)
        ? hoveredPartRef.current.group
        : (curStep?.partGroup || 'root');

      const targetHighlights = {
        chassis: (activePart === 'chassis' && (cardOpacity > 0.05 || isDimHover)) ? (isDimHover ? 1.0 : cardOpacity) : 0,
        motors: ((activePart === 'motors' || activePart === 'wheels') && (cardOpacity > 0.05 || isDimHover)) ? (isDimHover ? 1.0 : cardOpacity) : 0,
        deck: (activePart === 'deck' && (cardOpacity > 0.05 || isDimHover)) ? (isDimHover ? 1.0 : cardOpacity) : 0,
        risers: (activePart === 'risers' && (cardOpacity > 0.05 || isDimHover)) ? (isDimHover ? 1.0 : cardOpacity) : 0,
        cargo: (activePart === 'cargo' && (cardOpacity > 0.05 || isDimHover)) ? (isDimHover ? 1.0 : cardOpacity) : 0,
        docking: (activePart === 'docking' && (cardOpacity > 0.05 || isDimHover)) ? (isDimHover ? 1.0 : cardOpacity) : 0,
        root: (activePart === 'root' && cardOpacity > 0.05 && !isDimHover) ? cardOpacity : 0,
      };

      const hl = highlightsRef.current;
      hl.chassis += (targetHighlights.chassis - hl.chassis) * 0.16;
      hl.motors += (targetHighlights.motors - hl.motors) * 0.16;
      hl.deck += (targetHighlights.deck - hl.deck) * 0.16;
      hl.risers += (targetHighlights.risers - hl.risers) * 0.16;
      hl.cargo += (targetHighlights.cargo - hl.cargo) * 0.16;
      hl.docking += (targetHighlights.docking - hl.docking) * 0.16;
      hl.root += (targetHighlights.root - hl.root) * 0.16;

      const hlPulse = 0.70 + 0.30 * Math.sin(elapsed * 5.5);

      // Dynamic Edge & Wireframe Lattice Opacities for Razor-Sharp CAD Highlighting
      const highlightGroups = ['chassis', 'motors', 'deck', 'risers', 'cargo', 'docking'];
      highlightGroups.forEach((g) => {
        const val = hl[g] * hlPulse;
        if (edgeMatsRef.current[g]) edgeMatsRef.current[g].opacity = val;
        if (wireMatsRef.current[g]) wireMatsRef.current[g].opacity = val * 0.85;
      });
      // Global digital twin holographic wireframe on step 00
      if (edgeMatsRef.current.root) edgeMatsRef.current.root.opacity = hl.root * hlPulse * 0.45;
      if (wireMatsRef.current.root) wireMatsRef.current.root.opacity = hl.root * hlPulse * 0.35;

      // Surface Emissive Highlighting: High-contrast Electric Cyan & Emerald Green for instant visibility
      // 1. Chassis frame rails & 45° corner gussets
      if (hl.chassis > 0.01) {
        materials.chassisTitanium.emissive.setHex(0x00f0ff);
        materials.chassisTitanium.emissiveIntensity = hl.chassis * hlPulse * 1.5;
      } else {
        materials.chassisTitanium.emissive.setHex(0x000000);
        materials.chassisTitanium.emissiveIntensity = 0;
      }

      // 2. Motors & omni drivetrain (4x planetary motors + 4x 45° omni wheels)
      if (hl.motors > 0.01) {
        materials.motorBody.emissive.setHex(0x00f0ff);
        materials.motorBody.emissiveIntensity = hl.motors * hlPulse * 1.6;
        materials.omniHub.emissive.setHex(0x00f0ff);
        materials.omniHub.emissiveIntensity = hl.motors * hlPulse * 1.6;
        materials.motorShaft.emissive.setHex(0x00f0ff);
        materials.motorShaft.emissiveIntensity = hl.motors * hlPulse * 1.5;
        materials.omniRoller.emissive.setHex(0x00b4d8);
        materials.omniRoller.emissiveIntensity = hl.motors * hlPulse * 1.0;
      } else {
        materials.motorBody.emissive.setHex(0x000000);
        materials.motorBody.emissiveIntensity = 0;
        materials.omniHub.emissive.setHex(0x000000);
        materials.omniHub.emissiveIntensity = 0;
        materials.motorShaft.emissive.setHex(0x000000);
        materials.motorShaft.emissiveIntensity = 0;
        materials.omniRoller.emissive.setHex(0x000000);
        materials.omniRoller.emissiveIntensity = 0;
      }

      // 3. Carbon base deck, PCB board & electronics odometry
      if (hl.deck > 0.01) {
        materials.deckCarbon.emissive.setHex(0x00f0ff);
        materials.deckCarbon.emissiveIntensity = hl.deck * hlPulse * 1.0;
        materials.pcbBoard.emissive.setHex(0x00f0ff);
        materials.pcbBoard.emissiveIntensity = hl.deck * hlPulse * 1.8;
        materials.pcbChip.emissive.setHex(0x00f0ff);
        materials.pcbChip.emissiveIntensity = hl.deck * hlPulse * 1.5;
      } else {
        materials.deckCarbon.emissive.setHex(0x000000);
        materials.deckCarbon.emissiveIntensity = 0;
        materials.pcbBoard.emissive.setHex(0x000000);
        materials.pcbBoard.emissiveIntensity = 0;
        materials.pcbChip.emissive.setHex(0x000000);
        materials.pcbChip.emissiveIntensity = 0;
      }

      // 4. 4x Load-bearing Aluminum Riser Columns
      if (hl.risers > 0.01) {
        materials.riserColumn.emissive.setHex(0x00f0ff);
        materials.riserColumn.emissiveIntensity = hl.risers * hlPulse * 1.8;
      } else {
        materials.riserColumn.emissive.setHex(0x000000);
        materials.riserColumn.emissiveIntensity = 0;
      }

      // 5. Cargo containment bin (Crimson) & 15kg Vibranium payload (Gold)
      if (hl.cargo > 0.01) {
        materials.cargoBinStark.emissive.setHex(0x00f0ff);
        materials.cargoBinStark.emissiveIntensity = hl.cargo * hlPulse * 1.6;
        materials.cargoPayloadGold.emissive.setHex(0x00f0ff);
        materials.cargoPayloadGold.emissiveIntensity = hl.cargo * hlPulse * 1.8;
      } else {
        materials.cargoBinStark.emissive.setHex(0x000000);
        materials.cargoBinStark.emissiveIntensity = 0;
        materials.cargoPayloadGold.emissive.setHex(0x000000);
        materials.cargoPayloadGold.emissiveIntensity = 0;
      }

      // 6. Autonomous Docking Datum Module & Front Alignment Rail
      if (hl.docking > 0.01) {
        materials.dockingHousing.emissive.setHex(0x22c55e);
        materials.dockingHousing.emissiveIntensity = hl.docking * hlPulse * 2.0;
        materials.dockingLaser.emissive.setHex(0x00ff88);
        materials.dockingLaser.emissiveIntensity = hl.docking * hlPulse * 2.8;
        materials.dockingTarget.emissive.setHex(0x22c55e);
        materials.dockingTarget.emissiveIntensity = hl.docking * hlPulse * 2.2;
      } else {
        materials.dockingHousing.emissive.setHex(0x000000);
        materials.dockingHousing.emissiveIntensity = 0;
        materials.dockingLaser.emissive.setHex(0x22c55e);
        materials.dockingLaser.emissiveIntensity = 1.2;
        materials.dockingTarget.emissive.setHex(0x000000);
        materials.dockingTarget.emissiveIntensity = 0;
      }

      // Step 00 Digital Twin Arc Core Boost
      if (hl.root > 0.01) {
        materials.arcReactorGlow.emissiveIntensity = 1.2 + hl.root * hlPulse * 1.8;
      }

      if (beaconGroupRef.current) {
        beaconGroupRef.current.visible = cardOpacity > 0.05;
        const isDocking = activePart === 'docking';
        const beaconColor = isDocking ? 0x22c55e : 0x00f0ff;
        beaconPulseRing.material.color.setHex(beaconColor);
        if (beaconOuterRing) beaconOuterRing.material.color.setHex(beaconColor);
      }

      if (curStep && curStep.anchor && container && camera && cardOpacity > 0.05) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w > 0 && h > 0) {
          const raw = curStep.anchor;
          const v = new THREE.Vector3(raw.x, raw.y, raw.z);

          if (beaconGroupRef.current) {
            beaconGroupRef.current.position.copy(v);
            beaconPulseRing.quaternion.copy(camera.quaternion);
            if (beaconOuterRing) beaconOuterRing.quaternion.copy(camera.quaternion);
            beaconCenterDot.quaternion.copy(camera.quaternion);
            const beaconScale = 1.0 + 0.25 * Math.sin(elapsed * 6);
            beaconPulseRing.scale.set(beaconScale, beaconScale, 1);
            if (beaconOuterRing) {
              const outerScale = 1.0 + 0.15 * Math.cos(elapsed * 4);
              beaconOuterRing.scale.set(outerScale, outerScale, 1);
            }
          }

          // Transform to world space
          if (robotRootRef.current) {
            v.applyMatrix4(robotRootRef.current.matrixWorld);
          }

          // Project to NDC (-1 to 1)
          v.project(camera);

          if (v.z < 1) {
            const ax = (v.x * 0.5 + 0.5) * w;
            const ay = (-v.y * 0.5 + 0.5) * h;

            const isMobile = w < 768;
            const cardW = isMobile ? Math.min(210, w - 28) : 230;
            const cardH = isMobile ? 80 : 88;

            const isLeft = ax > (w > 992 ? w - 280 : w) * 0.45;
            const dirX = isLeft ? -1 : 1;

            const elbowDistX = isMobile ? 24 : 40;
            const elbowDistY = ay > h * 0.5 ? (isMobile ? -28 : -38) : (isMobile ? 28 : 38);

            let ey = ay + elbowDistY;
            // Prevent card from clipping top or bottom screen boundaries
            ey = Math.max(cardH + 75, Math.min(h - 85, ey));
            let ex = ax + dirX * elbowDistX;
            let sx = ex + dirX * cardW;

            // Card rests directly on top of the horizontal shelf line
            let cardX = isLeft ? sx : ex;
            // Responsive mobile clamping: card stays strictly inside screen margins
            if (cardX < 12) {
              const shift = 12 - cardX;
              cardX += shift;
              sx += shift;
              ex += shift;
            } else if (cardX + cardW > w - 12) {
              const shift = (cardX + cardW) - (w - 12);
              cardX -= shift;
              sx -= shift;
              ex -= shift;
            }
            const cardY = ey - cardH - 2;

            if (linePathRef.current && reticleDotRef.current && cardRef.current) {
              reticleDotRef.current.setAttribute('cx', ax);
              reticleDotRef.current.setAttribute('cy', ay);
              reticleDotRef.current.style.fill = activePart === 'docking' ? '#22c55e' : '#00f0ff';
              if (reticlePulseRef.current) {
                reticlePulseRef.current.setAttribute('cx', ax);
                reticlePulseRef.current.setAttribute('cy', ay);
                reticlePulseRef.current.style.stroke = activePart === 'docking' ? '#22c55e' : '#00f0ff';
              }
              if (terminalDotRef.current) {
                terminalDotRef.current.setAttribute('cx', sx);
                terminalDotRef.current.setAttribute('cy', ey);
              }

              if (crosshairsRef.current[0]) {
                crosshairsRef.current[0].setAttribute('x1', ax - 12);
                crosshairsRef.current[0].setAttribute('y1', ay);
                crosshairsRef.current[0].setAttribute('x2', ax - 5);
                crosshairsRef.current[0].setAttribute('y2', ay);
              }
              if (crosshairsRef.current[1]) {
                crosshairsRef.current[1].setAttribute('x1', ax + 5);
                crosshairsRef.current[1].setAttribute('y1', ay);
                crosshairsRef.current[1].setAttribute('x2', ax + 12);
                crosshairsRef.current[1].setAttribute('y2', ay);
              }
              if (crosshairsRef.current[2]) {
                crosshairsRef.current[2].setAttribute('x1', ax);
                crosshairsRef.current[2].setAttribute('y1', ay - 12);
                crosshairsRef.current[2].setAttribute('x2', ax);
                crosshairsRef.current[2].setAttribute('y2', ay - 5);
              }
              if (crosshairsRef.current[3]) {
                crosshairsRef.current[3].setAttribute('x1', ax);
                crosshairsRef.current[3].setAttribute('y1', ay + 5);
                crosshairsRef.current[3].setAttribute('x2', ax);
                crosshairsRef.current[3].setAttribute('y2', ay + 12);
              }

              // Leader line: Anchor -> Elbow -> Underline shelf
              linePathRef.current.setAttribute('d', `M ${ax} ${ay} L ${ex} ${ey} L ${sx} ${ey}`);
              cardRef.current.style.transform = `translate3d(${cardX}px, ${cardY}px, 0)`;
              cardRef.current.style.opacity = `${cardOpacity}`;
              if (calloutSvgRef.current) calloutSvgRef.current.style.opacity = `${cardOpacity}`;
            }
          } else {
            if (cardRef.current) cardRef.current.style.opacity = '0';
            if (calloutSvgRef.current) calloutSvgRef.current.style.opacity = '0';
          }
        }
      } else {
        if (cardRef.current) cardRef.current.style.opacity = '0';
        if (calloutSvgRef.current) calloutSvgRef.current.style.opacity = '0';
      }

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
      wheelAudio.setSpeed('scroll', 0);
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

  // 3D Caliper helpers for interactive part dimension inspection
  const clear3DCaliper = () => {
    if (!caliperGroupRef.current) return;
    const cg = caliperGroupRef.current;
    while (cg.children.length > 0) {
      const child = cg.children[0];
      cg.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }
    cg.visible = false;
  };

  const update3DCaliper = (targetMesh) => {
    if (!caliperGroupRef.current || !robotRootRef.current || !targetMesh) return;
    clear3DCaliper();

    const cg = caliperGroupRef.current;
    const root = robotRootRef.current;

    const box = new THREE.Box3();
    targetMesh.updateWorldMatrix(true, false);
    box.setFromObject(targetMesh);

    if (box.isEmpty()) return;

    // Transform world bounding box to robotRoot local space
    const invRoot = root.matrixWorld.clone().invert();
    box.applyMatrix4(invRoot);

    const pad = 2.0;
    const min = box.min.clone().subScalar(pad);
    const max = box.max.clone().addScalar(pad);
    const dx = max.x - min.x;
    const dy = max.y - min.y;
    const dz = max.z - min.z;

    const cornerLen = Math.max(3.5, Math.min(16, Math.min(dx, dy, dz) * 0.3));

    // Corner brackets line segments
    const cornerPts = [];
    const corners = [
      new THREE.Vector3(min.x, min.y, min.z),
      new THREE.Vector3(max.x, min.y, min.z),
      new THREE.Vector3(min.x, max.y, min.z),
      new THREE.Vector3(max.x, max.y, min.z),
      new THREE.Vector3(min.x, min.y, max.z),
      new THREE.Vector3(max.x, min.y, max.z),
      new THREE.Vector3(min.x, max.y, max.z),
      new THREE.Vector3(max.x, max.y, max.z),
    ];

    corners.forEach((c) => {
      const sx = c.x === min.x ? 1 : -1;
      const sy = c.y === min.y ? 1 : -1;
      const sz = c.z === min.z ? 1 : -1;

      cornerPts.push(c.clone(), new THREE.Vector3(c.x + sx * cornerLen, c.y, c.z));
      cornerPts.push(c.clone(), new THREE.Vector3(c.x, c.y + sy * cornerLen, c.z));
      cornerPts.push(c.clone(), new THREE.Vector3(c.x, c.y, c.z + sz * cornerLen));
    });

    const cornerGeom = new THREE.BufferGeometry().setFromPoints(cornerPts);
    const cornerMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
    });
    const cornerLines = new THREE.LineSegments(cornerGeom, cornerMat);
    cornerLines.renderOrder = 998;
    cg.add(cornerLines);

    // Dimension caliper lines along X (width) and Y (height)
    const caliperPts = [];
    const tickLen = 6.0;

    // Top X-dimension caliper line
    const yOffset = max.y + 10;
    const zPlane = max.z + 2;
    caliperPts.push(new THREE.Vector3(min.x, yOffset, zPlane), new THREE.Vector3(max.x, yOffset, zPlane));
    caliperPts.push(new THREE.Vector3(min.x, yOffset - tickLen / 2, zPlane), new THREE.Vector3(min.x, yOffset + tickLen / 2, zPlane));
    caliperPts.push(new THREE.Vector3(max.x, yOffset - tickLen / 2, zPlane), new THREE.Vector3(max.x, yOffset + tickLen / 2, zPlane));

    // Right Y-dimension caliper line
    const xOffset = max.x + 10;
    caliperPts.push(new THREE.Vector3(xOffset, min.y, zPlane), new THREE.Vector3(xOffset, max.y, zPlane));
    caliperPts.push(new THREE.Vector3(xOffset - tickLen / 2, min.y, zPlane), new THREE.Vector3(xOffset + tickLen / 2, min.y, zPlane));
    caliperPts.push(new THREE.Vector3(xOffset - tickLen / 2, max.y, zPlane), new THREE.Vector3(xOffset + tickLen / 2, max.y, zPlane));

    const caliperGeom = new THREE.BufferGeometry().setFromPoints(caliperPts);
    const caliperMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
      depthTest: false,
    });
    const caliperLines = new THREE.LineSegments(caliperGeom, caliperMat);
    caliperLines.renderOrder = 999;
    cg.add(caliperLines);

    cg.visible = true;
  };

  // Dimension lines & hover state reset
  useEffect(() => {
    if (dimsGroupRef.current) {
      dimsGroupRef.current.visible = showDims;
    }
    if (!showDims) {
      hoveredPartRef.current = null;
      setHoveredPart(null);
      clear3DCaliper();
    }
  }, [showDims]);

  // Mouse Interaction handlers
  const handleMouseDown = (e) => {
    orbitRef.current.isDragging = true;
    orbitRef.current.prevX = e.clientX;
    orbitRef.current.prevY = e.clientY;
  };

  const handleMouseMove = (e) => {
    if (orbitRef.current.isDragging) {
      const deltaX = e.clientX - orbitRef.current.prevX;
      const deltaY = e.clientY - orbitRef.current.prevY;
      orbitRef.current.prevX = e.clientX;
      orbitRef.current.prevY = e.clientY;

      orbitRef.current.targetTheta -= deltaX * 0.008;
      orbitRef.current.targetPhi -= deltaY * 0.008;
      return;
    }

    if (!showDims) {
      if (hoveredPartRef.current) {
        hoveredPartRef.current = null;
        setHoveredPart(null);
        clear3DCaliper();
      }
      return;
    }

    const container = mountRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Direct tooltip positioning at 60 FPS
    if (dimTooltipRef.current) {
      const padX = 18;
      const padY = 18;
      const tipX = mouseX + 310 > rect.width ? Math.max(12, mouseX - 310) : mouseX + padX;
      const tipY = mouseY + 180 > rect.height ? Math.max(12, mouseY - 170) : mouseY + padY;
      dimTooltipRef.current.style.transform = `translate3d(${tipX}px, ${tipY}px, 0)`;
    }

    // Raycast against registered CAD interactive meshes
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = raycasterRef.current;
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

    const interactiveList = cadInteractiveMeshesRef.current || [];
    const intersects = raycaster.intersectObjects(interactiveList, false);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const partInfo = hit.object?.userData?.partInfo;
      if (partInfo) {
        if (!hoveredPartRef.current || hoveredPartRef.current.name !== partInfo.name) {
          hoveredPartRef.current = partInfo;
          setHoveredPart(partInfo);
          update3DCaliper(hit.object);
        }
        return;
      }
    }

    if (hoveredPartRef.current) {
      hoveredPartRef.current = null;
      setHoveredPart(null);
      clear3DCaliper();
    }
  };

  const handleMouseUp = () => {
    orbitRef.current.isDragging = false;
  };

  const handleMouseLeave = () => {
    orbitRef.current.isDragging = false;
    if (hoveredPartRef.current) {
      hoveredPartRef.current = null;
      setHoveredPart(null);
      clear3DCaliper();
    }
  };

  const handleWheel = (e) => {
    if (!freeOrbit) return;
    e.preventDefault();
    orbitRef.current.targetRadius += e.deltaY * 0.35;
    orbitRef.current.targetRadius = Math.max(1450, Math.min(3900, orbitRef.current.targetRadius));
  };

  const currentStep = steps[activeStep] || steps[0] || {};

  return (
    <div
      className="hero-cad-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      style={{
        cursor: showDims
          ? 'crosshair'
          : (freeOrbit ? (orbitRef.current.isDragging ? 'grabbing' : 'grab') : 'default')
      }}
    >
      {/* 3D Canvas Mount Container */}
      <div
        ref={mountRef}
        className="hero-cad-canvas-mount"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Guide Banner when Dims mode is ON */}
      {showDims && (
        <div className="cad-dims-guide-indicator mono">
          <span className="dims-pulse-dot" />
          <span>INSPECTION MODE: HOVER OVER ANY CAD PART FOR EXACT DIMENSIONS</span>
        </div>
      )}

      {/* 2D Floating Precision Dimension Tooltip on Hover */}
      {showDims && hoveredPart && (
        <div ref={dimTooltipRef} className="cad-dimension-tooltip">
          <div className="dim-tooltip-header">
            <span className="dim-tooltip-code mono">[{hoveredPart.code}]</span>
            <span className="dim-tooltip-title">{hoveredPart.name}</span>
          </div>
          <div className="dim-tooltip-measure-box">
            <span className="dim-measure-label mono">MEASURED ENVELOPE (XYZ)</span>
            <span className="dim-measure-val mono">{hoveredPart.dims}</span>
          </div>
          <div className="dim-tooltip-specs">
            <div className="dim-spec-row">
              <span className="dim-spec-key mono">SPEC:</span>
              <span className="dim-spec-val">{hoveredPart.spec}</span>
            </div>
            <div className="dim-spec-row">
              <span className="dim-spec-key mono">MATERIAL:</span>
              <span className="dim-spec-val">{hoveredPart.material}</span>
            </div>
            <div className="dim-spec-row">
              <span className="dim-spec-key mono">DATUM:</span>
              <span className="dim-spec-val mono">{hoveredPart.datum}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2D Projected CAD Callout Leader Line Overlay */}
      <div className="cad-callout-overlay">
        <svg ref={calloutSvgRef} className="cad-callout-svg">
          {/* Pulsing reticle ring on 3D anchor point */}
          <circle ref={reticlePulseRef} cx="-100" cy="-100" r="10" className="callout-reticle-pulse" />
          {/* Target bead */}
          <circle ref={reticleDotRef} cx="-100" cy="-100" r="3.5" className="callout-reticle-dot" />
          {/* Crosshairs */}
          <line ref={(el) => (crosshairsRef.current[0] = el)} className="callout-crosshair" />
          <line ref={(el) => (crosshairsRef.current[1] = el)} className="callout-crosshair" />
          <line ref={(el) => (crosshairsRef.current[2] = el)} className="callout-crosshair" />
          <line ref={(el) => (crosshairsRef.current[3] = el)} className="callout-crosshair" />
          {/* Technical CAD Leader Path */}
          <path ref={linePathRef} d="" className="callout-leader-line" />
          {/* Terminal dot on shelf line */}
          <circle ref={terminalDotRef} cx="-100" cy="-100" r="2.5" className="callout-terminal-dot" />
        </svg>

        {/* Minimalist CAD Architectural Datum Card */}
        <div ref={cardRef} className="cad-callout-card">
          <div className="callout-top-row mono">
            <span className="callout-step-num">[{currentStep.label || '00'}]</span>
            <span className="callout-comp-name">{currentStep.shortTitle || currentStep.title}</span>
          </div>
          <div className="callout-desc-clean">{currentStep.desc}</div>
          {currentStep.spec && (
            <div className="callout-datum-spec mono">
              <span className="datum-prefix">SPEC //</span>
              <span className="datum-val">{currentStep.spec}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
