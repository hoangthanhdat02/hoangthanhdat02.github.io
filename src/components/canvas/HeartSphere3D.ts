import * as THREE from 'three';
import gsap from 'gsap';

export class HeartSphere3D {
  public group: THREE.Group;
  private heartCount: number = 72;
  private radius: number = 4.2;
  private hearts: {
    mesh: THREE.Mesh;
    basePos: THREE.Vector3;
    currentPos: THREE.Vector3;
    baseRot: THREE.Euler;
    velocity: THREE.Vector3;
    floatSpeed: number;
    floatOffset: number;
  }[] = [];

  private isBurst: boolean = false;
  private heartMaterial: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();

    // Glossy metallic/glassy pink heart material
    this.heartMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3b77,
      roughness: 0.18,
      metalness: 0.35,
    });

    this.buildHeartSphere();
  }

  // Create an extruded 3D heart shape
  private createHeartGeometry(): THREE.BufferGeometry {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    // Standard parametric heart curve
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 1.0);
    shape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    shape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    const extrudeSettings = {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    geo.scale(0.5, 0.5, 0.5);
    // Invert upside down heart shape
    geo.rotateZ(Math.PI);
    return geo;
  }

  private buildHeartSphere() {
    const heartGeo = this.createHeartGeometry();
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Fibonacci golden angle

    for (let i = 0; i < this.heartCount; i++) {
      const y = 1 - (i / (this.heartCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;

      const x = Math.cos(theta) * radiusAtY * this.radius;
      const z = Math.sin(theta) * radiusAtY * this.radius;
      const basePos = new THREE.Vector3(x, y * this.radius, z);

      const mesh = new THREE.Mesh(heartGeo, this.heartMaterial.clone());
      // Slight scale and hue variance
      const scale = 0.75 + Math.random() * 0.45;
      mesh.scale.set(scale, scale, scale);
      mesh.position.copy(basePos);

      // Orient heart facing outwards from the center of sphere
      mesh.lookAt(x * 2, y * this.radius * 2, z * 2);

      this.group.add(mesh);

      this.hearts.push({
        mesh,
        basePos: basePos.clone(),
        currentPos: basePos.clone(),
        baseRot: mesh.rotation.clone(),
        velocity: new THREE.Vector3(0, 0, 0),
        floatSpeed: 0.8 + Math.random() * 0.8,
        floatOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  // Trigger heart burst / floating storm
  public toggleBurst() {
    this.isBurst = !this.isBurst;

    if (this.isBurst) {
      // Explode outward and float up
      this.hearts.forEach((h) => {
        const dir = h.basePos.clone().normalize();
        const burstDist = this.radius * (1.6 + Math.random() * 1.5);
        gsap.to(h.mesh.position, {
          x: dir.x * burstDist + (Math.random() - 0.5) * 2,
          y: dir.y * burstDist + 2 + Math.random() * 4,
          z: dir.z * burstDist + (Math.random() - 0.5) * 2,
          duration: 1.2,
          ease: 'power2.out',
        });

        gsap.to(h.mesh.rotation, {
          x: Math.random() * Math.PI * 2,
          y: Math.random() * Math.PI * 2,
          z: Math.random() * Math.PI * 2,
          duration: 1.5,
          ease: 'power2.out',
        });
      });
    } else {
      // Reassemble smoothly back to sphere
      this.hearts.forEach((h) => {
        gsap.to(h.mesh.position, {
          x: h.basePos.x,
          y: h.basePos.y,
          z: h.basePos.z,
          duration: 1.4,
          ease: 'elastic.out(1, 0.5)',
        });

        gsap.to(h.mesh.rotation, {
          x: h.baseRot.x,
          y: h.baseRot.y,
          z: h.baseRot.z,
          duration: 1.2,
          ease: 'power2.out',
        });
      });
    }
  }

  public update(time: number) {
    if (!this.isBurst) {
      // Gentle breathing pulsation and subtle float
      this.hearts.forEach((h) => {
        const pulse = 1 + Math.sin(time * 2.5 + h.floatOffset) * 0.05;
        h.mesh.scale.set(pulse, pulse, pulse);
      });
    } else {
      // Float upward in storm mode
      this.hearts.forEach((h) => {
        h.mesh.position.y += 0.015 * h.floatSpeed;
        if (h.mesh.position.y > 9) {
          h.mesh.position.y = -7;
        }
        h.mesh.rotation.y += 0.01;
      });
    }
  }

  public setVisible(visible: boolean) {
    this.group.visible = visible;
  }
}
