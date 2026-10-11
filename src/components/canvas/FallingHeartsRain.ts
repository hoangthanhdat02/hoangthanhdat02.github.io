import * as THREE from 'three';
import { createHeartSpriteTexture } from './HeartTextureHelper';

export class FallingHeartsRain {
  private count: number = 350;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  public points: THREE.Points;

  private positions: Float32Array;
  private speeds: Float32Array;
  private drifts: Float32Array;
  private colors: Float32Array;

  constructor() {
    this.positions = new Float32Array(this.count * 3);
    this.speeds = new Float32Array(this.count);
    this.drifts = new Float32Array(this.count);
    this.colors = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      this.positions[idx] = (Math.random() - 0.5) * 28;     // X spread
      this.positions[idx + 1] = -12 + Math.random() * 26;   // Y spread
      this.positions[idx + 2] = -8 + Math.random() * 12;    // Z depth (behind and around text)

      this.speeds[i] = 0.02 + Math.random() * 0.035;
      this.drifts[i] = Math.random() * Math.PI * 2;

      // Color variation: pink, warm rose, coral, soft white
      const c = Math.random();
      if (c < 0.6) {
        this.colors[idx] = 1.0;
        this.colors[idx + 1] = 0.35 + Math.random() * 0.3;
        this.colors[idx + 2] = 0.6 + Math.random() * 0.3;
      } else if (c < 0.85) {
        this.colors[idx] = 1.0;
        this.colors[idx + 1] = 0.8;
        this.colors[idx + 2] = 0.9;
      } else {
        this.colors[idx] = 0.95;
        this.colors[idx + 1] = 0.2;
        this.colors[idx + 2] = 0.5;
      }
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    const heartTexture = createHeartSpriteTexture();

    this.material = new THREE.PointsMaterial({
      size: 0.35,
      map: heartTexture,
      transparent: true,
      alphaTest: 0.05,
      vertexColors: true,
      depthWrite: false,
      opacity: 0.85,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.visible = false;
  }

  public update(time: number) {
    if (!this.points.visible) return;

    const posAttr = this.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;

      // Fall down
      array[idx + 1] -= this.speeds[i];

      // Subtle horizontal sway
      array[idx] += Math.sin(time * 1.5 + this.drifts[i]) * 0.008;

      // Reset to top when reaching bottom
      if (array[idx + 1] < -12) {
        array[idx + 1] = 14 + Math.random() * 4;
        array[idx] = (Math.random() - 0.5) * 28;
      }
    }

    posAttr.needsUpdate = true;
  }

  public setVisible(visible: boolean) {
    this.points.visible = visible;
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
