import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RiskScores, VitalsSnapshot } from '../types';
import { RotateCw, Eye, Scan, Maximize2, ShieldAlert, Heart, Brain, Activity } from 'lucide-react';

interface HologramViewer3DProps {
  riskScores: RiskScores;
  vitals: VitalsSnapshot;
  selectedZone: string | null;
  onSelectZone: (zone: string | null) => void;
}

interface BeaconConfig {
  id: string;
  name: string;
  label: string;
  position: [number, number, number];
  targetRadius: number;
  getScore: (scores: RiskScores) => number;
}

// Exactly calibrated for full-body view (scale 1.32)
const BEACONS: BeaconConfig[] = [
  {
    id: 'neurological',
    name: 'Cranial / Neurological',
    label: 'BRAIN / COGNITIVE',
    position: [0, 0.58, 0.11],
    targetRadius: 0.14,
    getScore: (s) => s.behavioral_health,
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular Core',
    label: 'CARDIAC / THORAX',
    position: [0.03, 0.25, 0.11],
    targetRadius: 0.15,
    getScore: (s) => s.cardiovascular,
  },
  {
    id: 'immune_radiation',
    name: 'Immune & Radiation Core',
    label: 'LYMPH / METABOLIC',
    position: [0, 0.03, 0.10],
    targetRadius: 0.16,
    getScore: (s) => s.immune_radiation,
  },
  {
    id: 'musculoskeletal',
    name: 'Musculoskeletal Axis',
    label: 'SPINE / BONE LOAD',
    position: [0, -0.32, 0.08],
    targetRadius: 0.17,
    getScore: (s) => s.bone_musculoskeletal,
  },
];

