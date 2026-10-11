'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createHeartSpriteTexture } from './HeartTextureHelper';

interface CosmicHeartUniverse3DProps {
  photos: string[];
  wishes: string[];
  isPaused?: boolean;
  speedMultiplier?: number;
  onPhotoClick?: (src: string) => void;
}

export function CosmicHeartUniverse3D({
  photos,
  wishes,
  isPaused = false,
  speedMultiplier = 1,
  onPhotoClick,
}: CosmicHeartUniverse3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef<boolean>(isPaused);
  const speedMultiplierRef = useRef<number>(speedMultiplier);
  const onPhotoClickRef = useRef(onPhotoClick);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    speedMultiplierRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    onPhotoClickRef.current = onPhotoClick;
  }, [onPhotoClick]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const isMobile = width < 768;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06020c, 0.013);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 150);
    camera.position.set(0, 0, isMobile ? 18.5 : 14.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    const heartTexture = createHeartSpriteTexture();

    // =========================================================================
    // ROOT 3D UNIVERSE GROUP: Stays still by default!
    // Rotates 360 degrees ONLY when user touches/drags the screen!
    // =========================================================================
    const universeGroup = new THREE.Group();
    scene.add(universeGroup);

    // =========================================================================
    // 2. ULTRA-DENSE 3D VOLUMETRIC GLOWING HEART (18,000 particles)
    // Curvature guaranteed: classic parametric contour + smooth ellipsoidal depth
    // Perfectly curved, plump, glowing ruby & diamond starlight!
    // =========================================================================
    const heartGroup = new THREE.Group();
    universeGroup.add(heartGroup);

    const heartCount = isMobile ? 10000 : 18000;
    const heartGeo = new THREE.BufferGeometry();
    const heartPos = new Float32Array(heartCount * 3);
    const heartColors = new Float32Array(heartCount * 3);

    for (let i = 0; i < heartCount; i++) {
      const idx = i * 3;

      // Parametric angle t around heart contour
      const t = Math.random() * Math.PI * 2;
      // Classic 2D parametric heart coordinates centered vertically at 0
      const x0 = 16 * Math.pow(Math.sin(t), 3);
      const y0 = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) + 2.35;

      // Vertical ratio from tip (0) to top lobes (1)
      const vRatio = Math.max(0, Math.min(1, (y0 + 14.6) / 29.2));
      // Taper depth smoothly towards bottom tip
      const taper = Math.pow(vRatio, 0.55);

      let x: number;
      let y: number;
      let z: number;
      let cr: number, cg: number, cb: number;

      const layer = Math.random();

      if (layer < 0.38) {
        // LAYER 1: Dense, crisp outer boundary contour
        const r = 0.95 + Math.random() * 0.08;
        x = x0 * r;
        y = y0 * r;
        z = (Math.random() - 0.5) * 1.8 * taper;

        if (Math.random() < 0.55) {
          cr = 1.0; cg = 0.12; cb = 0.52; // Radiant magenta ruby
        } else {
          cr = 1.0; cg = 0.44; cb = 0.76; // Luminous rose
        }
      } else if (layer < 0.82) {
        // LAYER 2: Volumetric 3D plump cushion
        const r = Math.pow(Math.random(), 0.42);
        const phi = Math.random() * Math.PI * 2;
        const depth = Math.sqrt(Math.max(0.04, 1 - r * r)) * 6.5 * taper;

        x = x0 * r;
        y = y0 * r;
        z = Math.sin(phi) * depth;

        const c = Math.random();
        if (c < 0.45) {
          cr = 1.0; cg = 0.22; cb = 0.6; // Glowing ruby
        } else if (c < 0.78) {
          cr = 1.0; cg = 0.52; cb = 0.82; // Soft romantic blush
        } else {
          cr = 1.0; cg = 0.88; cb = 0.96; // Diamond star highlight
        }
      } else {
        // LAYER 3: Dense glowing radiance core
        const r = Math.pow(Math.random(), 0.65) * 0.55;
        x = x0 * r;
        y = y0 * r;
        z = (Math.random() - 0.5) * 4.0 * r;

        if (Math.random() < 0.6) {
          cr = 1.0; cg = 0.92; cb = 0.98; // Diamond star
        } else {
          cr = 1.0; cg = 0.35; cb = 0.72; // Bright vibrant ruby
        }
      }

      // Overall scale to fit scene gracefully
      const scale = 0.165;
      heartPos[idx] = x * scale;
      heartPos[idx + 1] = y * scale + 0.2; // subtle vertical centering
      heartPos[idx + 2] = z * scale;

      heartColors[idx] = cr;
      heartColors[idx + 1] = cg;
      heartColors[idx + 2] = cb;
    }

    heartGeo.setAttribute('position', new THREE.BufferAttribute(heartPos, 3));
    heartGeo.setAttribute('color', new THREE.BufferAttribute(heartColors, 3));

    const heartMat = new THREE.PointsMaterial({
      size: 0.26,
      map: heartTexture,
      transparent: true,
      alphaTest: 0.02,
      vertexColors: true,
      depthWrite: false,
      opacity: 0.96,
    });

    const heartMesh = new THREE.Points(heartGeo, heartMat);
    heartGroup.add(heartMesh);

    // =========================================================================
    // 3A. EXPANSIVE SPIRAL GALAXY BACKGROUND (20,000 particles)
    // 4 graceful spiral arms surrounding the 3D heart
    // =========================================================================
    const galaxyCount = isMobile ? 10000 : 20000;
    const galaxyGeo = new THREE.BufferGeometry();
    const galaxyPos = new Float32Array(galaxyCount * 3);
    const galaxyColors = new Float32Array(galaxyCount * 3);

    for (let i = 0; i < galaxyCount; i++) {
      const idx = i * 3;
      const armIndex = i % 4; // 4 spiral arms
      const armAngle = (armIndex * Math.PI) / 2;
      const radius = 2.8 + Math.pow(Math.random(), 0.65) * 22.0;
      const spiralAngle = armAngle + radius * 0.42 + (Math.random() - 0.5) * 0.45;

      galaxyPos[idx] = Math.cos(spiralAngle) * radius;
      galaxyPos[idx + 1] = (Math.random() - 0.5) * 5.0 + Math.sin(radius * 0.25) * 1.2;
      galaxyPos[idx + 2] = Math.sin(spiralAngle) * radius * 0.6 + (Math.random() - 0.5) * 3.8;

      const c = Math.random();
      if (c < 0.38) {
        galaxyColors[idx] = 1.0;
        galaxyColors[idx + 1] = 0.88;
        galaxyColors[idx + 2] = 0.98; // Diamond starlight
      } else if (c < 0.72) {
        galaxyColors[idx] = 1.0;
        galaxyColors[idx + 1] = 0.38;
        galaxyColors[idx + 2] = 0.72; // Soft glowing rose
      } else {
        galaxyColors[idx] = 0.75;
        galaxyColors[idx + 1] = 0.3;
        galaxyColors[idx + 2] = 0.95; // Violet cosmic nebula
      }
    }

    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPos, 3));
    galaxyGeo.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));

    const galaxyMat = new THREE.PointsMaterial({
      size: 0.18,
      map: heartTexture,
      transparent: true,
      alphaTest: 0.02,
      vertexColors: true,
      depthWrite: false,
      opacity: 0.82,
    });
    const galaxyMesh = new THREE.Points(galaxyGeo, galaxyMat);
    universeGroup.add(galaxyMesh);

    // =========================================================================
    // 3B. DENSE CONTINUOUS FALLING HEARTS RAIN (1,600 - 2,400 particles)
    // Cascades down smoothly across the entire screen!
    // =========================================================================
    const rainCount = isMobile ? 1400 : 2400;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    const rainColors = new Float32Array(rainCount * 3);
    const rainSpeeds = new Float32Array(rainCount);
    const rainDrifts = new Float32Array(rainCount);
    const rainAmps = new Float32Array(rainCount);

    for (let i = 0; i < rainCount; i++) {
      const idx = i * 3;
      // Spread across wide viewport
      rainPos[idx] = (Math.random() - 0.5) * 54;
      rainPos[idx + 1] = -24 + Math.random() * 48;
      rainPos[idx + 2] = -18 + Math.random() * 36;

      rainSpeeds[i] = 0.032 + Math.random() * 0.046;
      rainDrifts[i] = Math.random() * Math.PI * 2;
      rainAmps[i] = 0.008 + Math.random() * 0.014;

      const c = Math.random();
      if (c < 0.42) {
        rainColors[idx] = 1.0;
        rainColors[idx + 1] = 0.28;
        rainColors[idx + 2] = 0.65; // Vibrant magenta-rose
      } else if (c < 0.72) {
        rainColors[idx] = 1.0;
        rainColors[idx + 1] = 0.52;
        rainColors[idx + 2] = 0.82; // Soft glowing pink
      } else if (c < 0.9) {
        rainColors[idx] = 1.0;
        rainColors[idx + 1] = 0.88;
        rainColors[idx + 2] = 0.98; // Diamond star highlight
      } else {
        rainColors[idx] = 1.0;
        rainColors[idx + 1] = 0.75;
        rainColors[idx + 2] = 0.6; // Champagne gold
      }
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    rainGeo.setAttribute('color', new THREE.BufferAttribute(rainColors, 3));

    const rainMat = new THREE.PointsMaterial({
      size: isMobile ? 0.34 : 0.42,
      map: heartTexture,
      transparent: true,
      alphaTest: 0.02,
      vertexColors: true,
      depthWrite: false,
      opacity: 0.92,
    });
    const rainMesh = new THREE.Points(rainGeo, rainMat);
    universeGroup.add(rainMesh);

    // =========================================================================
    // 4. PRE-LOAD PHOTO TEXTURES
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();
    const textureCache = new Map<string, THREE.Texture>();

    photos.forEach((src) => {
      const tex = textureLoader.load(src);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      textureCache.set(src, tex);
    });

    // Helper: Canvas Texture for Wishes
    const createWishCanvasTexture = (text: string): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 860;
      canvas.height = 140;
      const ctx = canvas.getContext('2d')!;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const px = 16;
      const py = 16;
      const pw = canvas.width - 32;
      const ph = canvas.height - 32;
      const radius = 50;

      // Romantic dark glass pill with subtle rose gradient border
      const pillGrad = ctx.createLinearGradient(0, py, 0, py + ph);
      pillGrad.addColorStop(0, 'rgba(16, 4, 26, 0.88)');
      pillGrad.addColorStop(1, 'rgba(8, 2, 14, 0.92)');
      ctx.fillStyle = pillGrad;

      ctx.strokeStyle = 'rgba(255, 120, 185, 0.7)';
      ctx.lineWidth = 3.5;

      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, radius);
      ctx.fill();
      ctx.stroke();

      // Dynamic font size adjustment so text never overflows or overlaps pill bounds
      let fontSize = 38;
      ctx.font = `bold ${fontSize}px "Dancing Script", cursive, "Segoe UI", sans-serif`;
      let textWidth = ctx.measureText(text).width;
      const maxTextWidth = pw - 60;

      while (textWidth > maxTextWidth && fontSize > 24) {
        fontSize -= 2;
        ctx.font = `bold ${fontSize}px "Dancing Script", cursive, "Segoe UI", sans-serif`;
        textWidth = ctx.measureText(text).width;
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(255, 105, 180, 0.95)';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#ffb3d1';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 1);

      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      return tex;
    };

    // =========================================================================
    // 5. 3D PHOTO CARDS & 3D WISHES (18 Photos + 14 Wishes on Desktop)
    // Non-overlapping radial zones + synchronized descent + collision repulsion
    // =========================================================================
    interface Active3DCard {
      group: THREE.Group;
      frontPhotoMesh: THREE.Mesh;
      backPhotoMesh: THREE.Mesh;
      currentSrcIndex: number;
      roll: number;
    }

    interface Active3DWish {
      sprite: THREE.Sprite;
      currentWishIndex: number;
      driftAngle: number;
    }

    const activePhotoCards: Active3DCard[] = [];
    const activeWishes: Active3DWish[] = [];
    const clickableMeshes: THREE.Object3D[] = [];

    // Dense populations to satisfy "ảnh và lời chúc cũng tạo ra nhiều trên màn hình"
    const numPhotos = isMobile ? 12 : 18;
    const numWishes = isMobile ? 9 : 14;

    // Card dimensions
    const cardPhotoW = 2.2;
    const cardPhotoH = 2.85;
    const cardFrameW = cardPhotoW + 0.32;
    const cardFrameH = cardPhotoH + 0.52;

    const frameGeo = new THREE.PlaneGeometry(cardFrameW, cardFrameH);
    const frameMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });

    const photoGeo = new THREE.PlaneGeometry(cardPhotoW, cardPhotoH);

    const badgeGeo = new THREE.PlaneGeometry(0.32, 0.32);
    const badgeMat = new THREE.MeshBasicMaterial({
      map: heartTexture,
      transparent: true,
      depthWrite: false,
    });

    // Golden Angle constant for maximal angular dispersion
    const GOLDEN_ANGLE = 2.399963229728653; // pi * (3 - sqrt(5))

    // Initialize 3D Photo Cards
    // Cards placed in Inner-Mid Orbital Zone (R = 4.2 to 5.4)
    for (let i = 0; i < numPhotos; i++) {
      const srcIndex = i % photos.length;
      const src = photos[srcIndex];
      const tex = textureCache.get(src) || heartTexture;

      const cardGroup = new THREE.Group();

      // White frame background
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.set(0, -0.08, 0);
      cardGroup.add(frameMesh);

      // Front Photo Surface
      const frontMat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.FrontSide,
      });
      const frontPhotoMesh = new THREE.Mesh(photoGeo, frontMat);
      frontPhotoMesh.position.set(0, 0.08, 0.015);
      frontPhotoMesh.userData = { photoSrc: src };
      cardGroup.add(frontPhotoMesh);
      clickableMeshes.push(frontPhotoMesh);

      // Back Photo Surface (Double-sided so never shows a blank card!)
      const backMat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.FrontSide,
      });
      const backPhotoMesh = new THREE.Mesh(photoGeo, backMat);
      backPhotoMesh.position.set(0, 0.08, -0.015);
      backPhotoMesh.rotation.y = Math.PI;
      backPhotoMesh.userData = { photoSrc: src };
      cardGroup.add(backPhotoMesh);
      clickableMeshes.push(backPhotoMesh);

      // Heart badge indicator
      const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
      badgeMesh.position.set(cardFrameW / 2 - 0.28, -cardFrameH / 2 + 0.2, 0.02);
      cardGroup.add(badgeMesh);

      // Golden-angle dispersion + uniform vertical staggering
      const angle = i * GOLDEN_ANGLE;
      const radius = (isMobile ? 3.8 : 4.4) + (i % 3) * 0.45;
      const startY = 17 - (i / numPhotos) * 34;

      cardGroup.position.set(
        Math.cos(angle) * radius,
        startY,
        Math.sin(angle) * radius
      );

      const roll = ((i % 5) - 2) * 0.05; // Gentle tilt
      universeGroup.add(cardGroup);

      activePhotoCards.push({
        group: cardGroup,
        frontPhotoMesh,
        backPhotoMesh,
        currentSrcIndex: srcIndex,
        roll,
      });
    }

    // Initialize 3D Floating Wishes
    // Wishes placed in Outer Orbital Zone (R = 5.8 to 7.6)
    // Staggered half-step offset in angle and vertical height to eliminate initial collisions!
    for (let i = 0; i < numWishes; i++) {
      const wishIndex = i % wishes.length;
      const text = wishes[wishIndex];
      const wishTex = createWishCanvasTexture(text);

      const spriteMat = new THREE.SpriteMaterial({
        map: wishTex,
        transparent: true,
        opacity: 0.96,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(isMobile ? 3.8 : 4.5, isMobile ? 0.65 : 0.74, 1);

      // Interleaved Golden-Angle offset + Outer Radius
      const angle = (i + 0.5) * GOLDEN_ANGLE;
      const radius = (isMobile ? 4.9 : 6.0) + (i % 3) * 0.55;
      const startY = 16 - (i / numWishes) * 33 + 0.8;

      sprite.position.set(
        Math.cos(angle) * radius,
        startY,
        Math.sin(angle) * radius
      );
      universeGroup.add(sprite);

      activeWishes.push({
        sprite,
        currentWishIndex: wishIndex,
        driftAngle: i * 0.85,
      });
    }

    // =========================================================================
    // 6. 360-DEGREE ROTATION SYSTEM: ONLY OPERATES ON TOUCH / DRAG!
    // The universe stands still ("đứng yên") when idle!
    // =========================================================================
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let prevX = 0;
    let prevY = 0;
    let startTime = 0;
    let velocityX = 0;
    let velocityY = 0;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest('button, nav')) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      prevX = e.clientX;
      prevY = e.clientY;
      startTime = performance.now();
      velocityX = 0;
      velocityY = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;

        const sensitivity = 0.0055;
        // Continuous 360-degree rotation accumulation
        universeGroup.rotation.y += dx * sensitivity;
        universeGroup.rotation.x = Math.max(
          -Math.PI * 0.42,
          Math.min(Math.PI * 0.42, universeGroup.rotation.x + dy * sensitivity)
        );

        velocityX = dx * sensitivity;
        velocityY = dy * sensitivity;

        prevX = e.clientX;
        prevY = e.clientY;
      } else {
        // Hover pointer cursor detection
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickableMeshes, true);
        if (intersects.length > 0) {
          container.style.cursor = 'pointer';
        } else {
          container.style.cursor = 'grab';
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;

      const dragDist = Math.hypot(e.clientX - startX, e.clientY - startY);
      const dragDuration = performance.now() - startTime;

      // Quick click/tap without dragging (< 8px movement)
      if (dragDist < 8 && dragDuration < 400) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickableMeshes, true);

        if (intersects.length > 0) {
          const clickedMesh = intersects[0].object as THREE.Mesh;
          const photoSrc = clickedMesh.userData?.photoSrc;
          if (photoSrc && onPhotoClickRef.current) {
            onPhotoClickRef.current(photoSrc);
          }
        }
      }
    };

    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });

    // Responsive Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.position.z = w < 768 ? 18.5 : 14.0;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // =========================================================================
    // 7. ANIMATION LOOP: Lub-Dub Heartbeat + Rain + Collision-Free Physics
    // =========================================================================
    let animId: number;
    const clockStartTime = performance.now();
    let nextPhotoIndex = numPhotos % photos.length;
    let nextWishIndex = numWishes % wishes.length;

    const parentQuatInv = new THREE.Quaternion();

    // Uniform base descent speed so relative vertical spacing is strictly preserved!
    const BASE_DESCENT_SPEED = 0.024;

    // Helper: Find a free, uncrowded angular slot at top (Y > 12) for respawn
    const findUncrowdedTopSlot = (isCard: boolean) => {
      const topItems: THREE.Vector3[] = [];
      activePhotoCards.forEach((c) => {
        if (c.group.position.y > 10) topItems.push(c.group.position);
      });
      activeWishes.forEach((w) => {
        if (w.sprite.position.y > 10) topItems.push(w.sprite.position);
      });

      let bestAngle = Math.random() * Math.PI * 2;
      let maxMinDist = -1;

      // Sample 16 candidate angles around the orbital circle
      for (let s = 0; s < 16; s++) {
        const candidateAngle = (s / 16) * Math.PI * 2 + Math.random() * 0.15;
        const candR = isCard ? (isMobile ? 3.8 : 4.4) + Math.random() * 0.8 : (isMobile ? 4.9 : 6.0) + Math.random() * 1.2;
        const cx = Math.cos(candidateAngle) * candR;
        const cz = Math.sin(candidateAngle) * candR;

        let minDist = 999;
        for (const pos of topItems) {
          const d = Math.hypot(pos.x - cx, pos.z - cz);
          if (d < minDist) minDist = d;
        }

        if (minDist > maxMinDist) {
          maxMinDist = minDist;
          bestAngle = candidateAngle;
        }
      }

      const finalR = isCard ? (isMobile ? 3.8 : 4.4) + Math.random() * 0.8 : (isMobile ? 4.9 : 6.0) + Math.random() * 1.2;
      return {
        x: Math.cos(bestAngle) * finalR,
        y: 18.5 + Math.random() * 2.5,
        z: Math.sin(bestAngle) * finalR,
      };
    };

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = (performance.now() - clockStartTime) * 0.001;
      const paused = isPausedRef.current;
      const speedMult = speedMultiplierRef.current;

      // A. Dual-peak "Lub-Dub" Heartbeat pulse animation
      const beat1 = Math.pow(Math.max(0, Math.sin(time * 2.5)), 28) * 0.15;
      const beat2 = Math.pow(Math.max(0, Math.sin(time * 2.5 - 0.38)), 28) * 0.09;
      const scale = 1.0 + beat1 + beat2;
      heartGroup.scale.set(scale, scale, scale);

      // B. 360-Degree Unified Rotation Physics:
      // ONLY rotates when dragging or gently dampening after a drag!
      // NO ambient rotation when idle: Trái tim đứng yên!
      if (!isDragging) {
        if (Math.abs(velocityX) > 0.00005 || Math.abs(velocityY) > 0.00005) {
          universeGroup.rotation.y += velocityX;
          universeGroup.rotation.x = Math.max(
            -Math.PI * 0.42,
            Math.min(Math.PI * 0.42, universeGroup.rotation.x + velocityY)
          );

          velocityX *= 0.92;
          velocityY *= 0.92;
        } else {
          velocityX = 0;
          velocityY = 0;
        }
      }

      // Pre-compute inverted universe group quaternion for perfect billboarding
      parentQuatInv.copy(universeGroup.quaternion).invert();

      // C. Update Cascading Continuous Falling Hearts Rain
      if (!paused) {
        const rPosAttr = rainGeo.attributes.position as THREE.BufferAttribute;
        const rArr = rPosAttr.array as Float32Array;

        for (let i = 0; i < rainCount; i++) {
          const idx = i * 3;
          rArr[idx + 1] -= rainSpeeds[i] * speedMult;
          rArr[idx] += Math.sin(time * 1.6 + rainDrifts[i]) * rainAmps[i];

          // Recycle heart to top when dropping below screen
          if (rArr[idx + 1] < -24) {
            rArr[idx + 1] = 24 + Math.random() * 4;
            rArr[idx] = (Math.random() - 0.5) * 54;
            rArr[idx + 2] = -18 + Math.random() * 36;
          }
        }
        rPosAttr.needsUpdate = true;
      }

      // D. Update Cascading Downward Drift of Photo Cards & Wishes
      const descent = BASE_DESCENT_SPEED * speedMult;

      if (!paused) {
        // Step 1: Uniform vertical drift
        activePhotoCards.forEach((card) => {
          card.group.position.y -= descent;

          // Recycle when dropping below screen bottom
          if (card.group.position.y < -19) {
            const slot = findUncrowdedTopSlot(true);
            card.group.position.set(slot.x, slot.y, slot.z);

            // Cycle to next photo in GALLERY_PHOTOS
            const newSrc = photos[nextPhotoIndex];
            nextPhotoIndex = (nextPhotoIndex + 1) % photos.length;

            const newTex = textureCache.get(newSrc);
            if (newTex) {
              const fMat = card.frontPhotoMesh.material as THREE.MeshBasicMaterial;
              fMat.map = newTex;
              fMat.needsUpdate = true;

              const bMat = card.backPhotoMesh.material as THREE.MeshBasicMaterial;
              bMat.map = newTex;
              bMat.needsUpdate = true;

              card.frontPhotoMesh.userData.photoSrc = newSrc;
              card.backPhotoMesh.userData.photoSrc = newSrc;
            }
          }
        });

        activeWishes.forEach((wish) => {
          wish.sprite.position.y -= descent;
          wish.sprite.position.x += Math.sin(time * 1.4 + wish.driftAngle) * 0.003;

          // Recycle wish at bottom
          if (wish.sprite.position.y < -19) {
            const slot = findUncrowdedTopSlot(false);
            wish.sprite.position.set(slot.x, slot.y, slot.z);

            const newText = wishes[nextWishIndex];
            nextWishIndex = (nextWishIndex + 1) % wishes.length;
            const newTex = createWishCanvasTexture(newText);
            wish.sprite.material.map = newTex;
            wish.sprite.material.needsUpdate = true;
          }
        });

        // Step 2: Central Heart Protection (Radial clearance zone)
        // Keep 3D heart at center completely visible without obstruction
        activePhotoCards.forEach((c) => {
          const r = Math.hypot(c.group.position.x, c.group.position.z);
          const minR = isMobile ? 3.6 : 4.0;
          if (r < minR && r > 0.001) {
            const push = (minR - r) * 0.08;
            c.group.position.x += (c.group.position.x / r) * push;
            c.group.position.z += (c.group.position.z / r) * push;
          }
        });

        activeWishes.forEach((w) => {
          const r = Math.hypot(w.sprite.position.x, w.sprite.position.z);
          const minR = isMobile ? 4.5 : 5.2;
          if (r < minR && r > 0.001) {
            const push = (minR - r) * 0.08;
            w.sprite.position.x += (w.sprite.position.x / r) * push;
            w.sprite.position.z += (w.sprite.position.z / r) * push;
          }
        });

        // Step 3: Real-Time Pairwise Anti-Collision Repulsion
        // Guaranteed NON-OVERLAPPING between cards & cards, cards & wishes, wishes & wishes!
        const colliders: { pos: THREE.Vector3; halfW: number; halfH: number }[] = [];
        activePhotoCards.forEach((c) => {
          colliders.push({ pos: c.group.position, halfW: 1.4, halfH: 1.8 });
        });
        activeWishes.forEach((w) => {
          colliders.push({ pos: w.sprite.position, halfW: 2.3, halfH: 0.45 });
        });

        const nCol = colliders.length;
        for (let i = 0; i < nCol; i++) {
          const a = colliders[i];
          for (let j = i + 1; j < nCol; j++) {
            const b = colliders[j];

            const dy = a.pos.y - b.pos.y;
            const reqY = a.halfH + b.halfH + 0.35;
            const distY = Math.abs(dy);

            if (distY < reqY) {
              const dx = a.pos.x - b.pos.x;
              const dz = a.pos.z - b.pos.z;
              const distXZ = Math.hypot(dx, dz);
              const reqXZ = a.halfW + b.halfW + 0.45;

              if (distXZ < reqXZ) {
                // Overlap detected! Apply gentle elastic separation force
                const overlapXZ = reqXZ - distXZ;
                const overlapY = reqY - distY;
                const pushStrength = 0.04;

                // Push horizontally in XZ
                if (distXZ > 0.001) {
                  const nx = dx / distXZ;
                  const nz = dz / distXZ;
                  a.pos.x += nx * overlapXZ * pushStrength;
                  a.pos.z += nz * overlapXZ * pushStrength;
                  b.pos.x -= nx * overlapXZ * pushStrength;
                  b.pos.z -= nz * overlapXZ * pushStrength;
                } else {
                  a.pos.x += 0.08;
                  b.pos.x -= 0.08;
                }

                // Push vertically in Y
                const signY = dy >= 0 ? 1 : -1;
                a.pos.y += signY * overlapY * pushStrength * 0.5;
                b.pos.y -= signY * overlapY * pushStrength * 0.5;
              }
            }
          }
        }
      }

      // E. Billboarding for Photo Cards: Face camera directly in world space
      activePhotoCards.forEach((card) => {
        card.group.quaternion.copy(parentQuatInv).multiply(camera.quaternion);
        card.group.rotateZ(card.roll);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('resize', onResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      heartGeo.dispose();
      heartMat.dispose();
      galaxyGeo.dispose();
      galaxyMat.dispose();
      rainGeo.dispose();
      rainMat.dispose();
      heartTexture.dispose();
      frameGeo.dispose();
      frameMat.dispose();
      photoGeo.dispose();
      badgeGeo.dispose();
      badgeMat.dispose();
      renderer.dispose();
    };
  }, [photos, wishes]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-auto cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: 'none' }}
    />
  );
}
