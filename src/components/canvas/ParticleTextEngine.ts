import * as THREE from 'three';
import { createHeartSpriteTexture } from './HeartTextureHelper';

export class ParticleTextEngine {
  private particleCount: number = 5500;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  public points: THREE.Points;

  private currentPositions: Float32Array;
  private targetPositions: Float32Array;
  private velocities: Float32Array;
  private colors: Float32Array;

  private isMorphingToText: boolean = false;
  private isMorphingToCake: boolean = false;
  private textPointsCount: number = 0;

  constructor() {
    this.currentPositions = new Float32Array(this.particleCount * 3);
    this.targetPositions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);
    this.colors = new Float32Array(this.particleCount * 3);

    // Initial state: small cluster at origin
    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      this.currentPositions[idx] = (Math.random() - 0.5) * 0.2;
      this.currentPositions[idx + 1] = (Math.random() - 0.5) * 0.2;
      this.currentPositions[idx + 2] = (Math.random() - 0.5) * 0.2;

      this.targetPositions[idx] = this.currentPositions[idx];
      this.targetPositions[idx + 1] = this.currentPositions[idx + 1];
      this.targetPositions[idx + 2] = this.currentPositions[idx + 2];

      // Romantic vivid color palette
      const c = Math.random();
      if (c < 0.6) {
        this.colors[idx] = 1.0;
        this.colors[idx + 1] = 0.2;
        this.colors[idx + 2] = 0.5; // Pink-crimson
      } else if (c < 0.85) {
        this.colors[idx] = 1.0;
        this.colors[idx + 1] = 0.4;
        this.colors[idx + 2] = 0.65; // Rose pink
      } else {
        this.colors[idx] = 1.0;
        this.colors[idx + 1] = 0.75;
        this.colors[idx + 2] = 0.85; // Light warm pink
      }
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.currentPositions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    // Crisp 3D heart sprite texture
    const heartTexture = createHeartSpriteTexture();

    // NormalBlending ensures each heart keeps its sharp edges and doesn't blur into a white blob
    this.material = new THREE.PointsMaterial({
      size: 0.24,
      map: heartTexture,
      transparent: true,
      alphaTest: 0.08,
      depthWrite: false,
      vertexColors: true,
      opacity: 0.98,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.visible = false;
  }

  // Sample text onto a high-definition 2D canvas with optimal kerning and spacing
  public prepareTextTargets(line1: string = 'Chúc Mừng Sinh Nhật', line2: string = 'Em Khánh Huyền 💖') {
    if (typeof document === 'undefined') return;

    const width = 1600;
    const height = 700;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Line 1: "Chúc Mừng Sinh Nhật" - clear, bold serif with wide letter spacing
    ctx.font = 'bold 58px "Playfair Display", "Times New Roman", Georgia, serif';
    ctx.fillText(line1, width / 2, 220);

    // Line 2: "Em Khánh Huyền 💖" - prominent and beautifully separated
    ctx.font = 'bold 68px "Playfair Display", "Times New Roman", Georgia, serif';
    ctx.fillText(line2, width / 2, 380);

    const imgData = ctx.getImageData(0, 0, width, height).data;
    const textPoints: { x: number; y: number }[] = [];
    const step = 6; // Optimal sampling step for readable density without clumping

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        if (imgData[index] > 128) {
          // Map to 3D world coordinates
          textPoints.push({
            x: (x - width / 2) * 0.021,
            y: -(y - height / 2) * 0.021 + 0.3,
          });
        }
      }
    }