export const HologramViewer3D: React.FC<HologramViewer3DProps> = ({
  riskScores,
  vitals,
  selectedZone,
  onSelectZone,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [scanActive, setScanActive] = useState<boolean>(true);
  const [wireframeMode, setWireframeMode] = useState<'both' | 'wireframe' | 'solid'>('both');
  const [hoveredBeacon, setHoveredBeacon] = useState<string | null>(null);

  // References for animation loop
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const autoRotateRef = useRef<boolean>(autoRotate);
  const scanActiveRef = useRef<boolean>(scanActive);
  const wireframeModeRef = useRef<'both' | 'wireframe' | 'solid'>(wireframeMode);
  const selectedZoneRef = useRef<string | null>(selectedZone);
  const riskScoresRef = useRef<RiskScores>(riskScores);
  const vitalsRef = useRef<VitalsSnapshot>(vitals);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  useEffect(() => {
    scanActiveRef.current = scanActive;
  }, [scanActive]);

  useEffect(() => {
    wireframeModeRef.current = wireframeMode;
  }, [wireframeMode]);

  useEffect(() => {
    selectedZoneRef.current = selectedZone;
  }, [selectedZone]);

  useEffect(() => {
    riskScoresRef.current = riskScores;
  }, [riskScores]);

  useEffect(() => {
    vitalsRef.current = vitals;
  }, [vitals]);

  // Reset view to default front-facing camera
  const handleResetCamera = useCallback(() => {
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.reset();
      cameraRef.current.position.set(0, -0.05, 4.0);
      controlsRef.current.target.set(0, -0.05, 0);
      controlsRef.current.update();
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- 1. THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 520;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0, -0.05, 4.0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.2;
    controls.maxDistance = 5.2;
    controls.maxPolarAngle = Math.PI / 1.75;
    controls.minPolarAngle = Math.PI / 3.4;
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 1.0;
    controls.target.set(0, -0.05, 0);
    controlsRef.current = controls;

    // --- 2. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x061e38, 2.2);
    scene.add(ambientLight);

    const rimLight1 = new THREE.DirectionalLight(0x00e5ff, 3.5);
    rimLight1.position.set(2.5, 3.0, 3.0);
    scene.add(rimLight1);

    const rimLight2 = new THREE.DirectionalLight(0x0284c7, 3.0);
    rimLight2.position.set(-2.5, -1.0, -3.0);
    scene.add(rimLight2);

    const coreLight = new THREE.PointLight(0x38bdf8, 2.0, 5);
    coreLight.position.set(0, 0.15, 1.0);
    scene.add(coreLight);

    // --- 3. HOLOGRAPHIC SCANNER CYLINDER & RINGS (Matching Reference Image) ---
    const chamberGroup = new THREE.Group();
    scene.add(chamberGroup);

    // 5 Glowing Concentric Scanner Rings
    const ringHeights = [0.74, 0.28, -0.02, -0.34, -0.70];
    const ringRadii = [0.38, 0.42, 0.40, 0.36, 0.32];
    const ringMeshes: THREE.Mesh[] = [];

    ringHeights.forEach((y, idx) => {
      const radius = ringRadii[idx];
      // Thin luminous core ring
      const torusGeo = new THREE.TorusGeometry(radius, 0.003, 16, 90);
      const torusMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.88,
        blending: THREE.AdditiveBlending,
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = Math.PI / 2;
      torus.position.y = y;
      chamberGroup.add(torus);
      ringMeshes.push(torus);

      // Outer soft glow halo (hollow round tube, zero flat disc)
      const glowGeo = new THREE.TorusGeometry(radius, 0.007, 16, 90);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.rotation.x = Math.PI / 2;
      glowMesh.position.y = y;
      chamberGroup.add(glowMesh);
    });

    // Vertical Radiant Laser Columns (Matching Reference Image)
    const beamCount = 16;
    const beamRadius = 0.41;
    const beamLines: THREE.Line[] = [];

    for (let i = 0; i < beamCount; i++) {
      const angle = (i / beamCount) * Math.PI * 2;
      const x = Math.cos(angle) * beamRadius;
      const z = Math.sin(angle) * beamRadius;

      const points = [
        new THREE.Vector3(x, -0.76, z),
        new THREE.Vector3(x, 0.80, z),
      ];
      const beamGeo = new THREE.BufferGeometry().setFromPoints(points);
      const beamMat = new THREE.LineBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending,
      });
      const beam = new THREE.Line(beamGeo, beamMat);
      chamberGroup.add(beam);
      beamLines.push(beam);
    }

    // Dynamic Sweeping Medical Scan Ring (Hollow open torus hoop encircling the body)
    const scanRingGeo = new THREE.TorusGeometry(0.42, 0.008, 16, 90);
    const scanRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const activeScanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    activeScanRing.rotation.x = Math.PI / 2;
    activeScanRing.position.y = 0;
    chamberGroup.add(activeScanRing);

    // Soft outer glow for the active scan ring (hollow torus tube, completely open center)
    const scanGlowGeo = new THREE.TorusGeometry(0.42, 0.016, 16, 90);
    const scanGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const activeScanGlow = new THREE.Mesh(scanGlowGeo, scanGlowMat);
    activeScanRing.add(activeScanGlow);

    // --- 4. HUMAN BODY HOLOGRAPHIC MESH GROUP ---
    const bodyGroup = new THREE.Group();
    scene.add(bodyGroup);

    // Custom Fresnel Holographic Shader Material (Semi-transparent with bright rim glow, FrontSide for translucency)
    const hologramShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x0369a1) },
        uRimColor: { value: new THREE.Color(0x00f0ff) },
        uTime: { value: 0 },
        uScanY: { value: 0 },
        uScanWidth: { value: 0.10 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uRimColor;
        uniform float uTime;
        uniform float uScanY;
        uniform float uScanWidth;

        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);

          // Fresnel Rim Light Calculation (silhouette edge glow)
          float fresnel = 1.0 - abs(dot(viewDir, normal));
          fresnel = pow(fresnel, 2.6);

          // Subtle holographic scanlines
          float scanlines = sin(vWorldPosition.y * 85.0 - uTime * 3.5) * 0.5 + 0.5;
          float scanFactor = 0.92 + 0.08 * scanlines;

          // Intersection with active laser scan plane
          float distToScan = abs(vWorldPosition.y - uScanY);
          float laserHighlight = smoothstep(uScanWidth, 0.0, distToScan) * 0.85;

          // Base translucent color + glowing rim contour
          vec3 baseColor = uColor * (0.12 + 0.22 * fresnel);
          vec3 rimGlow = uRimColor * (fresnel * 1.55 + laserHighlight);
          vec3 finalColor = (baseColor + rimGlow) * scanFactor;

          float alpha = clamp(0.20 + fresnel * 0.65 + laserHighlight * 0.45, 0.04, 0.92);
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide,
    });

    // Holographic Wireframe Material (Delicate polygons like in photo)
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide,
    });

    // Circular Glow Point Sprite Texture
    const createPointTexture = (): THREE.CanvasTexture => {
      const cvs = document.createElement('canvas');
      cvs.width = 64;
      cvs.height = 64;
      const ctx = cvs.getContext('2d')!;
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.25, 'rgba(103, 232, 249, 0.9)');
      grad.addColorStop(0.6, 'rgba(6, 182, 212, 0.35)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(cvs);
    };

    const pointTexture = createPointTexture();
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.014,
      map: pointTexture,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    let activeSolidMesh: THREE.Mesh | null = null;
    let activeWireMesh: THREE.Mesh | null = null;
    let activePointsMesh: THREE.Points | null = null;

    // --- PROCEDURAL ANATOMY MANNEQUIN (0-ms Instant Fallback) ---
    const buildProceduralAnatomy = () => {
      const procGroup = new THREE.Group();
      const parts: THREE.BufferGeometry[] = [];

      // Head
      const head = new THREE.SphereGeometry(0.08, 24, 24);
      head.scale(0.85, 1.1, 0.95);
      head.translate(0, 0.58, 0);
      parts.push(head);

      // Neck
      const neck = new THREE.CylinderGeometry(0.04, 0.05, 0.08, 16);
      neck.translate(0, 0.48, 0);
      parts.push(neck);

      // Chest
      const chest = new THREE.CylinderGeometry(0.14, 0.11, 0.24, 20);
      chest.scale(1.1, 1.0, 0.72);
      chest.translate(0, 0.32, 0);
      parts.push(chest);

      // Abdomen
      const abdomen = new THREE.CylinderGeometry(0.11, 0.11, 0.18, 20);
      abdomen.scale(1.0, 1.0, 0.68);
      abdomen.translate(0, 0.11, 0);
      parts.push(abdomen);

      // Pelvis
      const pelvis = new THREE.CylinderGeometry(0.11, 0.09, 0.14, 20);
      pelvis.scale(1.05, 1.0, 0.72);
      pelvis.translate(0, -0.04, 0);
      parts.push(pelvis);

      // Arms & Legs
      [-1, 1].forEach((side) => {
        // Shoulder
        const shoulder = new THREE.SphereGeometry(0.055, 16, 16);
        shoulder.translate(side * 0.17, 0.40, 0);
        parts.push(shoulder);

        // Upper Arm
        const upperArm = new THREE.CylinderGeometry(0.035, 0.03, 0.21, 16);
        upperArm.rotateZ(side * 0.18);
        upperArm.translate(side * 0.21, 0.27, 0);
        parts.push(upperArm);

        // Forearm
        const forearm = new THREE.CylinderGeometry(0.03, 0.024, 0.19, 16);
        forearm.rotateZ(side * 0.14);
        forearm.translate(side * 0.25, 0.10, 0);
        parts.push(forearm);

        // Hand
        const hand = new THREE.BoxGeometry(0.024, 0.07, 0.04);
        hand.rotateZ(side * 0.14);
        hand.translate(side * 0.28, -0.02, 0);
        parts.push(hand);

        // Thigh
        const thigh = new THREE.CylinderGeometry(0.06, 0.048, 0.28, 18);
        thigh.translate(side * 0.068, -0.22, 0);
        parts.push(thigh);

        // Knee
        const knee = new THREE.SphereGeometry(0.045, 16, 16);
        knee.translate(side * 0.068, -0.36, 0);
        parts.push(knee);

        // Calf
        const calf = new THREE.CylinderGeometry(0.048, 0.035, 0.26, 18);
        calf.translate(side * 0.068, -0.50, 0);
        parts.push(calf);

        // Foot
        const foot = new THREE.BoxGeometry(0.045, 0.035, 0.11);
        foot.translate(side * 0.068, -0.64, 0.03);
        parts.push(foot);
      });

      parts.forEach((geo) => {
        const mesh = new THREE.Mesh(geo, hologramShaderMaterial);
        procGroup.add(mesh);
        const wire = new THREE.Mesh(geo, wireframeMaterial);
        procGroup.add(wire);
      });

      return procGroup;
    };

    const proceduralModel = buildProceduralAnatomy();
    bodyGroup.add(proceduralModel);

    // --- LOAD HIGH-FIDELITY GLTF MODEL ---
    const baseUrl = (import.meta as any).env?.BASE_URL || '/';
    const modelPath = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}models/human_body.glb`;

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      modelPath,
      (gltf) => {
        let targetGeometry: THREE.BufferGeometry | null = null;
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
            targetGeometry = (child as THREE.Mesh).geometry;
          }
        });

        if (targetGeometry) {
          // Remove procedural mannequin
          bodyGroup.remove(proceduralModel);

          const geo = (targetGeometry as THREE.BufferGeometry).clone();
          geo.computeVertexNormals();

          // S = 1.32 perfectly frames the human figure from head to toe
          const MODEL_SCALE = 1.32;

          // 1. Holographic Translucent Solid
          const solidMesh = new THREE.Mesh(geo, hologramShaderMaterial);
          solidMesh.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
          solidMesh.rotation.y = -Math.PI / 2;
          bodyGroup.add(solidMesh);
          activeSolidMesh = solidMesh;

          // 2. Polygonal Wireframe Facets
          const wireMesh = new THREE.Mesh(geo, wireframeMaterial);
          wireMesh.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
          wireMesh.rotation.y = -Math.PI / 2;
          bodyGroup.add(wireMesh);
          activeWireMesh = wireMesh;

          // 3. Biometric Constellation Sparkles (~280 points like reference photo)
          const posAttr = geo.attributes.position;
          const pointCoords: number[] = [];
          for (let i = 0; i < posAttr.count; i += 100) {
            pointCoords.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
          }
          const ptGeo = new THREE.BufferGeometry();
          ptGeo.setAttribute('position', new THREE.Float32BufferAttribute(pointCoords, 3));

          const ptsMesh = new THREE.Points(ptGeo, pointsMaterial);
          ptsMesh.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
          ptsMesh.rotation.y = -Math.PI / 2;
          bodyGroup.add(ptsMesh);
          activePointsMesh = ptsMesh;
        }
      },
      undefined,
      (err) => {
        console.warn('GLTF fallback active, using procedural anatomy:', err);
      }
    );

    // --- 5. 3D BIOMETRIC BEACONS & TARGETING RETICLES ---
    const beaconsGroup = new THREE.Group();
    bodyGroup.add(beaconsGroup);

    interface BeaconMeshObj {
      id: string;
      group: THREE.Group;
      coreSphere: THREE.Mesh;
      rippleRing: THREE.Mesh;
      bracketLine: THREE.Line;
      reticleRing: THREE.Mesh;
      hitTarget: THREE.Mesh;
    }

    const beaconMeshMap: BeaconMeshObj[] = [];

    BEACONS.forEach((beacon) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(...beacon.position);

      // Core sphere (compact, luminous)
      const coreGeo = new THREE.SphereGeometry(0.016, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.95,
      });
      const coreSphere = new THREE.Mesh(coreGeo, coreMat);
      bGroup.add(coreSphere);

      // Radar pulse ripple ring
      const ringGeo = new THREE.RingGeometry(0.020, 0.030, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const rippleRing = new THREE.Mesh(ringGeo, ringMat);
      bGroup.add(rippleRing);

      // 3D Targeting Reticle (Appears on selection)
      const reticleGeo = new THREE.RingGeometry(beacon.targetRadius - 0.010, beacon.targetRadius, 40);
      const reticleMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const reticleRing = new THREE.Mesh(reticleGeo, reticleMat);
      bGroup.add(reticleRing);

      // Caliper connector bracket line
      const linePts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.06, 0.04, 0.02),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.6,
      });
      const bracketLine = new THREE.Line(lineGeo, lineMat);
      bGroup.add(bracketLine);

      // Invisible larger hit target for clicking/hovering
      const hitGeo = new THREE.SphereGeometry(0.10, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitTarget = new THREE.Mesh(hitGeo, hitMat);
      hitTarget.userData = { beaconId: beacon.id };
      bGroup.add(hitTarget);

      beaconsGroup.add(bGroup);
      beaconMeshMap.push({
        id: beacon.id,
        group: bGroup,
        coreSphere,
        rippleRing,
        bracketLine,
        reticleRing,
        hitTarget,
      });
    });

    // --- 6. RAYCASTING & INTERACTION ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hitTargets = beaconMeshMap.map((b) => b.hitTarget);
      const intersects = raycaster.intersectObjects(hitTargets, true);

      if (intersects.length > 0) {
        const id = intersects[0].object.userData.beaconId;
        setHoveredBeacon(id);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredBeacon(null);
        renderer.domElement.style.cursor = 'default';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hitTargets = beaconMeshMap.map((b) => b.hitTarget);
      const intersects = raycaster.intersectObjects(hitTargets, true);

      if (intersects.length > 0) {
        const clickedId = intersects[0].object.userData.beaconId;
        if (selectedZoneRef.current === clickedId) {
          onSelectZone(null);
        } else {
          onSelectZone(clickedId);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // --- 7. ANIMATION LOOP ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Orbit controls update
      controls.update();

      // Scanner rings continuous slow rotation (alternating directions)
      ringMeshes.forEach((mesh, idx) => {
        mesh.rotation.z = elapsedTime * (idx % 2 === 0 ? 0.30 : -0.25);
      });

      // Active Scan Wave
      if (scanActiveRef.current) {
        const scanY = Math.sin(elapsedTime * 0.95) * 0.70;
        activeScanRing.position.y = scanY;
        activeScanRing.visible = true;
        hologramShaderMaterial.uniforms.uScanY.value = scanY;
      } else {
        activeScanRing.visible = false;
        hologramShaderMaterial.uniforms.uScanY.value = -999;
      }
      hologramShaderMaterial.uniforms.uTime.value = elapsedTime;

      // Vertical Laser Columns gentle pulsing, synchronized with heart rate
      const currentHr = vitalsRef.current?.heart_rate || 72;
      const cardiacFreq = (currentHr / 60) * Math.PI * 2;
      const beamPulse = 0.32 + 0.15 * Math.sin(elapsedTime * cardiacFreq);
      beamLines.forEach((line) => {
        (line.material as THREE.LineBasicMaterial).opacity = beamPulse;
      });

      // --- SMALL FLOATING ANIMATION (Microgravity Free-Float Bob) ---
      const floatY = Math.sin(elapsedTime * 1.4) * 0.024;
      const floatPitch = Math.sin(elapsedTime * 0.8) * 0.008;
      const floatRoll = Math.sin(elapsedTime * 1.1) * 0.006;

      bodyGroup.position.y = floatY;
      bodyGroup.rotation.x = floatPitch;
      bodyGroup.rotation.z = floatRoll;

      // --- SIMPLE MOVEMENT TO BODY (Breathing Cycle & Micro-Expansion) ---
      // 14 breaths/min natural respiration
      const breathPhase = Math.sin(elapsedTime * 1.6);
      const breathScaleX = 1.0 + 0.018 * breathPhase;
      const breathScaleZ = 1.0 + 0.028 * breathPhase;
      const breathScaleY = 1.0 + 0.004 * breathPhase;

      const baseScale = 1.32;
      if (activeSolidMesh) {
        activeSolidMesh.scale.set(baseScale * breathScaleX, baseScale * breathScaleY, baseScale * breathScaleZ);
      }
      if (activeWireMesh) {
        activeWireMesh.scale.set(baseScale * breathScaleX, baseScale * breathScaleY, baseScale * breathScaleZ);
      }
      if (activePointsMesh) {
        activePointsMesh.scale.set(baseScale * breathScaleX, baseScale * breathScaleY, baseScale * breathScaleZ);
      }

      // Constellation points subtle twinkle
      pointsMaterial.size = 0.014 + 0.003 * Math.sin(elapsedTime * 4.0);

      // Wireframe mode toggle
      const mode = wireframeModeRef.current;
      if (activeSolidMesh) {
        activeSolidMesh.visible = mode === 'both' || mode === 'solid';
      }
      if (activeWireMesh) {
        activeWireMesh.visible = mode === 'both' || mode === 'wireframe';
      }

      // Update 3D Beacons (Color, Pulse, Targeting Reticles)
      const currentScores = riskScoresRef.current;
      const currentSelected = selectedZoneRef.current;

      beaconMeshMap.forEach((bObj) => {
        const cfg = BEACONS.find((b) => b.id === bObj.id);
        const score = cfg ? cfg.getScore(currentScores) : 20;
        const isSelected = currentSelected === bObj.id;

        // Determine system color based on physiological risk
        let colorHex = 0x00f0ff;
        let pulseRate = bObj.id === 'cardiovascular' ? cardiacFreq : 2.5;

        if (score >= 70) {
          colorHex = 0xef4444; // Crimson Red
          pulseRate = pulseRate * 1.5;
        } else if (score >= 40) {
          colorHex = 0xf59e0b; // Warning Amber
          pulseRate = pulseRate * 1.2;
        } else {
          colorHex = 0x10b981; // Nominal Emerald
        }

        // Apply dynamic color
        (bObj.coreSphere.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
        (bObj.rippleRing.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
        (bObj.bracketLine.material as THREE.LineBasicMaterial).color.setHex(colorHex);
        (bObj.reticleRing.material as THREE.MeshBasicMaterial).color.setHex(colorHex);

        // Core scale
        const pulse = (Math.sin(elapsedTime * pulseRate) + 1.0) * 0.5;
        const baseCoreScale = isSelected ? 1.4 : 1.0;
        bObj.coreSphere.scale.setScalar(baseCoreScale * (0.88 + 0.25 * pulse));

        // Radar ripple ring
        const rippleScale = 1.0 + 1.2 * ((elapsedTime * (pulseRate * 0.45)) % 1.0);
        const rippleOpacity = 0.7 * (1.0 - ((elapsedTime * (pulseRate * 0.45)) % 1.0));
        bObj.rippleRing.scale.setScalar(rippleScale);
        (bObj.rippleRing.material as THREE.MeshBasicMaterial).opacity = rippleOpacity;
        bObj.rippleRing.lookAt(camera.position);

        // Targeting Reticle (active on selection)
        if (isSelected) {
          (bObj.reticleRing.material as THREE.MeshBasicMaterial).opacity = 0.8 + 0.2 * Math.sin(elapsedTime * 6.0);
          bObj.reticleRing.rotation.z = elapsedTime * 1.5;
          bObj.reticleRing.lookAt(camera.position);
          bObj.reticleRing.visible = true;
        } else {
          (bObj.reticleRing.material as THREE.MeshBasicMaterial).opacity = 0.0;
          bObj.reticleRing.visible = false;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // --- 8. RESIZE HANDLING ---
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW && newH) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // --- 9. LIFECYCLE CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onSelectZone]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden">
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[480px] flex-1 cursor-grab active:cursor-grabbing relative"
      />

      {/* Top Floating HUD Status Bar */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/30 text-[10px] text-cyan-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>HOLOGRAPHIC BIOMETRIC SCANNER</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400">3D ACTIVE</span>
        </div>

        {hoveredBeacon && (
          <div className="bg-cyan-950/95 border border-cyan-400/60 px-2 py-0.5 rounded text-[10px] text-cyan-200 font-mono tracking-wider animate-pulse shadow-lg">
            INSPECT: {hoveredBeacon.toUpperCase().replace('_', ' ')}
          </div>
        )}
      </div>

      {/* Interactive Controls Bar */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/80 shadow-2xl z-10">
        {/* Auto Rotate Toggle */}
        <button
          onClick={() => setAutoRotate((prev) => !prev)}
          title="Toggle 360° Auto-Orbit"
          className={`p-1.5 rounded-full transition-all text-xs flex items-center gap-1 cursor-pointer ${
            autoRotate
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin-slow' : ''}`} />
          <span className="text-[10px] font-mono pr-1">Orbit</span>
        </button>

        {/* Scan Laser Toggle */}
        <button
          onClick={() => setScanActive((prev) => !prev)}
          title="Toggle Active Laser Scan Beam"
          className={`p-1.5 rounded-full transition-all text-xs flex items-center gap-1 cursor-pointer ${
            scanActive
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Scan className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono pr-1">Scan</span>
        </button>

        {/* Wireframe View Mode */}
        <button
          onClick={() =>
            setWireframeMode((prev) =>
              prev === 'both' ? 'wireframe' : prev === 'wireframe' ? 'solid' : 'both'
            )
          }
          title="Toggle Wireframe / Hologram Mode"
          className="p-1.5 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-all text-xs flex items-center gap-1 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono capitalize pr-1">{wireframeMode}</span>
        </button>

        {/* Reset Camera View */}
        <button
          onClick={handleResetCamera}
          title="Reset Camera Orientation"
          className="p-1.5 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-all text-xs flex items-center gap-1 cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono pr-1">Reset</span>
        </button>
      </div>

      {/* Floating System Quick-Select Badges */}
      <div className="absolute top-10 right-2 flex flex-col gap-1.5 z-10 pointer-events-auto">
        {/* Cranial / Behavioral */}
        <button
          onClick={() => onSelectZone(selectedZone === 'neurological' ? null : 'neurological')}
          className={`text-left px-2.5 py-1 rounded-lg border text-xs backdrop-blur-md transition-all cursor-pointer ${
            selectedZone === 'neurological'
              ? 'ring-2 ring-cyan-400 bg-slate-900/95 border-cyan-400'
              : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-semibold text-slate-200">Cranial</span>
          </div>
          <div
            className={`font-mono text-[10px] font-bold ${
              riskScores.behavioral_health >= 70
                ? 'text-red-400'
                : riskScores.behavioral_health >= 40
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {riskScores.behavioral_health}% Risk
          </div>
        </button>

        {/* Immune & Radiation */}
        <button
          onClick={() =>
            onSelectZone(selectedZone === 'immune_radiation' ? null : 'immune_radiation')
          }
          className={`text-left px-2.5 py-1 rounded-lg border text-xs backdrop-blur-md transition-all cursor-pointer ${
            selectedZone === 'immune_radiation'
              ? 'ring-2 ring-amber-400 bg-slate-900/95 border-amber-400'
              : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-semibold text-slate-200">Immune</span>
          </div>
          <div
            className={`font-mono text-[10px] font-bold ${
              riskScores.immune_radiation >= 70
                ? 'text-red-400'
                : riskScores.immune_radiation >= 40
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {riskScores.immune_radiation}% Risk
          </div>
        </button>
      </div>

      <div className="absolute top-10 left-2 flex flex-col gap-1.5 z-10 pointer-events-auto">
        {/* Cardiovascular */}
        <button
          onClick={() =>
            onSelectZone(selectedZone === 'cardiovascular' ? null : 'cardiovascular')
          }
          className={`text-left px-2.5 py-1 rounded-lg border text-xs backdrop-blur-md transition-all cursor-pointer ${
            selectedZone === 'cardiovascular'
              ? 'ring-2 ring-red-400 bg-slate-900/95 border-red-400'
              : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[11px] font-semibold text-slate-200">Cardiovascular</span>
          </div>
          <div
            className={`font-mono text-[10px] font-bold ${
              riskScores.cardiovascular >= 70
                ? 'text-red-400'
                : riskScores.cardiovascular >= 40
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {riskScores.cardiovascular}% Risk
          </div>
        </button>

        {/* Musculoskeletal */}
        <button
          onClick={() =>
            onSelectZone(selectedZone === 'musculoskeletal' ? null : 'musculoskeletal')
          }
          className={`text-left px-2.5 py-1 rounded-lg border text-xs backdrop-blur-md transition-all cursor-pointer ${
            selectedZone === 'musculoskeletal'
              ? 'ring-2 ring-cyan-400 bg-slate-900/95 border-cyan-400'
              : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-semibold text-slate-200">Skeletal Axis</span>
          </div>
          <div
            className={`font-mono text-[10px] font-bold ${
              riskScores.bone_musculoskeletal >= 70
                ? 'text-red-400'
                : riskScores.bone_musculoskeletal >= 40
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {riskScores.bone_musculoskeletal}% Risk
          </div>
        </button>
      </div>
    </div>
  );
};
