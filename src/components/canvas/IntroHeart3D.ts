import * as THREE from 'three';
import gsap from 'gsap';

export class IntroHeart3D {
  public mesh: THREE.Mesh;
  public group: THREE.Group;
  private material: THREE.MeshPhysicalMaterial;
  private light: THREE.PointLight;

  constructor() {
    this.group = new THREE.Group();

    // 3D Extruded heart shape
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 1.0);
    shape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    shape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    const extrudeSettings = {
      depth: 0.28,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    geometry.scale(1.2, 1.2, 1.2);
    geometry.rotateZ(Math.PI); // Orient heart right-side up

    // Luxury ruby/pink crystal material
    this.material = new THREE.MeshPhysicalMaterial({
      color: 0xff1e62,
      emissive: 0xff0044,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.25,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.2,
      transparent: true,
      opacity: 0.95,
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.group.add(this.mesh);

    // Glowing internal heart light
    this.light = new THREE.PointLight(0xff3377, 2.5, 6);
    this.group.add(this.light);
  }

  public update(time: number) {
    if (!this.group.visible) return;

    // Heartbeat pulse rhythm: lub-DUB ... lub-DUB ...
    const t = time * 3.2;
    const beat = Math.pow(Math.sin(t), 12) * 0.16 + Math.pow(Math.sin(t + 0.28), 16) * 0.1;
    const baseScale = 1.0 + beat;
    this.mesh.scale.set(baseScale, baseScale, baseScale);

    // Gentle floating rotation
    this.mesh.rotation.y = Math.sin(time * 0.8) * 0.25;
    this.mesh.rotation.x = Math.cos(time * 0.6) * 0.1;
    this.group.position.y = Math.sin(time * 1.5) * 0.15;

    this.light.intensity = 2.0 + beat * 4.0;
  }

  public explode(onComplete?: () => void) {
    gsap.timeline({ onComplete })
      .to(this.mesh.scale, {
        x: 1.8,
        y: 1.8,
        z: 1.8,
        duration: 0.3,
        ease: 'power2.out',
      })
      .to(this.mesh.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.2,
        ease: 'power3.in',
      }, '>-0.05')
      .to(this.material, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          this.group.visible = false;
        },
      }, '<');
  }

  public reset() {
    this.group.visible = true;
    this.mesh.scale.set(1, 1, 1);
    this.material.opacity = 0.95;
    this.group.position.set(0, 0, 0);
  }
}
