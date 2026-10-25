'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Sparkles, 
  Flame, 
  Thermometer, 
  Layers, 
  RotateCw, 
  ShieldCheck, 
  Maximize2,
  UtensilsCrossed,
  Info
} from 'lucide-react';

export type DishType = 'burger' | 'ramen' | 'salmon' | 'matcha';

interface DishInfo {
  name: string;
  subtitle: string;
  temp: string;
  quality: number;
  calories: string;
  protein: string;
  thermalSeal: string;
  description: string;
}

const DISH_DETAILS: Record<DishType, DishInfo> = {
  burger: {
    name: 'Wagyu Truffle Smash Burger',
    subtitle: 'A5 Wagyu • Aged Cheddar • Brioche Bun',
    temp: '89.2°C',
    quality: 99,
    calories: '740 kcal',
    protein: '46g Protein',
    thermalSeal: 'Double Foil Induction',
    description: 'Triple layered thermal preservation ensures brioche stays airy and crust remains crisp.'
  },
  ramen: {
    name: '24hr Black Garlic Tonkotsu',
    subtitle: 'Chashu Pork • Molten Egg • Hand-Pulled Noodles',
    temp: '91.5°C',
    quality: 98,
    calories: '820 kcal',
    protein: '38g Protein',
    thermalSeal: 'Vacuum Broth Flask',
    description: 'Broth sealed in dedicated dual-chamber insulated flask at boiling temperature.'
  },
  salmon: {
    name: 'Glazed Truffle Salmon Roll',
    subtitle: 'Wild Alaskan Salmon • Avocado • Flying Fish Roe',
    temp: '14.5°C',
    quality: 97,
    calories: '520 kcal',
    protein: '34g Protein',
    thermalSeal: 'Cryo-Chilled Eco Pack',
    description: 'Maintained at optimal sushi chilling temperature with phase-change cold pads.'
  },
  matcha: {
    name: 'Cyber Matcha Lava Fondant',
    subtitle: 'Uji Matcha Core • Dark Chocolate • Gold Leaf',
    temp: '76.0°C',
    quality: 96,
    calories: '440 kcal',
    protein: '12g Protein',
    thermalSeal: 'Thermal Steam Shield',
    description: 'Kept in moisture-balanced steam pouch so the molten lava interior stays liquid.'
  }
};

