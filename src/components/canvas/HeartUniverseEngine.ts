import * as THREE from 'three';
import gsap from 'gsap';
import { createHeartSpriteTexture } from './HeartTextureHelper';

export class HeartUniverseEngine {
  public group: THREE.Group;

  private totalCount: number = 38000;
  private textParticleCount: number = 10000;

  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  public points: THREE.Points;

  private positions: Float32Array;
  private targetPositions: Float32Array;
  private startPositions: Float32Array;
  private colors: Float32Array;

  // Staggered delay and swirl trajectory offsets for each particle
  private delays: Float32Array;
  private swirlAxes: Float32Array;
  private swirlStrengths: Float32Array;

  // Falling stream parameters for the remaining 28,000 background hearts
  private fallSpeeds: Float32Array;
  private fallDrifts: Float32Array;

  // Fluid transition state controlled by GSAP
  private morphProgress = { value: 0 };
  private isMorphing: boolean = false;
  private isTextAssembled: boolean = false;
  private actualTextPointsCount: number = 0;

  constructor() {
    this.group = new THREE.Group();

    this.positions = new Float32Array(this.totalCount * 3);
    this.targetPositions = new Float32Array(this.totalCount * 3);
    this.startPositions = new Float32Array(this.totalCount * 3);
    this.colors = new Float32Array(this.totalCount * 3);

    this.delays = new Float32Array(this.textParticleCount);
    this.swirlAxes = new Float32Array(this.textParticleCount * 3);
    this.swirlStrengths = new Float32Array(this.textParticleCount);

    this.fallSpeeds = new Float32Array(this.totalCount);
    this.fallDrifts = new Float32Array(this.totalCount);

    const heartTexture = createHeartSpriteTexture();

    // 1. Initial 3D Spherical Cosmos distribution for all particles
    for (let i = 0; i < this.totalCount; i++) {
      const idx = i * 3;

      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      const isCore = i < this.textParticleCount;
      const r = isCore
        ? 0.4 + Math.pow(Math.random(), 0.75) * 6.5
        : 2.5 + Math.pow(Math.random(), 0.6) * 25.0;

      const sinPhi = Math.sin(phi);
      const px = r * sinPhi * Math.cos(theta);
      const py = r * Math.cos(phi);
      const pz = r * sinPhi * Math.sin(theta);

      this.positions[idx] = px;
      this.positions[idx + 1] = py;
      this.positions[idx + 2] = pz;

      this.startPositions[idx] = px;
      this.startPositions[idx + 1] = py;
      this.startPositions[idx + 2] = pz;

      this.targetPositions[idx] = px;
      this.targetPositions[idx + 1] = py;
      this.targetPositions[idx + 2] = pz;

      // Background falling rain parameters
      this.fallSpeeds[i] = 0.016 + Math.random() * 0.034;
      this.fallDrifts[i] = Math.random() * Math.PI * 2;

      // Color palette
      if (isCore) {
        // Text particles: brilliant radiant magenta & glowing rose
        const c = Math.random();
        if (c < 0.5) {
          this.colors[idx] = 1.0;
          this.colors[idx + 1] = 0.18;
          this.colors[idx + 2] = 0.55; // Vibrant magenta ruby
        } else if (c < 0.85) {
          this.colors[idx] = 1.0;
          this.colors[idx + 1] = 0.4;
          this.colors[idx + 2] = 0.72; // Radiant rose
        } else {
          this.colors[idx] = 1.0;
          this.colors[idx + 1] = 0.85;
          this.colors[idx + 2] = 0.95; // Bright diamond highlight
        }

        // Swirl curve attributes
        this.delays[i] = Math.random() * 0.25;
        this.swirlAxes[idx] = (Math.random() - 0.5) * 2;
        this.swirlAxes[idx + 1] = (Math.random() - 0.5) * 2;
        this.swirlAxes[idx + 2] = (Math.random() - 0.5) * 2;
        this.swirlStrengths[i] = 1.8 + Math.random() * 3.5;
      } else {
        // Falling hearts: diamond starlight, soft rose, and glowing magenta ruby
        const c = Math.random();
        if (c < 0.4) {
          this.colors[idx] = 1.0;
          this.colors[idx + 1] = 0.88;
          this.colors[idx + 2] = 0.95; // Diamond starlight
        } else if (c < 0.75) {
          this.colors[idx] = 1.0;
          this.colors[idx + 1] = 0.42;
          this.colors[idx + 2] = 0.72; // Radiant soft rose
        } else {
          this.colors[idx] = 1.0;
          this.colors[idx + 1] = 0.22;
          this.colors[idx + 2] = 0.58; // Glowing magenta ruby
        }
      }
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    this.material = new THREE.PointsMaterial({
      size: 0.20,
      map: heartTexture,
      transparent: true,
      alphaTest: 0.04,
      vertexColors: true,
      depthWrite: false,
      opacity: 0.98,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.group.add(this.points);

    // Pre-calculate razor-sharp text targets with parametric heart
    this.prepareTextTargets();
  }

  // Pre-sample text onto high-res canvas with SMOOTH, NON-GRID vector sampling + PARAMETRIC HEART
  public prepareTextTargets(isMobile: boolean = false) {
    if (typeof document === 'undefined') return;

    const textPoints: { x: number; y: number }[] = [];
    const heartPoints: { x: number; y: number }[] = [];

    if (isMobile) {
      // MOBILE PORTRAIT LAYOUT: 3 beautifully centered lines for high legibility on narrow screens
      const width = 1200;
      const height = 1100;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#ffffff';
      ctx.textBaseline = 'middle';

      // Line 1: "Chúc Mừng"
      ctx.font = 'bold 84px "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
      ctx.lineWidth = 3.0;
      ctx.textAlign = 'center';
      ctx.strokeText('Chúc Mừng', width / 2, 280);
      ctx.fillText('Chúc Mừng', width / 2, 280);

      // Line 2: "Sinh Nhật"
      ctx.strokeText('Sinh Nhật', width / 2, 470);
      ctx.fillText('Sinh Nhật', width / 2, 470);

      // Line 3: "Em Khánh Huyền" + Parametric Heart
      const line3Text = 'Em Khánh Huyền';
      ctx.font = 'bold 84px "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
      const textWidth = ctx.measureText(line3Text).width;
      const heartWidthPx = 110;
      const totalLine3Width = textWidth + heartWidthPx + 32;

      const line3StartX = width / 2 - totalLine3Width / 2;
      ctx.textAlign = 'left';
      ctx.strokeText(line3Text, line3StartX, 680);
      ctx.fillText(line3Text, line3StartX, 680);

      // Sample pixels with gentle sub-pixel dither
      const imgData = ctx.getImageData(0, 0, width, height).data;
      const step = 3;
      const coordScale = 0.0076;

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          if (imgData[index] > 110) {
            const jitterX = (Math.random() - 0.5) * 1.2;
            const jitterY = (Math.random() - 0.5) * 1.2;
            textPoints.push({
              x: ((x + jitterX) - width / 2) * coordScale,
              y: -((y + jitterY) - height / 2) * coordScale + 0.15,
            });
          }
        }
      }

      // Mathematical Parametric Heart for Line 3
      const heartCenterX = (line3StartX + textWidth + 32 + heartWidthPx / 2 - width / 2) * coordScale;
      const heartCenterY = -(680 - height / 2) * coordScale + 0.15 + 0.08;
      const heartScale = 0.038;

      const contourCount = 360;
      for (let i = 0; i < contourCount; i++) {
        const t = (i / contourCount) * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3) * heartScale;
        const hy = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * heartScale;
        heartPoints.push({
          x: heartCenterX + hx,
          y: heartCenterY + hy,
        });
      }

      const interiorCount = 1200;
      for (let i = 0; i < interiorCount; i++) {
        const s = Math.sqrt(Math.random());
        const t = Math.random() * Math.PI * 2;
        const hx = s * 16 * Math.pow(Math.sin(t), 3) * heartScale;
        const hy = s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * heartScale;
        heartPoints.push({
          x: heartCenterX + hx,
          y: heartCenterY + hy,
        });
      }
    } else {
      // DESKTOP WIDESCREEN LAYOUT: 2 wide horizontal lines
      const width = 1900;
      const height = 750;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#ffffff';
      ctx.textBaseline = 'middle';

      ctx.font = 'bold 70px "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
      ctx.lineWidth = 2.5;

      const line1 = 'Chúc Mừng Sinh Nhật';
      ctx.textAlign = 'center';
      ctx.strokeText(line1, width / 2, 230);
      ctx.fillText(line1, width / 2, 230);

      const line2Text = 'Em Khánh Huyền';
      ctx.font = 'bold 78px "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
      ctx.lineWidth = 3.0;

      const textWidth = ctx.measureText(line2Text).width;
      const heartWidthPx = 110;
      const totalLine2Width = textWidth + heartWidthPx + 35;

      const line2StartX = width / 2 - totalLine2Width / 2;
      ctx.textAlign = 'left';
      ctx.strokeText(line2Text, line2StartX, 430);
      ctx.fillText(line2Text, line2StartX, 430);

      const imgData = ctx.getImageData(0, 0, width, height).data;
      const step = 3;

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          if (imgData[index] > 110) {
            const jitterX = (Math.random() - 0.5) * 1.2;
            const jitterY = (Math.random() - 0.5) * 1.2;
            textPoints.push({
              x: ((x + jitterX) - width / 2) * 0.020,
              y: -((y + jitterY) - height / 2) * 0.020 + 0.35,
            });
          }
        }
      }

