'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { HeartUniverseEngine } from './HeartUniverseEngine';
import { BirthdayCake3D } from './BirthdayCake3D';

export type ExperienceStage = 'universe' | 'text' | 'cake';

interface SceneCanvasProps {
  stage: ExperienceStage;
  onTextComplete?: () => void;
  onCakeComplete?: () => void;
  onCanvasReady?: () => void;
  isCandlesBlown?: boolean;
}

export function SceneCanvas({
  stage,
  onTextComplete,
  onCakeComplete,
  onCanvasReady,
  isCandlesBlown,
}: SceneCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const universeEngineRef = useRef<HeartUniverseEngine | null>(null);
  const cakeEngineRef = useRef<BirthdayCake3D | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Drag rotation physics state
  const isDraggingRef = useRef<boolean>(false);
  const prevPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Guard flags: once drawn/morphed, do NOT re-draw a 2nd time
  const hasTextMorphedRef = useRef<boolean>(false);
  const hasCakeDrawnRef = useRef<boolean>(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const isMobile = width < 768 || (width / height < 0.85);

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05020a, 0.016);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, isMobile ? 15.0 : 12.0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffeaf2, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xff88bb, 2.8);
    keyLight.position.set(8, 12, 10);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x77bbff, 2.0);
    rimLight.position.set(-8, -6, -8);
    scene.add(rimLight);

    // Warm frontal fill light for cake fondant details & "happy birthday em" plaque
    const fillLight = new THREE.DirectionalLight(0xfff0dd, 1.6);
    fillLight.position.set(0, 4, 12);
    scene.add(fillLight);

    // 3. Initialize Heart Universe Engine (3D Cosmos & Text)
    const universe = new HeartUniverseEngine();
    universe.prepareTextTargets(isMobile);
    scene.add(universe.group);
    universeEngineRef.current = universe;

    // 4. Initialize 3D Birthday Cake Engine (Magic Pen, 3 Tiers, Number 16)
    const cake = new BirthdayCake3D();
    scene.add(cake.group);
    cake.setVisible(false);
    cakeEngineRef.current = cake;

    // 5. Free 360-degree Orbit & Drag Interaction
    const handlePointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest('button')) return;
      isDraggingRef.current = true;
      prevPointerRef.current = { x: e.clientX, y: e.clientY };
      velocityRef.current = { x: 0, y: 0 };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevPointerRef.current.x;
      const dy = e.clientY - prevPointerRef.current.y;
      const isMob = window.innerWidth < 768;
      const sensitivity = isMob ? 0.007 : 0.005;

      velocityRef.current = {
        x: dx * sensitivity,
        y: dy * sensitivity,
      };

      prevPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 6. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const isMob = w < 768 || (w / h < 0.85);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (cameraRef.current) {
        if (cakeEngineRef.current?.group.visible) {
          cameraRef.current.position.z = isMob ? 16.5 : 11.2;
          cameraRef.current.position.y = isMob ? -0.8 : 0;
        } else {
          cameraRef.current.position.z = isMob ? 15.0 : 12.0;
        }
      }
    };
    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animId: number;
    let lastTime = performance.now();
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const time = (now - startTime) * 0.001;
      const delta = Math.min((now - lastTime) * 0.001, 0.1);
      lastTime = now;

      // Apply drag momentum to 3D rotation
      const vx = velocityRef.current.x;
      const vy = velocityRef.current.y * 0.5;

      if (cake.group.visible) {
        // Cake stays steady facing forward, no auto-rotation
        cake.group.rotation.y = THREE.MathUtils.lerp(cake.group.rotation.y, 0, 0.08);
        cake.group.rotation.x = THREE.MathUtils.lerp(cake.group.rotation.x, 0.14, 0.08);

        // Keep universe rain aligned with camera so hearts constantly fall straight down tràn màn hình
        universe.group.rotation.y = THREE.MathUtils.lerp(universe.group.rotation.y, 0, 0.05);
        universe.group.rotation.x = THREE.MathUtils.lerp(universe.group.rotation.x, 0, 0.05);
      } else {
        // In cosmos stage: dragging rotates the 3D universe
        universe.group.rotation.y += vx;
        universe.group.rotation.x += vy;
      }

      // Damping
      velocityRef.current.x *= 0.94;
      velocityRef.current.y *= 0.94;

      universe.update(time);
      cake.update(time, delta);

      renderer.render(scene, camera);
    };
    animate();

    if (onCanvasReady) onCanvasReady();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      universe.dispose();
      cake.dispose();
      renderer.dispose();
    };
  }, [onCanvasReady]);

  // Handle Stage Transitions
  useEffect(() => {
    // STAGE 2: Morph Hearts to Text
    if (stage === 'text' && universeEngineRef.current) {
      if (!hasTextMorphedRef.current) {
        hasTextMorphedRef.current = true;
        universeEngineRef.current.explodeAndMorphToText(onTextComplete);

        if (universeEngineRef.current.group) {
          gsap.to(universeEngineRef.current.group.rotation, {
            x: 0,
            y: 0,
            duration: 1.5,
            ease: 'power2.out',
          });
        }
      }
    }

    // STAGE 3: Disperse Text & Draw 3D Birthday Cake with Magic Pen (ONLY ONCE!)
    if (stage === 'cake' && cakeEngineRef.current && universeEngineRef.current) {
      if (hasCakeDrawnRef.current) {
        // Khi tạo xong bánh lần 1 thì KHÔNG vẽ lại lần thứ 2!
        return;
      }
      hasCakeDrawnRef.current = true;

      // 1. Gently disperse text particles into cosmic background
      universeEngineRef.current.disperseForCake();

      // 2. Center and position camera for cake and banner layout
      if (cameraRef.current) {
        const isMob = window.innerWidth < 768 || (window.innerWidth / window.innerHeight < 0.85);
        gsap.to(cameraRef.current.position, {
          x: 0,
          y: isMob ? -0.8 : 0,
          z: isMob ? 16.5 : 11.2,
          duration: 1.8,
          ease: 'power2.inOut',
        });
      }

      // 3. Reset cake rotation to regal front perspective
      gsap.to(cakeEngineRef.current.group.rotation, {
        x: 0.14,
        y: 0,
        duration: 1.2,
        ease: 'power2.out',
      });

      // 4. Trigger Magic Pen Drawing Animation!
      cakeEngineRef.current.playDrawWithPenAnimation(onCakeComplete);
    }
  }, [stage, onTextComplete, onCakeComplete]);

  // Handle Candle Blowing
  useEffect(() => {
    if (isCandlesBlown && cakeEngineRef.current) {
      cakeEngineRef.current.blowCandles();
    }
  }, [isCandlesBlown]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-auto touch-none select-none cursor-grab active:cursor-grabbing"
    />
  );
}
