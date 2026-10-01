import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Compass,
  Flashlight,
  Eye,
  Maximize2,
  HelpCircle,
  RotateCcw,
  Search,
  ExternalLink,
  ChevronRight,
  Layers,
  Box,
} from 'lucide-react';
import { CaseWorld, CaseWorldObject, SceneEvidence } from '../types';
import { CASE_WAREHOUSE } from '../data/presetCases';

interface CrimeScene3DProps {
  caseWorld?: CaseWorld;
  selectedEvidenceId: string | null;
  onSelectEvidence: (id: string) => void;
  onInspectEvidence?: (id: string) => void;
  focusEvidenceId?: string | null;
  highlightCategory?: string | null;
  readOnlyControls?: boolean;
}

export const CrimeScene3D: React.FC<CrimeScene3DProps> = ({
  caseWorld = CASE_WAREHOUSE,
  selectedEvidenceId,
  onSelectEvidence,
  onInspectEvidence,
  focusEvidenceId,
  highlightCategory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [flashlightOn, setFlashlightOn] = useState<boolean>(true);
  const [cameraMode, setCameraMode] = useState<'walk' | 'orbit'>('walk');
  const [showControlsHelp, setShowControlsHelp] = useState<boolean>(false);
  const [hoveredObject, setHoveredObject] = useState<CaseWorldObject | null>(null);

  // References for three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const flashlightRef = useRef<THREE.SpotLight | null>(null);
  const dynamicMeshesGroupRef = useRef<THREE.Group | null>(null);
  const interactiveObjectsRef = useRef<THREE.Object3D[]>([]);
  const cctvLightRef = useRef<THREE.PointLight | null>(null);

  // Camera animation target
  const cameraTargetPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 2.6, 6.2));
  const cameraLookAtPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.8, 0));
  const currentLookAtPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.8, 0));

  // Movement input state
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const isMouseDown = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraRotation = useRef<{ yaw: number; pitch: number }>({ yaw: 0, pitch: -0.2 });

  // Currently selected evidence / object details
  const activeEvidence = caseWorld.evidence.find(
    (e) => e.id === selectedEvidenceId || e.code === selectedEvidenceId
  ) || null;

  const activeObject = caseWorld.objects.find(
    (o) => o.evidenceId === selectedEvidenceId || o.id === selectedEvidenceId
  ) || null;

  // Move camera smoothly towards specific object or evidence
  const focusOnTarget = useCallback((x: number, y: number, z: number, dist: number = 3.2) => {
    cameraTargetPos.current.set(x, Math.max(y + 1.2, 1.4), z + dist);
    cameraLookAtPos.current.set(x, y + 0.2, z);
  }, []);

  // When focusEvidenceId or selectedEvidenceId changes, pan to that position
  useEffect(() => {
    const targetId = focusEvidenceId || selectedEvidenceId;
    if (!targetId || !caseWorld) return;

    const obj = caseWorld.objects.find(
      (o) => o.evidenceId === targetId || o.id === targetId
    );
    if (obj) {
      focusOnTarget(obj.position.x, obj.position.y, obj.position.z);
    }
  }, [focusEvidenceId, selectedEvidenceId, caseWorld, focusOnTarget]);

  // Main Three.js Scene Setup & Re-building when caseWorld changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const skyColor = caseWorld.theme?.skyColor || '#030712';
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(skyColor, caseWorld.environmentType === 'highway_road' ? 0.025 : 0.04);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 200);
    // Initial camera position based on environment
    if (caseWorld.environmentType === 'highway_road') {
      camera.position.set(0, 3.2, 12);
      cameraTargetPos.current.set(0, 3.2, 12);
    } else {
      camera.position.set(0, 2.8, 6.5);
      cameraTargetPos.current.set(0, 2.8, 6.5);
    }
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting setup
    const ambientColor = caseWorld.theme?.ambientColor || '#0b1329';
    const ambientLight = new THREE.AmbientLight(ambientColor, 1.2);
    scene.add(ambientLight);

    // Flashlight (mounted to camera)
    const flashlight = new THREE.SpotLight(0xfff6dd, 4.5, 30, Math.PI / 5.5, 0.45, 1.2);
    flashlight.castShadow = true;
    flashlight.shadow.mapSize.width = 1024;
    flashlight.shadow.mapSize.height = 1024;
    flashlight.position.copy(camera.position);
    scene.add(flashlight);
    flashlightRef.current = flashlight;

    // Primary overhead lighting according to environment
    if (caseWorld.environmentType === 'highway_road') {
      // Highway sodium vapor overhead lamp posts
      for (let z = -30; z <= 30; z += 15) {
        const pole = new THREE.Group();
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 6), poleMat);
        post.position.set(-6, 3, z);
        pole.add(post);

        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5), poleMat);
        arm.rotation.z = Math.PI / 3;
        arm.position.set(-5, 5.5, z);
        pole.add(arm);

        const lightHead = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.15, 0.8),
          new THREE.MeshStandardMaterial({ color: 0xffedd5, emissive: 0xf59e0b, emissiveIntensity: 0.8 })
        );
        lightHead.position.set(-4, 5.8, z);
        pole.add(lightHead);

        const streetLight = new THREE.SpotLight(0xfef3c7, 3.5, 20, Math.PI / 3, 0.5);
        streetLight.position.set(-4, 5.8, z);
        streetLight.target.position.set(0, 0, z);
        scene.add(streetLight.target);
        pole.add(streetLight);
        scene.add(pole);
      }
    } else {
      // Ceiling fixture lamp
      const roomHeight = caseWorld.roomDimensions?.height || 4.5;
      const ceilingLight = new THREE.PointLight(0xe0e7ff, 2.2, 18);
      ceilingLight.position.set(0, roomHeight - 0.4, 0);
      ceilingLight.castShadow = true;
      scene.add(ceilingLight);
    }

    // Interactive objects collector for raycasting
    const interactiveObjects: THREE.Object3D[] = [];
    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);
    dynamicMeshesGroupRef.current = dynamicGroup;

    // Helper textures generator
    const createFloorTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;

      if (caseWorld.environmentType === 'highway_road') {
        // Dark asphalt with subtle grain
        ctx.fillStyle = '#181e29';
        ctx.fillRect(0, 0, 1024, 1024);
        for (let i = 0; i < 4000; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? '#242e3f' : '#111722';
          ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
        }
      } else if (caseWorld.environmentType === 'apartment') {
        // Parquet wood floorboards
        ctx.fillStyle = '#3d2817';
        ctx.fillRect(0, 0, 1024, 1024);
        ctx.strokeStyle = '#27190d';
        ctx.lineWidth = 4;
        const boardHeight = 64;
        for (let y = 0; y < 1024; y += boardHeight) {
          ctx.strokeRect(0, y, 1024, boardHeight);
          for (let x = (y % 128); x < 1024; x += 128) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + boardHeight);
            ctx.stroke();
          }
        }
      } else if (caseWorld.environmentType === 'retail_shop') {
        // High-gloss commercial store tiles
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(0, 0, 1024, 1024);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3;
        const tileSize = 128;
        for (let x = 0; x <= 1024; x += tileSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 1024);
          ctx.stroke();
        }
        for (let y = 0; y <= 1024; y += tileSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(1024, y);
          ctx.stroke();
        }
      } else {
        // Warehouse concrete floor with metric grid
        ctx.fillStyle = '#1e2634';
        ctx.fillRect(0, 0, 1024, 1024);
        ctx.strokeStyle = '#2b3648';
        ctx.lineWidth = 2;
        const step = 64;
        for (let x = 0; x <= 1024; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 1024);
          ctx.stroke();
        }
        for (let y = 0; y <= 1024; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(1024, y);
          ctx.stroke();
        }
        ctx.font = '14px monospace';
        ctx.fillStyle = '#475569';
        for (let x = step; x < 1024; x += step * 2) {
          for (let y = step; y < 1024; y += step * 2) {
            ctx.fillText(`[${(x / step).toFixed(0)},${(y / step).toFixed(0)}]`, x + 4, y + 16);
          }
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(caseWorld.environmentType === 'highway_road' ? 1 : 3, caseWorld.environmentType === 'highway_road' ? 8 : 3);
      return tex;
    };

    // ==========================================
    // PROCEDURAL ENVIRONMENT GENERATION
    // ==========================================
    const floorTexture = createFloorTexture();
    const { width: roomW, length: roomL, height: roomH } =
      caseWorld.roomDimensions || { width: 14, length: 18, height: 4.5 };

    if (caseWorld.environmentType === 'highway_road') {
      // 1. Highway road asphalt
      const roadGeo = new THREE.PlaneGeometry(16, 120);
      const roadMat = new THREE.MeshStandardMaterial({
        map: floorTexture,
        roughness: 0.85,
        metalness: 0.1,
      });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.receiveShadow = true;
      dynamicGroup.add(road);

      // Yellow double center line
      const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
      const line1 = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 120), yellowLineMat);
      line1.rotation.x = -Math.PI / 2;
      line1.position.set(-0.15, 0.01, 0);
      dynamicGroup.add(line1);

      const line2 = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 120), yellowLineMat);
      line2.rotation.x = -Math.PI / 2;
      line2.position.set(0.15, 0.01, 0);
      dynamicGroup.add(line2);

      // White lane dividers
      const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
      for (let z = -55; z <= 55; z += 6) {
        const dash1 = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 3), whiteLineMat);
        dash1.rotation.x = -Math.PI / 2;
        dash1.position.set(-3.6, 0.01, z);
        dynamicGroup.add(dash1);

        const dash2 = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 3), whiteLineMat);
        dash2.rotation.x = -Math.PI / 2;
        dash2.position.set(3.6, 0.01, z);
        dynamicGroup.add(dash2);
      }

      // Highway guardrails
      const guardrailMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
      [-7.5, 7.5].forEach((gx) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 120), guardrailMat);
        rail.position.set(gx, 0.7, 0);
        rail.castShadow = true;
        dynamicGroup.add(rail);

        for (let pz = -55; pz <= 55; pz += 5) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1), guardrailMat);
          post.position.set(gx, 0.5, pz);
          dynamicGroup.add(post);
        }
      });
    } else {
      // Enclosed room environment (Warehouse, Apartment, Retail)
      // Floor
      const floorGeo = new THREE.PlaneGeometry(roomW, roomL);
      const floorMat = new THREE.MeshStandardMaterial({
        map: floorTexture,
        roughness: caseWorld.environmentType === 'retail_shop' ? 0.2 : 0.8,
        metalness: 0.1,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      dynamicGroup.add(floor);

      // Ceiling
      const ceilingMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(caseWorld.theme?.groundColor || '#0f172a'),
        roughness: 0.9,
      });
      const ceiling = new THREE.Mesh(floorGeo, ceilingMat);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.y = roomH;
      dynamicGroup.add(ceiling);

      // 4 Walls
      const wallMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(caseWorld.theme?.wallColor || '#1e293b'),
        roughness: 0.7,
      });

      // North Wall
      const northWall = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
      northWall.position.set(0, roomH / 2, -roomL / 2);
      northWall.receiveShadow = true;
      dynamicGroup.add(northWall);

      // South Wall
      const southWall = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomH), wallMat);
      southWall.rotation.y = Math.PI;
      southWall.position.set(0, roomH / 2, roomL / 2);
      southWall.receiveShadow = true;
      dynamicGroup.add(southWall);

      // West Wall
      const westWall = new THREE.Mesh(new THREE.PlaneGeometry(roomL, roomH), wallMat);
      westWall.rotation.y = Math.PI / 2;
      westWall.position.set(-roomW / 2, roomH / 2, 0);
      westWall.receiveShadow = true;
      dynamicGroup.add(westWall);

      // East Wall
      const eastWall = new THREE.Mesh(new THREE.PlaneGeometry(roomL, roomH), wallMat);
      eastWall.rotation.y = -Math.PI / 2;
      eastWall.position.set(roomW / 2, roomH / 2, 0);
      eastWall.receiveShadow = true;
      dynamicGroup.add(eastWall);
    }

    // ==========================================
    // PROCEDURAL CASE OBJECTS BUILDER
    // ==========================================
    caseWorld.objects.forEach((obj, idx) => {
      const objGroup = new THREE.Group();
      objGroup.position.set(obj.position.x, obj.position.y, obj.position.z);
      objGroup.userData = { objectData: obj };

      switch (obj.type) {
        case 'vehicle': {
          // 3D Car Sedan / SUV
          const carColor = obj.name.toLowerCase().includes('silver') ? 0x94a3b8 : 0x1e293b;
          const bodyMat = new THREE.MeshStandardMaterial({ color: carColor, roughness: 0.3, metalness: 0.8 });
          const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });

          // Chassis
          const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.7, 4.4), bodyMat);
          chassis.position.y = 0.55;
          chassis.castShadow = true;
          objGroup.add(chassis);

          // Cabin
          const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 2.4), glassMat);
          cabin.position.set(0, 1.15, -0.2);
          cabin.castShadow = true;
          objGroup.add(cabin);

          // Wheels
          const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 16);
          const wheelMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 });
          [
            [-1.0, 0.38, 1.3],
            [1.0, 0.38, 1.3],
            [-1.0, 0.38, -1.3],
            [1.0, 0.38, -1.3],
          ].forEach(([wx, wy, wz]) => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(wx, wy, wz);
            objGroup.add(wheel);
          });

          // Headlights with real spotlight beams
          const headGeo = new THREE.BoxGeometry(0.3, 0.15, 0.1);
          const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1 });
          [-0.7, 0.7].forEach((hx) => {
            const hLight = new THREE.Mesh(headGeo, headMat);
            hLight.position.set(hx, 0.65, 2.2);
            objGroup.add(hLight);

            const spot = new THREE.SpotLight(0xfff7ed, 4.0, 20, Math.PI / 6, 0.4);
            spot.position.set(hx, 0.65, 2.3);
            spot.target.position.set(hx, 0, 12);
            scene.add(spot.target);
            objGroup.add(spot);
          });

          // Tail lights
          const tailMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.8 });
          [-0.7, 0.7].forEach((tx) => {
            const tLight = new THREE.Mesh(headGeo, tailMat);
            tLight.position.set(tx, 0.65, -2.2);
            objGroup.add(tLight);
          });
          break;
        }

        case 'body': {
          // Chalk outline
          const outlineGeo = new THREE.RingGeometry(0.5, 0.55, 32);
          const chalkMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
          const chalkRing = new THREE.Mesh(outlineGeo, chalkMat);
          chalkRing.rotation.x = -Math.PI / 2;
          chalkRing.position.y = 0.01;
          objGroup.add(chalkRing);

          // Stylized mannequin / deceased
          const mannequinMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.7 });
          // Head
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), mannequinMat);
          head.position.set(0, 0.15, -0.8);
          head.castShadow = true;
          objGroup.add(head);

          // Torso
          const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.9), mannequinMat);
          torso.position.set(0, 0.12, -0.2);
          torso.castShadow = true;
          objGroup.add(torso);

          // Limbs
          const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.85);
          const legL = new THREE.Mesh(legGeo, mannequinMat);
          legL.rotation.x = Math.PI / 2;
          legL.position.set(-0.2, 0.1, 0.6);
          objGroup.add(legL);

          const legR = new THREE.Mesh(legGeo, mannequinMat);
          legR.rotation.x = Math.PI / 2;
          legR.rotation.z = -0.2;
          legR.position.set(0.22, 0.1, 0.6);
          objGroup.add(legR);
          break;
        }

        case 'weapon': {
          if (obj.name.toLowerCase().includes('wrench')) {
            // Pipe Wrench
            const wrenchMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.25 });
            const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.6), wrenchMat);
            handle.position.y = 0.03;
            handle.rotation.y = 0.4;
            handle.castShadow = true;
            objGroup.add(handle);

            const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.14), wrenchMat);
            jaw.position.set(0.06, 0.04, 0.28);
            jaw.rotation.y = 0.4;
            objGroup.add(jaw);
          } else {
            // Handgun / Revolver
            const gunMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
            const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.28), gunMat);
            barrel.position.y = 0.06;
            barrel.castShadow = true;
            objGroup.add(barrel);

            const grip = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.14, 0.08), gunMat);
            grip.rotation.x = -0.3;
            grip.position.set(0, 0.03, -0.08);
            objGroup.add(grip);
          }
          break;
        }

        case 'phone': {
          // Smartphone
          const phoneMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
          const phone = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.015, 0.22), phoneMat);
          phone.castShadow = true;
          objGroup.add(phone);

          // Glowing OLED screen
          const screenMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0284c7,
            emissiveIntensity: 1.2,
          });
          const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.19), screenMat);
          screen.rotation.x = -Math.PI / 2;
          screen.position.y = 0.009;
          objGroup.add(screen);

          // Point light emitting from phone
          const phoneGlow = new THREE.PointLight(0x38bdf8, 0.8, 1.5);
          phoneGlow.position.y = 0.15;
          objGroup.add(phoneGlow);
          break;
        }

        case 'laptop': {
          // Open Laptop
          const laptopMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
          const base = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.28), laptopMat);
          objGroup.add(base);

          const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.26, 0.015), laptopMat);
          screenMesh.position.set(0, 0.13, -0.13);
          screenMesh.rotation.x = -0.2;
          objGroup.add(screenMesh);

          const display = new THREE.Mesh(
            new THREE.PlaneGeometry(0.36, 0.22),
            new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0891b2, emissiveIntensity: 1 })
          );
          display.position.set(0, 0.13, -0.12);
          display.rotation.x = -0.2;
          objGroup.add(display);
          break;
        }

        case 'cash_counter': {
          // Retail Checkout Desk
          const counterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
          const desk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 0.9), counterMat);
          desk.position.y = 0.55;
          desk.castShadow = true;
          objGroup.add(desk);

          // Register
          const reg = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.15, 0.35),
            new THREE.MeshStandardMaterial({ color: 0x0284c7 })
          );
          reg.position.set(0.4, 1.18, 0);
          objGroup.add(reg);
          break;
        }

        case 'table': {
          // Desk/Table
          const tableMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
          const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.2), tableMat);
          top.position.y = 0.75;
          top.castShadow = true;
          objGroup.add(top);

          const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.75);
          [
            [-0.95, -0.45],
            [0.95, -0.45],
            [-0.95, 0.45],
            [0.95, 0.45],
          ].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(legGeo, tableMat);
            leg.position.set(lx, 0.375, lz);
            leg.castShadow = true;
            objGroup.add(leg);
          });
          break;
        }

        case 'chair': {
          const chairMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
          const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.55), chairMat);
          seat.position.y = 0.45;
          objGroup.add(seat);

          const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.05), chairMat);
          back.position.set(0, 0.7, -0.25);
          objGroup.add(back);

          // If overturned, tilt group
          if (obj.name.toLowerCase().includes('overturned') || obj.name.toLowerCase().includes('knocked')) {
            objGroup.rotation.z = Math.PI / 2.3;
            objGroup.position.y = 0.25;
          }
          break;
        }

        case 'cctv_camera': {
          // Camera Dome / Bullet
          const camBodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
          const cam = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), camBodyMat);
          objGroup.add(cam);

          // Blinking recording light
          const ledMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          const led = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), ledMat);
          led.position.set(0, -0.15, 0.15);
          objGroup.add(led);

          const cctvLight = new THREE.PointLight(0xef4444, 0.8, 2);
          cctvLight.position.set(0, -0.2, 0.2);
          objGroup.add(cctvLight);
          cctvLightRef.current = cctvLight;

          // Sightline Optical Frustum Cone
          const coneGeo = new THREE.ConeGeometry(2.5, 5, 16, 1, true);
          const coneMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide,
          });
          const cone = new THREE.Mesh(coneGeo, coneMat);
          cone.rotation.x = Math.PI / 1.5;
          cone.position.set(0, -2.4, 2.0);
          objGroup.add(cone);
          break;
        }

        case 'blood_evidence': {
          // Blood spatter puddle
          const bloodCanvas = document.createElement('canvas');
          bloodCanvas.width = 256;
          bloodCanvas.height = 256;
          const bCtx = bloodCanvas.getContext('2d')!;
          bCtx.fillStyle = '#7f1d1d';
          bCtx.beginPath();
          bCtx.arc(128, 128, 90, 0, Math.PI * 2);
          bCtx.fill();
          for (let s = 0; s < 18; s++) {
            const rad = 70 + Math.random() * 50;
            const ang = Math.random() * Math.PI * 2;
            bCtx.beginPath();
            bCtx.arc(128 + Math.cos(ang) * rad, 128 + Math.sin(ang) * rad, 6 + Math.random() * 8, 0, Math.PI * 2);
            bCtx.fill();
          }
          const bloodTex = new THREE.CanvasTexture(bloodCanvas);
          const bloodPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(1.6, 1.6),
            new THREE.MeshStandardMaterial({
              map: bloodTex,
              transparent: true,
              roughness: 0.1,
              metalness: 0.1,
            })
          );
          bloodPlane.rotation.x = -Math.PI / 2;
          bloodPlane.position.y = 0.02;
          objGroup.add(bloodPlane);
          break;
        }

        case 'tyre_marks': {
          // Skid marks on road
          const skidGeo = new THREE.PlaneGeometry(0.35, 12);
          const skidMat = new THREE.MeshBasicMaterial({ color: 0x050505, transparent: true, opacity: 0.75 });
          [-0.8, 0.8].forEach((sx) => {
            const mark = new THREE.Mesh(skidGeo, skidMat);
            mark.rotation.x = -Math.PI / 2;
            mark.position.set(sx, 0.02, 0);
            objGroup.add(mark);
          });
          break;
        }

        case 'pallet': {
          // Stack of logistics wooden pallets
          const palletMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.9 });
          for (let p = 0; p < 3; p++) {
            const pal = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.14, 1.4), palletMat);
            pal.position.y = p * 0.16 + 0.07;
            pal.castShadow = true;
            objGroup.add(pal);
          }
          break;
        }

        case 'door': {
          // Door frame & Leaf
          const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
          const frame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 1.3), frameMat);
          frame.position.y = 1.2;
          objGroup.add(frame);

          const doorLeaf = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 2.3, 1.1),
            new THREE.MeshStandardMaterial({ color: 0x475569 })
          );
          doorLeaf.position.set(0.15, 1.15, 0.2);
          doorLeaf.rotation.y = 0.35; // Ajar / pried
          doorLeaf.castShadow = true;
          objGroup.add(doorLeaf);

          // Access badge reader with glowing LED
          const reader = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.15, 0.1),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: 0x10b981, emissiveIntensity: 0.8 })
          );
          reader.position.set(-0.08, 1.2, 0.75);
          objGroup.add(reader);
          break;
        }

        default: {
          // Generic evidence marker / box
          const genMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.3, 0.4),
            new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 })
          );
          genMesh.position.y = 0.15;
          genMesh.castShadow = true;
          objGroup.add(genMesh);
          break;
        }
      }

      // ==========================================
      // FORENSIC NUMBERED TENT MARKER (#1, #2, ...)
      // ==========================================
      if (obj.isEvidenceMarker || obj.evidenceId) {
        const markerGroup = new THREE.Group();
        markerGroup.position.set(0, 0, 0);

        // Ground pulsing ring
        const ringGeo = new THREE.RingGeometry(0.32, 0.38, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf97316,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.03;
        markerGroup.add(ring);

        // Yellow forensic tent marker
        const tentCanvas = document.createElement('canvas');
        tentCanvas.width = 128;
        tentCanvas.height = 128;
        const tCtx = tentCanvas.getContext('2d')!;
        tCtx.fillStyle = '#f59e0b';
        tCtx.fillRect(0, 0, 128, 128);
        tCtx.fillStyle = '#000000';
        tCtx.font = 'bold 72px monospace';
        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';
        tCtx.fillText(`${idx + 1}`, 64, 64);
        const tentTex = new THREE.CanvasTexture(tentCanvas);

        const tentGeo = new THREE.ConeGeometry(0.18, 0.3, 4);
        const tentMat = new THREE.MeshStandardMaterial({ map: tentTex, roughness: 0.4 });
        const tent = new THREE.Mesh(tentGeo, tentMat);
        tent.position.set(0.35, 0.15, 0.35);
        tent.rotation.y = Math.PI / 4;
        tent.castShadow = true;
        markerGroup.add(tent);

        objGroup.add(markerGroup);
      }

      // Add to interactive group
      dynamicGroup.add(objGroup);
      interactiveObjects.push(objGroup);
    });

    interactiveObjectsRef.current = interactiveObjects;

    // 5. Mouse & Keyboard Handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if (e.code === 'KeyF') {
        setFlashlightOn((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDown.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;

      // Mouse Look
      if (isMouseDown.current) {
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;
        lastMousePos.current = { x: e.clientX, y: e.clientY };

        cameraRotation.current.yaw -= deltaX * 0.0035;
        cameraRotation.current.pitch -= deltaY * 0.0035;
        cameraRotation.current.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, cameraRotation.current.pitch));
      }

      // Raycast Hover detection
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjectsRef.current, true);

      if (intersects.length > 0) {
        let rootObj: THREE.Object3D | null = intersects[0].object;
        while (rootObj && !rootObj.userData.objectData && rootObj.parent) {
          rootObj = rootObj.parent;
        }
        if (rootObj && rootObj.userData.objectData) {
          setHoveredObject(rootObj.userData.objectData);
          container.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredObject(null);
      container.style.cursor = 'crosshair';
    };

    const handleClick = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjectsRef.current, true);

      if (intersects.length > 0) {
        let rootObj: THREE.Object3D | null = intersects[0].object;
        while (rootObj && !rootObj.userData.objectData && rootObj.parent) {
          rootObj = rootObj.parent;
        }
        if (rootObj && rootObj.userData.objectData) {
          const obj = rootObj.userData.objectData as CaseWorldObject;
          const targetEvidenceId = obj.evidenceId || obj.id;
          onSelectEvidence(targetEvidenceId);
          focusOnTarget(obj.position.x, obj.position.y, obj.position.z);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.005;
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotation.current.yaw);
      cameraTargetPos.current.addScaledVector(forward, -zoomDelta);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // 6. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);

      // Blinking CCTV LED
      if (cctvLightRef.current) {
        cctvLightRef.current.intensity = Math.sin(clock.getElapsedTime() * 4) > 0 ? 1.0 : 0.05;
      }

      // WASD First-Person Movement
      const moveSpeed = 4.5 * delta;
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotation.current.yaw);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotation.current.yaw);

      if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) {
        cameraTargetPos.current.addScaledVector(forward, moveSpeed);
      }
      if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) {
        cameraTargetPos.current.addScaledVector(forward, -moveSpeed);
      }
      if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) {
        cameraTargetPos.current.addScaledVector(right, -moveSpeed);
      }
      if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) {
        cameraTargetPos.current.addScaledVector(right, moveSpeed);
      }
      if (keysPressed.current['KeyQ']) {
        cameraTargetPos.current.y = Math.min(cameraTargetPos.current.y + moveSpeed, 8);
      }
      if (keysPressed.current['KeyE']) {
        cameraTargetPos.current.y = Math.max(cameraTargetPos.current.y - moveSpeed, 0.8);
      }

      // Smooth camera translation
      camera.position.lerp(cameraTargetPos.current, 0.12);

      // Compute look-at orientation from yaw & pitch
      const lookDir = new THREE.Vector3(
        Math.sin(cameraRotation.current.yaw) * Math.cos(cameraRotation.current.pitch),
        Math.sin(cameraRotation.current.pitch),
        -Math.cos(cameraRotation.current.yaw) * Math.cos(cameraRotation.current.pitch)
      );
      cameraLookAtPos.current.copy(camera.position).add(lookDir);
      currentLookAtPos.current.lerp(cameraLookAtPos.current, 0.15);
      camera.lookAt(currentLookAtPos.current);

      // Update flashlight to follow camera exactly
      if (flashlightRef.current) {
        flashlightRef.current.position.copy(camera.position);
        flashlightRef.current.target.position.copy(currentLookAtPos.current);
        flashlightRef.current.target.updateMatrixWorld();
        flashlightRef.current.visible = flashlightOn;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Window Resize handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [caseWorld, flashlightOn, focusOnTarget, onSelectEvidence]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950 font-mono">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />

      {/* Top Left Compass & Environment Info HUD */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/90 px-3 py-1.5 rounded-lg text-white text-xs shadow-xl pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-bold text-orange-400">SATYA 3D RECONSTRUCTION</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-200 uppercase">{caseWorld.environmentType}</span>
          <span className="text-slate-500 text-[11px]">
            [{caseWorld.objects.length} ENTITIES]
          </span>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setFlashlightOn(!flashlightOn)}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer backdrop-blur-md ${
              flashlightOn
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle Flashlight (F)"
          >
            <Flashlight className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">{flashlightOn ? 'TORCH ON' : 'TORCH OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => focusOnTarget(0, 0.5, 0, 5.5)}
            className="p-2 rounded-lg bg-slate-900/80 text-slate-300 border border-slate-700 hover:bg-slate-800 hover:text-white text-xs shadow-lg transition-all cursor-pointer backdrop-blur-md"
            title="Reset Camera View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowControlsHelp(!showControlsHelp)}
            className="p-2 rounded-lg bg-slate-900/80 text-slate-300 border border-slate-700 hover:bg-slate-800 hover:text-white text-xs shadow-lg transition-all cursor-pointer backdrop-blur-md"
            title="Controls Guide"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Center Quick Evidence Dock */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-1 bg-slate-950/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-2xl">
        <span className="text-[10px] font-bold text-slate-500 px-2 uppercase">EVIDENCE:</span>
        {caseWorld.objects.map((obj, idx) => {
          const isSelected =
            selectedEvidenceId === obj.evidenceId || selectedEvidenceId === obj.id;
          return (
            <button
              key={obj.id}
              type="button"
              onClick={() => {
                onSelectEvidence(obj.evidenceId || obj.id);
                focusOnTarget(obj.position.x, obj.position.y, obj.position.z);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
              }`}
            >
              #{idx + 1} {obj.name.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Hover tooltip */}
      {hoveredObject && !activeEvidence && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-6 pointer-events-none bg-slate-900/90 backdrop-blur-md border border-orange-500/60 px-3 py-1.5 rounded-lg text-white font-mono text-xs shadow-xl animate-fade-in">
          <span className="text-orange-400 font-bold">CLICK TO INSPECT: </span>
          <span className="font-semibold">{hoveredObject.name}</span>
          <span className="text-slate-400 ml-1.5">[{hoveredObject.type.toUpperCase()}]</span>
        </div>
      )}

      {/* Controls Help Modal */}
      {showControlsHelp && (
        <div className="absolute top-16 left-4 z-30 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl text-slate-200 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <span className="font-bold text-orange-400">NAVIGATION CONTROLS</span>
            <button
              type="button"
              onClick={() => setShowControlsHelp(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">W / A / S / D:</span>
              <span className="font-semibold text-white">Walk / Strafe</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mouse Drag:</span>
              <span className="font-semibold text-white">Look Around / Aim</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mouse Wheel:</span>
              <span className="font-semibold text-white">Zoom In / Out</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Left Click:</span>
              <span className="font-semibold text-white">Inspect 3D Evidence</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Q / E:</span>
              <span className="font-semibold text-white">Height Up / Down</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Key F:</span>
              <span className="font-semibold text-white">Toggle Flashlight</span>
            </div>
          </div>
        </div>
      )}

      {/* SPEC-MATCHING FORENSIC INSPECTION PANEL POPUP */}
      {(activeEvidence || activeObject) && (
        <div
          id="forensic-inspection-panel"
          className="absolute bottom-6 right-6 z-20 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-xl p-4 shadow-2xl text-white font-mono pointer-events-auto animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-orange-500 text-slate-950 font-bold text-[10px]">
                  [{(activeEvidence?.name || activeObject?.name || '').toUpperCase().split(' ')[0]}]
                </span>
                <span className="text-sm font-bold text-white tracking-wide truncate max-w-[200px]">
                  {activeEvidence?.name || activeObject?.name}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectEvidence('')}
              className="text-slate-400 hover:text-white text-xs cursor-pointer p-1"
              title="Close inspection"
            >
              ✕
            </button>
          </div>

          {/* Forensic Specs */}
          <div className="space-y-1.5 text-xs text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="flex justify-between">
              <span className="text-slate-400">Evidence ID:</span>
              <span className="font-bold text-orange-400">
                {activeEvidence?.code || activeObject?.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Type:</span>
              <span className="text-white">{activeEvidence?.type || activeObject?.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Found Location:</span>
              <span className="text-slate-200 truncate max-w-[180px]">
                {activeEvidence?.location || activeObject?.location}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Timestamp:</span>
              <span className="text-white font-mono">
                {activeEvidence?.timestamp || activeObject?.timestamp}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Source:</span>
              <span className="text-slate-300 truncate max-w-[180px]">
                {activeEvidence?.source || activeObject?.sourceEvidence}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Confidence:</span>
              <span className="text-emerald-400 font-bold">
                {typeof activeEvidence?.confidence === 'number'
                  ? `${Math.round(activeEvidence.confidence * 100)}%`
                  : typeof activeObject?.confidence === 'number'
                  ? `${Math.round(activeObject.confidence * 100)}%`
                  : activeEvidence?.confidence || activeObject?.confidence || 'VERIFIED'}
              </span>
            </div>
          </div>

          {/* Action Button: VIEW EVIDENCE */}
          <button
            type="button"
            id="view-evidence-button"
            onClick={() => onInspectEvidence && onInspectEvidence(activeEvidence?.id || activeObject?.evidenceId || activeObject?.id || '')}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs tracking-wider transition-all shadow-md cursor-pointer border border-orange-400"
          >
            <span>[VIEW EVIDENCE]</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Movement controls watermark on bottom left */}
      <div className="absolute bottom-4 left-4 pointer-events-none hidden sm:flex items-center gap-3 text-[10px] font-mono text-slate-400 bg-slate-900/70 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-800">
        <span>WASD: WALK</span>
        <span>•</span>
        <span>DRAG: LOOK</span>
        <span>•</span>
        <span>SCROLL: ZOOM</span>
        <span>•</span>
        <span>CLICK: INSPECT</span>
        <span>•</span>
        <span>F: TORCH</span>
      </div>
    </div>
  );
};