    this.textPointsCount = textPoints.length;

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      if (i < textPoints.length) {
        // Strictly place particles on the letter strokes
        const pt = textPoints[i];
        this.targetPositions[idx] = pt.x;
        this.targetPositions[idx + 1] = pt.y;
        this.targetPositions[idx + 2] = (Math.random() - 0.5) * 0.2;
      } else {
        // Any remaining extra particles are placed far away in background, NEVER near text
        this.targetPositions[idx] = (Math.random() - 0.5) * 32;
        this.targetPositions[idx + 1] = (Math.random() - 0.5) * 20;
        this.targetPositions[idx + 2] = -12 - Math.random() * 8; // Deep background
      }
    }
  }

  // Phase 1: Explode out from small 3D heart and converge into text
  public explodeAndMorphToText() {
    this.points.visible = true;
    this.isMorphingToText = true;
    this.isMorphingToCake = false;

    // Radial burst impulse from center heart
    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const speed = 4 + Math.random() * 8;

      this.currentPositions[idx] = 0;
      this.currentPositions[idx + 1] = 0;
      this.currentPositions[idx + 2] = 0;

      this.velocities[idx] = Math.cos(angle) * Math.cos(phi) * speed;
      this.velocities[idx + 1] = Math.sin(phi) * speed;
      this.velocities[idx + 2] = Math.sin(angle) * Math.cos(phi) * speed;
    }
  }

  // Phase 2: Dissolve from text and swirl-morph into Birthday Cake 3D shape
  public morphToCake() {
    this.isMorphingToText = false;
    this.isMorphingToCake = true;

    // Dispersal swirl impulse
    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      this.velocities[idx] = (Math.random() - 0.5) * 8;
      this.velocities[idx + 1] = (Math.random() - 0.5) * 8;
      this.velocities[idx + 2] = (Math.random() - 0.5) * 8;

      // Assign targets around the 3D Cake tiers
      const choice = Math.random();
      let y = 0, radius = 3.0;

      if (choice < 0.2) {
        y = 0;
        radius = 1.0 + Math.random() * 2.8; // Plate
      } else if (choice < 0.5) {
        y = 0.7 + (Math.random() - 0.5) * 0.8;
        radius = 3.2; // Tier 1
      } else if (choice < 0.78) {
        y = 1.8 + (Math.random() - 0.5) * 0.7;
        radius = 2.3; // Tier 2
      } else if (choice < 0.93) {
        y = 2.7 + (Math.random() - 0.5) * 0.6;
        radius = 1.4; // Tier 3
      } else {
        y = 3.4 + Math.random() * 0.6;
        radius = 0.85; // Candles
      }

      const theta = Math.random() * Math.PI * 2;
      this.targetPositions[idx] = Math.cos(theta) * radius;
      this.targetPositions[idx + 1] = y - 1.2;
      this.targetPositions[idx + 2] = Math.sin(theta) * radius;
    }
  }

  public update(time: number) {
    if (!this.points.visible) return;

    const posAttr = this.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;

      // Apply and decay velocity
      array[idx] += this.velocities[idx] * 0.05;
      array[idx + 1] += this.velocities[idx + 1] * 0.05;
      array[idx + 2] += this.velocities[idx + 2] * 0.05;

      this.velocities[idx] *= 0.86;
      this.velocities[idx + 1] *= 0.86;
      this.velocities[idx + 2] *= 0.86;

      const tarX = this.targetPositions[idx];
      const tarY = this.targetPositions[idx + 1];
      const tarZ = this.targetPositions[idx + 2];

      const dx = tarX - array[idx];
      const dy = tarY - array[idx + 1];
      const dz = tarZ - array[idx + 2];

      const speed = this.isMorphingToCake ? 0.055 : 0.045;
      array[idx] += dx * speed;
      array[idx + 1] += dy * speed;
      array[idx + 2] += dz * speed;

      // Subtle float wave when displaying text
      if (this.isMorphingToText && i < this.textPointsCount) {
        array[idx + 1] += Math.sin(time * 1.8 + array[idx] * 0.5) * 0.003;
      }
    }

    posAttr.needsUpdate = true;

    if (this.isMorphingToCake) {
      this.points.rotation.y += 0.008;
    } else {
      this.points.rotation.y = Math.sin(time * 0.4) * 0.03;
    }
  }

  public fadeOut() {
    // Disperse particles softly outward
    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const dist = 14 + Math.random() * 15;
      this.targetPositions[idx] = Math.cos(angle) * dist;
      this.targetPositions[idx + 1] = (Math.random() - 0.5) * 12;
      this.targetPositions[idx + 2] = Math.sin(angle) * dist;
    }
  }

  public setVisible(visible: boolean) {
    this.points.visible = visible;
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