export const FoodHologram3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDish, setActiveDish] = useState<DishType>('burger');
  const [exploded, setExploded] = useState(false);
  const [thermalScanActive, setThermalScanActive] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  // References for three.js manipulation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const dishGroupRef = useRef<THREE.Group | null>(null);
  const steamParticlesRef = useRef<THREE.Points | null>(null);
  const ringsRef = useRef<THREE.Group | null>(null);
  const explodedRef = useRef(false);
  explodedRef.current = exploded;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3.5, 7.5);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffaa44, 2.5);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const blueBackLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    blueBackLight.position.set(-5, 4, -5);
    scene.add(blueBackLight);

    const pointLight = new THREE.PointLight(0xf97316, 3, 10);
    pointLight.position.set(0, 1.5, 0);
    scene.add(pointLight);

    // Holographic Pedestal / Base Grid
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    const gridGeo = new THREE.RingGeometry(1.8, 2.6, 32);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const gridRing = new THREE.Mesh(gridGeo, gridMat);
    gridRing.rotation.x = Math.PI / 2;
    gridRing.position.y = -1.2;
    baseGroup.add(gridRing);

    const innerDiscGeo = new THREE.CircleGeometry(1.7, 32);
    const innerDiscMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.85
    });
    const innerDisc = new THREE.Mesh(innerDiscGeo, innerDiscMat);
    innerDisc.rotation.x = -Math.PI / 2;
    innerDisc.position.y = -1.21;
    baseGroup.add(innerDisc);

    // Orbital Hologram Rings
    const ringsGroup = new THREE.Group();
    ringsRef.current = ringsGroup;
    scene.add(ringsGroup);

    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.3, 0.015, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0xfb923c, transparent: true, opacity: 0.6 })
    );
    ring1.rotation.x = Math.PI / 3;
    ringsGroup.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.5, 0.012, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 })
    );
    ring2.rotation.y = Math.PI / 4;
    ringsGroup.add(ring2);

    // Steam / Aroma Particle System
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 1.4;
      particlePositions[i * 3 + 1] = Math.random() * 2.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
      particleSpeeds[i] = 0.01 + Math.random() * 0.015;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const steam = new THREE.Points(particleGeo, particleMat);
    steamParticlesRef.current = steam;
    scene.add(steam);

    // Dish Models Container
    const dishGroup = new THREE.Group();
    dishGroupRef.current = dishGroup;
    scene.add(dishGroup);

    // Helper to build 3D dishes
    const buildDish = (type: DishType) => {
      // Clear previous dish meshes
      while (dishGroup.children.length > 0) {
        dishGroup.remove(dishGroup.children[0]);
      }

      if (type === 'burger') {
        // BURGER MODEL
        // Top Bun
        const topBunGeo = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const bunMat = new THREE.MeshStandardMaterial({
          color: 0xca8a04,
          roughness: 0.5,
          metalness: 0.1
        });
        const topBun = new THREE.Mesh(topBunGeo, bunMat);
        topBun.scale.set(1, 0.65, 1);
        topBun.position.y = 0.45;
        topBun.name = 'topBun';
        dishGroup.add(topBun);

        // Sesame Seeds on top
        for (let i = 0; i < 24; i++) {
          const seedGeo = new THREE.ConeGeometry(0.025, 0.06, 6);
          const seedMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
          const seed = new THREE.Mesh(seedGeo, seedMat);
          const u = Math.random() * Math.PI * 2;
          const v = Math.random() * 0.5 + 0.2;
          seed.position.set(Math.cos(u) * 0.9 * v, 0.75 + (1 - v) * 0.2, Math.sin(u) * 0.9 * v);
          seed.rotation.set(Math.random(), Math.random(), Math.random());
          topBun.add(seed);
        }

        // Tomato Slice
        const tomatoGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.12, 32);
        const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
        const tomato = new THREE.Mesh(tomatoGeo, tomatoMat);
        tomato.position.y = 0.25;
        tomato.name = 'tomato';
        dishGroup.add(tomato);

        // Melted Cheese
        const cheeseGeo = new THREE.BoxGeometry(2.1, 0.08, 2.1);
        const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
        const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
        cheese.rotation.y = Math.PI / 6;
        cheese.position.y = 0.1;
        cheese.name = 'cheese';
        dishGroup.add(cheese);

        // Patty
        const pattyGeo = new THREE.CylinderGeometry(1.2, 1.22, 0.35, 32);
        const pattyMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
        const patty = new THREE.Mesh(pattyGeo, pattyMat);
        patty.position.y = -0.15;
        patty.name = 'patty';
        dishGroup.add(patty);

        // Lettuce Frills
        const lettuceGeo = new THREE.TorusGeometry(1.2, 0.12, 16, 32);
        const lettuceMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 });
        const lettuce = new THREE.Mesh(lettuceGeo, lettuceMat);
        lettuce.rotation.x = Math.PI / 2;
        lettuce.position.y = -0.35;
        lettuce.name = 'lettuce';
        dishGroup.add(lettuce);

        // Bottom Bun
        const botBunGeo = new THREE.CylinderGeometry(1.15, 1.1, 0.3, 32);
        const botBun = new THREE.Mesh(botBunGeo, bunMat);
        botBun.position.y = -0.55;
        botBun.name = 'botBun';
        dishGroup.add(botBun);

      } else if (type === 'ramen') {
        // RAMEN MODEL
        // Bowl
        const bowlGeo = new THREE.CylinderGeometry(1.5, 0.7, 1.1, 32, 1, true);
        const bowlMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.2,
          metalness: 0.5,
          side: THREE.DoubleSide
        });
        const bowl = new THREE.Mesh(bowlGeo, bowlMat);
        bowl.position.y = -0.2;
        dishGroup.add(bowl);

        // Bowl Rim Accent
        const rimGeo = new THREE.TorusGeometry(1.5, 0.04, 16, 32);
        const rimMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.35;
        dishGroup.add(rim);

        // Rich Broth Surface
        const brothGeo = new THREE.CircleGeometry(1.4, 32);
        const brothMat = new THREE.MeshStandardMaterial({
          color: 0xd97706,
          roughness: 0.1,
          metalness: 0.2
        });
        const broth = new THREE.Mesh(brothGeo, brothMat);
        broth.rotation.x = -Math.PI / 2;
        broth.position.y = 0.22;
        dishGroup.add(broth);

        // Molten Egg Halves
        const eggWhiteGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const eggWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const egg = new THREE.Mesh(eggWhiteGeo, eggWhiteMat);
        egg.scale.set(1, 0.5, 1.3);
        egg.position.set(0.4, 0.28, 0.3);
        dishGroup.add(egg);

        const yolkGeo = new THREE.SphereGeometry(0.2, 16, 16);
        const yolkMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.2 });
        const yolk = new THREE.Mesh(yolkGeo, yolkMat);
        yolk.position.set(0.4, 0.34, 0.3);
        dishGroup.add(yolk);

        // Nori Seaweed Sheet
        const noriGeo = new THREE.PlaneGeometry(0.6, 1.0);
        const noriMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, side: THREE.DoubleSide });
        const nori = new THREE.Mesh(noriGeo, noriMat);
        nori.position.set(-0.7, 0.6, -0.4);
        nori.rotation.set(0.3, 0.6, -0.2);
        dishGroup.add(nori);

        // Chopsticks
        const chopstickGeo = new THREE.CylinderGeometry(0.03, 0.05, 2.6, 16);
        const chopstickMat = new THREE.MeshStandardMaterial({ color: 0xb45309 });
        const stick1 = new THREE.Mesh(chopstickGeo, chopstickMat);
        stick1.rotation.set(Math.PI / 2.5, 0, Math.PI / 4);
        stick1.position.set(0.5, 0.8, -0.3);
        dishGroup.add(stick1);

      } else if (type === 'salmon') {
        // SALMON SUSHI ROLL MODEL
        // 3 Sushi Pieces
        for (let i = -1; i <= 1; i++) {
          const sushiGroup = new THREE.Group();
          sushiGroup.position.set(i * 1.1, 0, 0);

          // Nori Wrap Outer Ring
          const noriRingGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.5, 32, 1, true);
          const noriRingMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.8 });
          const noriRing = new THREE.Mesh(noriRingGeo, noriRingMat);
          sushiGroup.add(noriRing);

          // Rice Core
          const riceGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.48, 32);
          const riceMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
          const rice = new THREE.Mesh(riceGeo, riceMat);
          sushiGroup.add(rice);

          // Salmon Center
          const salmonGeo = new THREE.BoxGeometry(0.3, 0.52, 0.3);
          const salmonMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 });
          const salmon = new THREE.Mesh(salmonGeo, salmonMat);
          sushiGroup.add(salmon);

          // Avocado wedge
          const avocadoGeo = new THREE.BoxGeometry(0.15, 0.52, 0.15);
          const avocadoMat = new THREE.MeshStandardMaterial({ color: 0x84cc16 });
          const avocado = new THREE.Mesh(avocadoGeo, avocadoMat);
          avocado.position.set(0.12, 0, 0.12);
          sushiGroup.add(avocado);

          dishGroup.add(sushiGroup);
        }

        // Wooden Geta Serving Plate
        const plateGeo = new THREE.BoxGeometry(3.6, 0.15, 1.5);
        const plateMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
        const plate = new THREE.Mesh(plateGeo, plateMat);
        plate.position.y = -0.32;
        dishGroup.add(plate);

      } else if (type === 'matcha') {
        // MATCHA LAVA CAKE MODEL
        // Outer Chocolate Cake Ring
        const cakeGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.9, 32);
        const cakeMat = new THREE.MeshStandardMaterial({ color: 0x271306, roughness: 0.8 });
        const cake = new THREE.Mesh(cakeGeo, cakeMat);
        cake.position.y = -0.2;
        dishGroup.add(cake);

        // Molten Matcha Core (Glowing)
        const moltenGeo = new THREE.CylinderGeometry(0.65, 0.5, 0.95, 32);
        const moltenMat = new THREE.MeshStandardMaterial({
          color: 0x4ade80,
          emissive: 0x22c55e,
          emissiveIntensity: 0.6,
          roughness: 0.1
        });
        const molten = new THREE.Mesh(moltenGeo, moltenMat);
        molten.position.y = -0.15;
        dishGroup.add(molten);

        // Matcha Powder Dusting
        for (let i = 0; i < 40; i++) {
          const dustGeo = new THREE.DodecahedronGeometry(0.035);
          const dustMat = new THREE.MeshBasicMaterial({ color: 0x86efac });
          const dust = new THREE.Mesh(dustGeo, dustMat);
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 1.1 + 0.1;
          dust.position.set(Math.cos(angle) * radius, 0.28, Math.sin(angle) * radius);
          dishGroup.add(dust);
        }

        // Gold Leaf Accents
        const goldGeo = new THREE.PlaneGeometry(0.18, 0.18);
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          metalness: 0.9,
          roughness: 0.1,
          side: THREE.DoubleSide
        });
        const gold = new THREE.Mesh(goldGeo, goldMat);
        gold.position.set(0.1, 0.32, 0.2);
        gold.rotation.x = -Math.PI / 3;
        dishGroup.add(gold);
      }
    };

    buildDish(activeDish);

    // Mouse Interaction / Drag to Rotate
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dishGroupRef.current) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      dishGroupRef.current.rotation.y += deltaX * 0.008;
      dishGroupRef.current.rotation.x += deltaY * 0.008;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };

    // Touch events for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !dishGroupRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      dishGroupRef.current.rotation.y += deltaX * 0.008;
      dishGroupRef.current.rotation.x += deltaY * 0.008;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => { isDragging = false; };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Resize Handler
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Dish float & auto rotation
      if (dishGroupRef.current) {
        dishGroupRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.12;
        if (autoRotate && !isDragging) {
          dishGroupRef.current.rotation.y += 0.008;
        }

        // Animate exploded state if burger
        if (activeDish === 'burger') {
          const topBun = dishGroupRef.current.getObjectByName('topBun');
          const tomato = dishGroupRef.current.getObjectByName('tomato');
          const cheese = dishGroupRef.current.getObjectByName('cheese');
          const patty = dishGroupRef.current.getObjectByName('patty');
          const lettuce = dishGroupRef.current.getObjectByName('lettuce');
          const botBun = dishGroupRef.current.getObjectByName('botBun');

          const targetOffset = explodedRef.current ? 1.0 : 0.0;

          if (topBun) topBun.position.y = THREE.MathUtils.lerp(topBun.position.y, 0.45 + targetOffset * 1.2, 0.08);
          if (tomato) tomato.position.y = THREE.MathUtils.lerp(tomato.position.y, 0.25 + targetOffset * 0.7, 0.08);
          if (cheese) cheese.position.y = THREE.MathUtils.lerp(cheese.position.y, 0.1 + targetOffset * 0.35, 0.08);
          if (patty) patty.position.y = THREE.MathUtils.lerp(patty.position.y, -0.15 - targetOffset * 0.1, 0.08);
          if (lettuce) lettuce.position.y = THREE.MathUtils.lerp(lettuce.position.y, -0.35 - targetOffset * 0.45, 0.08);
          if (botBun) botBun.position.y = THREE.MathUtils.lerp(botBun.position.y, -0.55 - targetOffset * 0.9, 0.08);
        }
      }

      // Orbital rings animation
      if (ringsRef.current) {
        ringsRef.current.rotation.z = elapsedTime * 0.3;
        ringsRef.current.rotation.y = elapsedTime * 0.2;
      }

      // Steam Particle Animation
      if (steamParticlesRef.current) {
        const positions = steamParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += particleSpeeds[i];
          positions[i * 3] += Math.sin(elapsedTime * 2 + i) * 0.003;
          if (positions[i * 3 + 1] > 2.8) {
            positions[i * 3 + 1] = 0.2;
            positions[i * 3] = (Math.random() - 0.5) * 1.2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
          }
        }
        steamParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeDish, autoRotate]);

  const currentInfo = DISH_DETAILS[activeDish];

  return (
    <div className="relative w-full rounded-3xl bg-slate-900/90 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* 3D Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-[460px] sm:h-[540px] cursor-grab active:cursor-grabbing relative"
      >
        {/* Top Floating HUD Indicator */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-xs text-white">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span>Interactive 3D Hologram (Drag to Rotate)</span>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl backdrop-blur-md border transition text-xs font-semibold flex items-center gap-1.5 ${
              autoRotate 
                ? 'bg-orange-500/30 border-orange-500/50 text-orange-300' 
                : 'bg-black/60 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle Auto Rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Auto-Spin</span>
          </button>

          {activeDish === 'burger' && (
            <button
              onClick={() => setExploded(!exploded)}
              className={`p-2 rounded-xl backdrop-blur-md border transition text-xs font-semibold flex items-center gap-1.5 ${
                exploded 
                  ? 'bg-orange-500/40 border-orange-500/60 text-orange-200 shadow-lg shadow-orange-500/20' 
                  : 'bg-black/60 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{exploded ? 'Collapse Layers' : 'Explode 3D Layers'}</span>
            </button>
          )}
        </div>

        {/* Live 3D Holographic HUD Stats Overlay */}
        <div className="absolute bottom-4 left-4 z-10 hidden sm:flex flex-col gap-2 max-w-xs pointer-events-none">
          <div className="p-3 rounded-2xl bg-black/70 border border-white/10 backdrop-blur-md text-xs space-y-1.5 pointer-events-auto">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1 text-orange-400 font-semibold">
                <Thermometer className="w-3.5 h-3.5" /> Core Temp
              </span>
              <span className="font-bold text-white">{currentInfo.temp}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Quality Matrix
              </span>
              <span className="font-bold text-white">{currentInfo.quality}/100</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Thermal Seal:</span>
              <span className="text-amber-300 font-mono text-[11px]">{currentInfo.thermalSeal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dish Switcher Bar */}
      <div className="p-4 sm:p-6 bg-slate-950/90 border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Active Dish Summary */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-black text-white">{currentInfo.name}</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {currentInfo.calories}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {currentInfo.protein}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{currentInfo.subtitle}</p>
            <p className="text-xs text-orange-200/80 mt-1">{currentInfo.description}</p>
          </div>

          {/* Dish Selection Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'burger', label: '🍔 Wagyu Burger' },
              { id: 'ramen', label: '🍜 Tonkotsu Ramen' },
              { id: 'salmon', label: '🍣 Truffle Salmon' },
              { id: 'matcha', label: '🍵 Matcha Lava' }
            ].map((dish) => (
              <button
                key={dish.id}
                onClick={() => {
                  setActiveDish(dish.id as DishType);
                  setExploded(false);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeDish === dish.id
                    ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/25 scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                {dish.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodHologram3D;