      const heartCenterX = (line2StartX + textWidth + 35 + heartWidthPx / 2 - width / 2) * 0.020;
      const heartCenterY = -(430 - height / 2) * 0.020 + 0.35 + 0.12;
      const heartScale = 0.078;

      const contourCount = 360;
      for (let i = 0; i < contourCount; i++) {
        const t = (i / contourCount) * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3) * heartScale;
        const hy = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * heartScale;
        heartPoints.push({
          x: heartCenterX + hx,
          y: heartCenterY + hy,
        });
      }

      const interiorCount = 1200;
      for (let i = 0; i < interiorCount; i++) {
        const s = Math.sqrt(Math.random());
        const t = Math.random() * Math.PI * 2;
        const hx = s * 16 * Math.pow(Math.sin(t), 3) * heartScale;
        const hy = s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * heartScale;
        heartPoints.push({
          x: heartCenterX + hx,
          y: heartCenterY + hy,
        });
      }
    }

    // Combine text points and mathematical heart points
    const combinedPoints = [...textPoints, ...heartPoints];
    this.actualTextPointsCount = combinedPoints.length;

    // Map each particle to a unique point with ZERO jitter
    for (let i = 0; i < this.textParticleCount; i++) {
      const idx = i * 3;
      if (i < combinedPoints.length) {
        const pt = combinedPoints[i];
        this.targetPositions[idx] = pt.x;
        this.targetPositions[idx + 1] = pt.y;
        this.targetPositions[idx + 2] = 0;
      } else {
        const pt = combinedPoints[i % combinedPoints.length];
        this.targetPositions[idx] = pt.x;
        this.targetPositions[idx + 1] = pt.y;
        this.targetPositions[idx + 2] = 0;
      }
    }

    // Initialize 28,000 background falling hearts covering FRONT (in front of cake), SURROUNDING, and BACKGROUND
    for (let i = this.textParticleCount; i < this.totalCount; i++) {
      const idx = i * 3;
      const zone = (i - this.textParticleCount) % 3;

      if (zone === 0) {
        // ZONE 0: MẶT TRƯỚC (Rơi phủ kín mặt trước bánh, nằm giữa bánh và camera)
        this.positions[idx] = (Math.random() - 0.5) * 26; // X in [-13, 13]
        this.positions[idx + 1] = -18 + Math.random() * 38; // Y in [-18, 20]
        this.positions[idx + 2] = 1.0 + Math.random() * 7.2; // Z in [1.0, 8.2]
      } else if (zone === 1) {
        // ZONE 1: XUNG QUANH BÁNH (Hình trụ bao quanh bánh 360 độ)
        const angle = Math.random() * Math.PI * 2;
        const radius = 3.5 + Math.random() * 10.0;
        this.positions[idx] = Math.cos(angle) * radius;
        this.positions[idx + 1] = -18 + Math.random() * 38;
        this.positions[idx + 2] = Math.sin(angle) * radius;
      } else {
        // ZONE 2: HẬU CẢNH SÂU (Bao phủ không gian rộng lớn phía sau)
        this.positions[idx] = (Math.random() - 0.5) * 44; // X in [-22, 22]
        this.positions[idx + 1] = -18 + Math.random() * 38;
        this.positions[idx + 2] = -1.0 - Math.random() * 18.0; // Z in [-19, -1]
      }
    }
  }

  // TRIGGER: CHUYỂN CẢNH MƯỢT MÀ VÀ HẠ CÁNH CHÍNH XÁC 100% VÀO NÉT CHỮ
  public explodeAndMorphToText(onComplete?: () => void) {
    this.isMorphing = true;
    this.isTextAssembled = false;

    // Capture exact current starting position
    const posAttr = this.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;
    for (let i = 0; i < this.textParticleCount * 3; i++) {
      this.startPositions[i] = array[i];
    }

    this.morphProgress.value = 0;

    // GSAP smoothly transitions progress from 0 to 1 over 2.4s
    gsap.to(this.morphProgress, {
      value: 1,
      duration: 2.4,
      ease: 'power2.inOut',
      onComplete: () => {
        this.isTextAssembled = true;
        if (onComplete) onComplete();
      },
    });
  }

  // TRIGGER: PHÂN TÁN CHỮ VÀO KHÔNG GIAN KHI BƯỚC VÀO TẦNG BÁNH SINH NHẬT
  private isDispersing: boolean = false;
  private disperseProgress = { value: 0 };

  public disperseForCake(onComplete?: () => void) {
    this.isDispersing = true;
    this.disperseProgress.value = 0;

    gsap.to(this.disperseProgress, {
      value: 1,
      duration: 1.5,
      ease: 'power2.out',
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
  }

  public update(time: number) {
    const posAttr = this.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    if (!this.isMorphing) {
      // 1. Initial 3D universe gentle ambient rotation
      this.points.rotation.y = time * 0.025;
      this.points.rotation.x = Math.sin(time * 0.015) * 0.03;
    } else {
      // 2. Chuyển cảnh mượt mà và đảm bảo kết thúc chuẩn xác 100% không bị lệch
      const p = this.morphProgress.value;

      for (let i = 0; i < this.textParticleCount; i++) {
        const idx = i * 3;

        const tarX = this.targetPositions[idx];
        const tarY = this.targetPositions[idx + 1];
        const tarZ = this.targetPositions[idx + 2];

        if (this.isDispersing) {
          // PHÂN TÁN CHỮ NHẸ NHÀNG RA KHÔNG GIAN SÂU ĐỂ BÁNH SINH NHẬT TOẢ SÁNG
          const dp = this.disperseProgress.value;
          array[idx] = tarX + tarX * dp * 2.2 + Math.sin(time * 1.5 + i * 0.1) * dp * 1.2;
          array[idx + 1] = tarY + tarY * dp * 2.2 + Math.cos(time * 1.5 + i * 0.1) * dp * 1.2;
          array[idx + 2] = tarZ - dp * 16;
        } else if (p >= 1.0) {
          // KHI HOÀN THÀNH (p == 1): HẠ CÁNH CHÍNH XÁC 100% VÀO NÉT CHỮ, KHÔNG CÓ BẤT KỲ ĐỘ LỆCH NÀO!
          array[idx] = tarX;
          // Gợn sóng lơ lửng rất nhẹ nhàng sau khi đã hạ cánh
          array[idx + 1] = tarY + Math.sin(time * 2.0 + tarX * 0.6) * 0.003;
          array[idx + 2] = tarZ;
        } else {
          // TRONG KHI CHUYỂN CẢNH (p < 1): UỐN LƯỢN ĐƯỜNG CONG TỰ NHIÊN
          const delay = this.delays[i];
          let t = 0;
          if (p > delay) {
            t = (p - delay) / (1.0 - delay);
          }
          t = Math.max(0, Math.min(1, t));

          // Smooth cubic ease:
          const easeT = t * t * (3 - 2 * t);

          const startX = this.startPositions[idx];
          const startY = this.startPositions[idx + 1];
          const startZ = this.startPositions[idx + 2];

          // Đường cong xoắn ốc (Swirl Arc): đảm bảo = 0 tại t=0 và = 0 tại t=1!
          const arc = Math.sin(t * Math.PI) * (1 - easeT) * this.swirlStrengths[i];

          array[idx] = startX + (tarX - startX) * easeT + this.swirlAxes[idx] * arc * 0.25;
          array[idx + 1] = startY + (tarY - startY) * easeT + this.swirlAxes[idx + 1] * arc * 0.25;
          array[idx + 2] = startZ + (tarZ - startZ) * easeT + this.swirlAxes[idx + 2] * arc * 0.25;
        }
      }

      // Giữ góc nhìn chữ thẳng thắn về phía camera mượt mà
      this.points.rotation.y = THREE.MathUtils.lerp(this.points.rotation.y, 0, 0.06);
      this.points.rotation.x = THREE.MathUtils.lerp(this.points.rotation.x, 0, 0.06);
    }

    // 3. MƯA 28.000 TRÁI TIM LIÊN TỤC RƠI TRÀN MÀN HÌNH 360 ĐỘ TỰ NHIÊN (CẢ TRƯỚC, XUNG QUANH VÀ SAU)
    for (let i = this.textParticleCount; i < this.totalCount; i++) {
      const idx = i * 3;

      // Rơi thẳng từ trên xuống
      array[idx + 1] -= this.fallSpeeds[i];

      // Đung đưa nhẹ nhàng tự nhiên
      array[idx] += Math.sin(time * 1.5 + this.fallDrifts[i]) * 0.008;

      // Tái sinh tự nhiên trên đỉnh màn hình khi rơi tới đáy (phủ kín cả mặt trước, xung quanh và mặt sau)
      if (array[idx + 1] < -18) {
        array[idx + 1] = 18 + Math.random() * 4;
        const zone = (i - this.textParticleCount) % 3;

        if (zone === 0) {
          // MẶT TRƯỚC (Giữa bánh và camera)
          array[idx] = (Math.random() - 0.5) * 26;
          array[idx + 2] = 1.0 + Math.random() * 7.2;
        } else if (zone === 1) {
          // XUNG QUANH BÁNH (360 độ)
          const angle = Math.random() * Math.PI * 2;
          const radius = 3.5 + Math.random() * 10.0;
          array[idx] = Math.cos(angle) * radius;
          array[idx + 2] = Math.sin(angle) * radius;
        } else {
          // HẬU CẢNH SÂU
          array[idx] = (Math.random() - 0.5) * 44;
          array[idx + 2] = -1.0 - Math.random() * 18.0;
        }
      }
    }

    posAttr.needsUpdate = true;
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
