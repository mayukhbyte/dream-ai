'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Navigation, 
  Flame, 
  Clock, 
  Thermometer, 
  Wind, 
  Camera, 
  Play, 
  Pause, 
  RotateCcw,
  Zap,
  ShieldAlert,
  Compass,
  Radio,
  CheckCircle2,
  ChefHat
} from 'lucide-react';
import { Order, getSocket, handoverOrderToDrone } from '@/lib/api';

export type CameraMode = 'orbit' | 'chase' | 'top';

interface ThermalDeliveryCity3DProps {
  activeOrder?: Order | null;
  onHandoverDrone?: (orderId: string) => void;
}

export const ThermalDeliveryCity3D: React.FC<ThermalDeliveryCity3DProps> = ({ activeOrder: propOrder, onHandoverDrone }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [trafficMode, setTrafficMode] = useState<'optimal' | 'rush' | 'storm'>('optimal');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Live connected order state
  const [currentOrder, setCurrentOrder] = useState<Order | null>(propOrder || null);
  
  // Real-time telemetry stats
  const [droneTemp, setDroneTemp] = useState<number>(propOrder?.telemetry?.currentTemp || 88.5);
  const [droneProgress, setDroneProgress] = useState<number>(propOrder?.status === 'OUT_FOR_DELIVERY' ? 45 : propOrder?.status === 'DELIVERED' ? 100 : 15);
  const [etaSeconds, setEtaSeconds] = useState<number>(18);
  const [droneConnected, setDroneConnected] = useState<boolean>(propOrder?.status === 'OUT_FOR_DELIVERY');

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const speedRef = useRef(speedMultiplier);
  speedRef.current = speedMultiplier;
  const cameraModeRef = useRef(cameraMode);
  cameraModeRef.current = cameraMode;

  // Sync prop order
  useEffect(() => {
    if (propOrder) {
      setCurrentOrder(propOrder);
      if (propOrder.telemetry?.currentTemp) {
        setDroneTemp(propOrder.telemetry.currentTemp);
      }
      setDroneConnected(propOrder.status === 'OUT_FOR_DELIVERY');
      if (propOrder.status === 'OUT_FOR_DELIVERY') {
        setDroneProgress(50);
      } else if (propOrder.status === 'DELIVERED') {
        setDroneProgress(100);
      } else {
        setDroneProgress(15);
      }
    }
  }, [propOrder]);

  // Real-time Socket.IO listener for live order and telemetry
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleOrderUpdate = (order: Order) => {
      setCurrentOrder(order);
      if (order.telemetry?.currentTemp) {
        setDroneTemp(order.telemetry.currentTemp);
      }
      const isAirborne = order.status === 'OUT_FOR_DELIVERY';
      setDroneConnected(isAirborne);
      if (isAirborne) {
        setDroneProgress(prev => Math.max(30, prev));
      } else if (order.status === 'DELIVERED') {
        setDroneProgress(100);
      }
    };

    const handleTelemetry = (data: { orderId: string; telemetry: any }) => {
      if (data.telemetry?.currentTemp) {
        setDroneTemp(data.telemetry.currentTemp);
      }
    };

    socket.on('order:status_update', handleOrderUpdate);
    socket.on('order:thermal_telemetry', handleTelemetry);
    socket.on('drone:telemetry', handleTelemetry);

    return () => {
      socket.off('order:status_update', handleOrderUpdate);
      socket.off('order:thermal_telemetry', handleTelemetry);
      socket.off('drone:telemetry', handleTelemetry);
    };
  }, []);

  const handleChefHandover = async () => {
    if (!currentOrder) return;
    try {
      if (onHandoverDrone) {
        onHandoverDrone(currentOrder.id);
      } else {
        await handoverOrderToDrone(currentOrder.id);
      }
      setDroneConnected(true);
      setCameraMode('chase'); // Auto switch to drone chase view!
    } catch (err) {
      console.error('Handover error:', err);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(18, 14, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x334155, 1.5);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight(0xf97316, 1.8);
    mainSun.position.set(20, 30, 15);
    scene.add(mainSun);

    const blueFill = new THREE.DirectionalLight(0x0ea5e9, 1.5);
    blueFill.position.set(-20, 20, -15);
    scene.add(blueFill);

    // Ground City Plane
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x050b14,
      roughness: 0.9,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Street Neon Grid
    const gridHelper = new THREE.GridHelper(50, 25, 0xf97316, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Procedural 3D City Buildings
    const buildingsGroup = new THREE.Group();
    scene.add(buildingsGroup);

    const buildingMats = [
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.3, metalness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4, metalness: 0.6 })
    ];

    // Build city blocks
    for (let x = -20; x <= 20; x += 6) {
      for (let z = -20; z <= 20; z += 6) {
        if (Math.abs(x) < 4 && Math.abs(z) < 4) continue; // Clear central corridor

        const bHeight = 3 + Math.random() * 8;
        const bGeo = new THREE.BoxGeometry(3.8, bHeight, 3.8);
        const bMat = buildingMats[Math.floor(Math.random() * buildingMats.length)];
        const bMesh = new THREE.Mesh(bGeo, bMat);
        bMesh.position.set(x + (Math.random() - 0.5), bHeight / 2, z + (Math.random() - 0.5));
        bMesh.castShadow = true;
        bMesh.receiveShadow = true;
        buildingsGroup.add(bMesh);

        // Rooftop Landing Pad Beacon
        if (Math.random() > 0.6) {
          const beaconGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
          const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.position.set(bMesh.position.x, bHeight + 0.1, bMesh.position.z);
          buildingsGroup.add(beacon);
        }
      }
    }

    // 3D Delivery Drone Construction
    const drone = new THREE.Group();
    scene.add(drone);

    // Main Core Chasis
    const bodyGeo = new THREE.BoxGeometry(1.6, 0.4, 1.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3, metalness: 0.9 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    drone.add(bodyMesh);

    // Glowing Thermal Heated Cargo Pod Underbelly
    const cargoGeo = new THREE.BoxGeometry(0.9, 0.6, 0.7);
    const cargoMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 1.5,
      roughness: 0.2
    });
    const cargoMesh = new THREE.Mesh(cargoGeo, cargoMat);
    cargoMesh.position.y = -0.4;
    drone.add(cargoMesh);

    // Drone 4 Rotor Arms & Blades
    const rotorGroup = new THREE.Group();
    drone.add(rotorGroup);

    const rotors: THREE.Mesh[] = [];
    const armPositions = [
      [1.1, 0.1, 0.9],
      [-1.1, 0.1, 0.9],
      [1.1, 0.1, -0.9],
      [-1.1, 0.1, -0.9]
    ];

    armPositions.forEach(([rx, ry, rz]) => {
      const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2);
      const armMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, metalness: 0.8 });
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.position.set(rx * 0.5, ry, rz * 0.5);
      arm.rotation.z = Math.PI / 4 * (rx > 0 ? 1 : -1);
      rotorGroup.add(arm);

      // Spinning Blade
      const bladeGeo = new THREE.BoxGeometry(0.9, 0.02, 0.1);
      const bladeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(rx, ry + 0.1, rz);
      rotorGroup.add(blade);
      rotors.push(blade);
    });

    // Thermal Route Flight Path Curve
    const flightCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-18, 5, -18),  // Kitchen dispatch
      new THREE.Vector3(-8, 8, -6),
      new THREE.Vector3(0, 6, 4),
      new THREE.Vector3(10, 9, 2),
      new THREE.Vector3(16, 4, 16)     // Customer skyline penthouse
    ]);

    // Render Flight Route Neon Ribbon
    const curvePoints = flightCurve.getPoints(100);
    const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curveMat = new THREE.LineBasicMaterial({
      color: 0xf97316,
      linewidth: 3,
      transparent: true,
      opacity: 0.8
    });
    const flightLine = new THREE.Line(curveGeo, curveMat);
    scene.add(flightLine);

    // Start & Destination Visual Waypoints
    const startPinGeo = new THREE.CylinderGeometry(0.6, 0.01, 2, 16);
    const startPinMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    const startPin = new THREE.Mesh(startPinGeo, startPinMat);
    startPin.position.set(-18, 5, -18);
    scene.add(startPin);

    const destPinGeo = new THREE.CylinderGeometry(0.6, 0.01, 2, 16);
    const destPinMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const destPin = new THREE.Mesh(destPinGeo, destPinMat);
    destPin.position.set(16, 4, 16);
    scene.add(destPin);

    // Animation Loop
    let t = 0;
    let animId: number;

    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      if (isPlayingRef.current) {
        const speed = 0.035 * speedRef.current;
        t = (t + delta * speed) % 1;

        // Position drone along flight path curve
        const pos = flightCurve.getPointAt(t);
        const tangent = flightCurve.getTangentAt(t).normalize();
        drone.position.copy(pos);

        // Orient drone towards direction of travel
        const lookTarget = pos.clone().add(tangent);
        drone.lookAt(lookTarget);

        // Spin rotors
        rotors.forEach((rotor, idx) => {
          rotor.rotation.y += (idx % 2 === 0 ? 0.4 : -0.4) * speedRef.current;
        });

        // Dynamic Camera Handling
        const mode = cameraModeRef.current;
        if (mode === 'orbit') {
          const orbitAngle = Date.now() * 0.0003;
          camera.position.x = Math.sin(orbitAngle) * 24;
          camera.position.z = Math.cos(orbitAngle) * 24;
          camera.position.y = 16;
          camera.lookAt(pos);
        } else if (mode === 'chase') {
          // Drone POV Camera directly behind drone
          const offset = tangent.clone().multiplyScalar(-3.8).add(new THREE.Vector3(0, 1.4, 0));
          camera.position.copy(pos).add(offset);
          camera.lookAt(pos.clone().add(tangent.clone().multiplyScalar(4)));
        } else if (mode === 'top') {
          // Tactical Top View
          camera.position.set(pos.x, 26, pos.z);
          camera.lookAt(pos.x, 0, pos.z);
        }

        // Live telemetry calculation
        const percent = Math.floor(t * 100);
        setDroneProgress(percent);
        const eta = Math.max(1, Math.floor((1 - t) * 28 / speedRef.current));
        setEtaSeconds(eta);

        // Thermodynamic heat dissipation calculation
        const simulatedTemp = parseFloat((89.4 - (t * 6.8)).toFixed(1));
        if (!propOrder?.telemetry?.currentTemp) {
          setDroneTemp(simulatedTemp);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

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
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 overflow-hidden shadow-2xl backdrop-blur-xl">
      <div className="relative w-full h-[460px] sm:h-[540px] overflow-hidden" ref={containerRef}>
        
        {/* Top Left Live Connection & Handover Status Overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-sm pointer-events-auto">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/80 border border-orange-500/50 backdrop-blur-md text-xs text-white shadow-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${droneConnected ? 'bg-cyan-400' : 'bg-amber-400'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${droneConnected ? 'bg-cyan-500' : 'bg-amber-500'}`} />
            </span>
            <div>
              <div className="flex items-center gap-1.5 font-bold">
                <span className={droneConnected ? 'text-cyan-400' : 'text-amber-400'}>
                  {droneConnected ? '🚁 3D Drone #DR-402 Connected' : '👨‍🍳 Chef in Kitchen Preparing'}
                </span>
              </div>
              <p className="text-[10px] text-slate-300">
                {currentOrder ? `Order #${currentOrder.id.slice(-6)}: ${currentOrder.dish}` : 'No active order (Standby Flight Sim)'}
              </p>
            </div>
          </div>

          {/* Chef to Drone Handover Action Button if order is in PREPARING or QUALITY_CHECK */}
          {currentOrder && currentOrder.status !== 'DELIVERED' && (
            <div className="p-2.5 rounded-2xl bg-slate-950/90 border border-white/10 backdrop-blur-md shadow-2xl space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Order Lifecycle:</span>
                <span className="font-bold text-orange-400 font-mono uppercase">{currentOrder.status}</span>
              </div>

              {currentOrder.status !== 'OUT_FOR_DELIVERY' ? (
                <button
                  onClick={handleChefHandover}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Chef: Order Ready ➔ Launch Drone 🚀</span>
                </button>
              ) : (
                <div className="text-[11px] text-cyan-300 font-semibold flex items-center gap-1.5 py-0.5">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Drone En-Route at 36 km/h • 5G Live Link</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Top Right Camera & Speed Controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {/* Camera Perspective Mode */}
          <div className="flex bg-black/70 border border-white/10 p-1 rounded-xl backdrop-blur-md">
            {[
              { id: 'orbit', label: '3D Orbit' },
              { id: 'chase', label: 'Drone POV' },
              { id: 'top', label: 'Tactical Top' }
            ].map((cam) => (
              <button
                key={cam.id}
                onClick={() => setCameraMode(cam.id as CameraMode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  cameraMode === cam.id
                    ? 'bg-orange-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-black/70 border border-white/10 text-white hover:bg-orange-500/30 transition backdrop-blur-md"
            title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        {/* Floating Live Mission HUD */}
        <div className="absolute bottom-4 left-4 z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl pointer-events-none">
          <div className="p-3 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-md pointer-events-auto shadow-xl">
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-rose-400 animate-pulse" /> Food Temperature
            </p>
            <p className="text-lg font-black text-rose-400 mt-0.5">{droneTemp}°C</p>
            <span className="text-[10px] text-emerald-400 font-semibold">✓ Heated Induction Core</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-md pointer-events-auto shadow-xl">
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Arrival In
            </p>
            <p className="text-lg font-black text-amber-400 mt-0.5">
              {currentOrder ? currentOrder.eta : `${etaSeconds}s`}
            </p>
            <span className="text-[10px] text-slate-400">SkyRoute Transit</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-md pointer-events-auto shadow-xl">
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-blue-400" /> Flight Progress
            </p>
            <p className="text-lg font-black text-blue-400 mt-0.5">{droneProgress}%</p>
            <span className="text-[10px] text-slate-400">Waypoints 4/4</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-md pointer-events-auto shadow-xl">
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-orange-400" /> Drone Speed
            </p>
            <div className="flex gap-1 mt-1">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSpeedMultiplier(spd)}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                    speedMultiplier === spd
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Simulator Legend */}
      <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-white/10 text-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-orange-400 font-semibold">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
              Pickup: {currentOrder?.restaurantName || 'Artisan Kitchen Hearth'}
            </span>
            <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              Dropoff: {currentOrder?.deliveryAddress || 'Skyline Customer Destination'}
            </span>
          </div>
          <p className="text-slate-400 text-center sm:text-right">
            Connected to Localhost Real-Time Backend with 5G Telemetry & Thermal Induction Tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThermalDeliveryCity3D;
