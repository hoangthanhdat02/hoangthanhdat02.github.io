import * as THREE from 'three';
import gsap from 'gsap';
import { romanticAudio } from '@/lib/audio';
import { createHeartSpriteTexture } from './HeartTextureHelper';

export class BirthdayCake3D {
  public group: THREE.Group;

  // Cake structural components
  private plateGroup: THREE.Group;
  private tier1Group: THREE.Group;
  private tier2Group: THREE.Group;
  private tier3Group: THREE.Group;
  private candlesGroup: THREE.Group;
  private number16Group: THREE.Group;

  // Inscription banners (Front & Back for full 360° completeness)
  private bannerFrontMesh!: THREE.Mesh;
  private bannerBackMesh!: THREE.Mesh;

  // Candle lights & flames
  private flames: THREE.Mesh[] = [];
  private lights: THREE.PointLight[] = [];
  private isCandlesLit: boolean = false;

  // 3D Magic Pen & Sparkle Trail
  private penGroup: THREE.Group;
  private penTipLight!: THREE.PointLight;
  private penTrailPoints!: THREE.Points;
  private penTrailMaterial!: THREE.PointsMaterial;
  private penTrailPositions!: Float32Array;
  private trailIndex: number = 0;
  private maxTrailPoints: number = 240;

  // State
  private isDrawing: boolean = false;
  private isAssembled: boolean = false;
  private drawProgress = { value: 0 };
  private drawTimeline: gsap.core.Timeline | null = null;

  // Materials
  private plateMat!: THREE.MeshStandardMaterial;
  private goldMat!: THREE.MeshStandardMaterial;
  private tier1Mat!: THREE.MeshStandardMaterial;
  private tier2Mat!: THREE.MeshStandardMaterial;
  private tier3Mat!: THREE.MeshStandardMaterial;
  private creamMat!: THREE.MeshStandardMaterial;
  private strawberryMat!: THREE.MeshStandardMaterial;
  private leafMat!: THREE.MeshStandardMaterial;
  private candleMat!: THREE.MeshStandardMaterial;
  private flameMat!: THREE.MeshBasicMaterial;

  constructor() {
    this.group = new THREE.Group();
    // Scaled up celebratory size, shifted right to center-right stage
    this.group.scale.set(0.60, 0.60, 0.60);
    this.group.position.set(0.28, -2.22, 0.5);
    this.group.rotation.set(0.14, 0, 0);

    this.plateGroup = new THREE.Group();
    this.tier1Group = new THREE.Group();
    this.tier2Group = new THREE.Group();
    this.tier3Group = new THREE.Group();
    this.candlesGroup = new THREE.Group();
    this.number16Group = new THREE.Group();
    this.penGroup = new THREE.Group();

    this.group.add(this.plateGroup);
    this.group.add(this.tier1Group);
    this.group.add(this.tier2Group);
    this.group.add(this.tier3Group);
    this.group.add(this.candlesGroup);
    this.group.add(this.number16Group);
    this.group.add(this.penGroup);

    this.initMaterials();
    this.buildBasePlate();
    this.buildTier1();
    this.buildTier2();
    this.buildTier3();
    this.buildCandles();
    this.buildNumber16();
    this.buildMagicPen();
    this.buildPenTrail();

    // Hide everything initially until the pen draws them
    this.resetForDrawing();
  }

  private initMaterials() {
    // 1. Polished Porcelain Plate
    this.plateMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.12,
      metalness: 0.2,
    });

    // 2. Luxury 24K Mirrored Gold for accents
    this.goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      roughness: 0.15,
      metalness: 0.88,
    });

    // 3. Tier 1: Strawberry Velvet Pastry Cream
    this.tier1Mat = new THREE.MeshStandardMaterial({
      color: 0xff8da1,
      roughness: 0.32,
      metalness: 0.05,
    });

    // 4. Tier 2: Chantilly Vanilla Cream
    this.tier2Mat = new THREE.MeshStandardMaterial({
      color: 0xfffcf2,
      roughness: 0.25,
      metalness: 0.04,
    });

    // 5. Tier 3: Rose Macaron Velvet
    this.tier3Mat = new THREE.MeshStandardMaterial({
      color: 0xff6b8b,
      roughness: 0.3,
      metalness: 0.05,
    });

    // 6. Whipped Fluffy Cream Pearls
    this.creamMat = new THREE.MeshStandardMaterial({
      color: 0xfffff8,
      roughness: 0.18,
      metalness: 0.08,
    });

    // 7. Ruby Strawberries & Green Leaves
    this.strawberryMat = new THREE.MeshStandardMaterial({
      color: 0xe6194b,
      roughness: 0.22,
      metalness: 0.12,
    });

    this.leafMat = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f,
      roughness: 0.4,
      metalness: 0.05,
    });

    // 8. Candles
    this.candleMat = new THREE.MeshStandardMaterial({
      color: 0xffd6e0,
      roughness: 0.25,
      metalness: 0.15,
    });

    // 9. Golden Candle Flame
    this.flameMat = new THREE.MeshBasicMaterial({
      color: 0xffb703,
    });
  }

  // --- 0. BASE PLATE ---
  private buildBasePlate() {
    const plateGeo = new THREE.CylinderGeometry(3.9, 3.5, 0.22, 54);
    const plate = new THREE.Mesh(plateGeo, this.plateMat);
    this.plateGroup.add(plate);

    const rimGeo = new THREE.TorusGeometry(3.88, 0.065, 16, 64);
    rimGeo.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, this.goldMat);
    rim.position.y = 0.08;
    this.plateGroup.add(rim);

    this.plateGroup.position.y = -1.1;
  }

  // --- 1. TIER 1 (Bottom Tier: Radius 3.3, Height 1.25) ---
  private buildTier1() {
    const radius = 3.3;
    const height = 1.25;
    const yCenter = -1.1 + 0.11 + height / 2; // y = -0.365

    const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 54);
    const body = new THREE.Mesh(bodyGeo, this.tier1Mat);
    this.tier1Group.add(body);

    // Bottom cream pearls around full 360° circle
    const pearlCount = 42;
    const pearlGeo = new THREE.SphereGeometry(0.12, 16, 16);
    for (let i = 0; i < pearlCount; i++) {
      const angle = (i / pearlCount) * Math.PI * 2;
      const pearl = new THREE.Mesh(pearlGeo, this.creamMat);
      pearl.position.set(
        Math.cos(angle) * (radius + 0.02),
        -height / 2 + 0.09,
        Math.sin(angle) * (radius + 0.02)
      );
      this.tier1Group.add(pearl);
    }

    // Top fresh strawberries with natural plump shape around full 360° rim
    const berryCount = 20;
    const berryGeo = new THREE.SphereGeometry(0.16, 18, 18);
    berryGeo.scale(1, 1.25, 0.95);
    const leafGeo = new THREE.ConeGeometry(0.09, 0.05, 5);

    for (let i = 0; i < berryCount; i++) {
      const angle = (i / berryCount) * Math.PI * 2;
      const berryContainer = new THREE.Group();

      const berry = new THREE.Mesh(berryGeo, this.strawberryMat);
      berryContainer.add(berry);

      const leaf = new THREE.Mesh(leafGeo, this.leafMat);
      leaf.position.y = 0.18;
      berryContainer.add(leaf);

      berryContainer.position.set(
        Math.cos(angle) * (radius - 0.22),
        height / 2 + 0.14,
        Math.sin(angle) * (radius - 0.22)
      );
      this.tier1Group.add(berryContainer);
    }

    this.tier1Group.position.y = yCenter;
  }

  // --- 2. TIER 2 (Middle Tier: Radius 2.4, Height 1.05) ---
  private buildTier2() {
    const radius = 2.4;
    const height = 1.05;
    const yCenter = -0.365 + 1.25 / 2 + height / 2; // y = 0.785

    const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 54);
    const body = new THREE.Mesh(bodyGeo, this.tier2Mat);
    this.tier2Group.add(body);

    // Cream rosettes on bottom edge (full 360° ring)
    const rosetteCount = 36;
    const rosetteGeo = new THREE.SphereGeometry(0.1, 16, 16);
    for (let i = 0; i < rosetteCount; i++) {
      const angle = (i / rosetteCount) * Math.PI * 2;
      const rosette = new THREE.Mesh(rosetteGeo, this.creamMat);
      rosette.position.set(
        Math.cos(angle) * (radius + 0.02),
        -height / 2 + 0.08,
        Math.sin(angle) * (radius + 0.02)
      );
      this.tier2Group.add(rosette);
    }

    // --- FULL 360° DUAL BANNERS (FRONT & BACK) ---
    // 1. FRONT BANNER (facing +Z, 0 deg): "💖 happy birthday em 💖"
    this.buildFrontBanner(radius, height);

    // 2. BACK BANNER (facing -Z, 180 deg): "🎂 Em Khánh Huyền 🎂"
    this.buildBackBanner(radius, height);

    this.tier2Group.position.y = yCenter;
  }

  // Front Banner: "Happy Birthday Em" (Centered at theta = 0, facing +Z camera)
  private buildFrontBanner(cakeRadius: number, cakeHeight: number) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Warm porcelain ribbon background with soft blush tone
    const ribbonGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    ribbonGrad.addColorStop(0, '#fff4f8');
    ribbonGrad.addColorStop(0.5, '#ffffff');
    ribbonGrad.addColorStop(1, '#fff4f8');

    ctx.fillStyle = ribbonGrad;
    ctx.beginPath();
    ctx.roundRect(35, 35, canvas.width - 70, canvas.height - 70, 75);
    ctx.fill();

    // High contrast dark outer contour + 24K gold inner rim
    ctx.strokeStyle = '#22010c';
    ctx.lineWidth = 18;
    ctx.stroke();

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(52, 52, canvas.width - 104, canvas.height - 104, 60);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 italic 195px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Arial Black", sans-serif';

    // 1. Deep 3D Shadow for separation
    ctx.fillStyle = 'rgba(25, 0, 10, 0.45)';
    ctx.fillText('Happy Birthday Em', canvas.width / 2 + 6, canvas.height / 2 + 10);

    // 2. Bold Dark Crimson Contour (32px) for crystal-clear readability
    ctx.strokeStyle = '#180008';
    ctx.lineWidth = 32;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeText('Happy Birthday Em', canvas.width / 2, canvas.height / 2);

    // 3. Saturated Radiant Ruby Red Fill
    const textGrad = ctx.createLinearGradient(0, 140, 0, 370);
    textGrad.addColorStop(0, '#ff1a70');   // Vivid hot rose
    textGrad.addColorStop(0.45, '#d6004f'); // Intense ruby red
    textGrad.addColorStop(1, '#780026');   // Rich deep velvet crimson
    ctx.fillStyle = textGrad;
    ctx.fillText('Happy Birthday Em', canvas.width / 2, canvas.height / 2);

    // 4. Clean Inner Highlight for crisp embossed appearance
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 7;
    ctx.strokeText('Happy Birthday Em', canvas.width / 2, canvas.height / 2);

    // Decorative Flanking Hearts
    ctx.font = '95px sans-serif';
    ctx.fillStyle = '#ff1a75';
    ctx.fillText('💖', 130, canvas.height / 2);
    ctx.fillText('💖', canvas.width - 130, canvas.height / 2);

    const bannerTexture = new THREE.CanvasTexture(canvas);
    bannerTexture.colorSpace = THREE.SRGBColorSpace;
    bannerTexture.minFilter = THREE.LinearFilter;
    bannerTexture.magFilter = THREE.LinearFilter;
    bannerTexture.anisotropy = 16;
    bannerTexture.generateMipmaps = true;

    const thetaLength = 2.02; // Curved banner wrapped across front of tier
    const bannerGeo = new THREE.CylinderGeometry(
      cakeRadius + 0.05,
      cakeRadius + 0.05,
      cakeHeight * 0.76,
      48,
      1,
      true,
      -thetaLength / 2, // Centered at angle 0 -> exactly +Z axis!
      thetaLength
    );

    // MeshBasicMaterial ensures 100% color fidelity and ZERO glare/washout from scene lights
    const bannerMat = new THREE.MeshBasicMaterial({
      map: bannerTexture,
      transparent: true,
      side: THREE.DoubleSide,
      toneMapped: false,
    });

    this.bannerFrontMesh = new THREE.Mesh(bannerGeo, bannerMat);
    this.tier2Group.add(this.bannerFrontMesh);
  }

  // Back Banner: "Em Khánh Huyền" (Centered at theta = PI, facing -Z)
  private buildBackBanner(cakeRadius: number, cakeHeight: number) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ribbonGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    ribbonGrad.addColorStop(0, '#fff4f8');
    ribbonGrad.addColorStop(0.5, '#ffffff');
    ribbonGrad.addColorStop(1, '#fff4f8');

    ctx.fillStyle = ribbonGrad;
    ctx.beginPath();
    ctx.roundRect(35, 35, canvas.width - 70, canvas.height - 70, 75);
    ctx.fill();

    ctx.strokeStyle = '#22010c';
    ctx.lineWidth = 18;
    ctx.stroke();

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(52, 52, canvas.width - 104, canvas.height - 104, 60);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 italic 195px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Arial Black", sans-serif';

    ctx.fillStyle = 'rgba(25, 0, 10, 0.45)';
    ctx.fillText('Em Khánh Huyền', canvas.width / 2 + 6, canvas.height / 2 + 10);

    ctx.strokeStyle = '#180008';
    ctx.lineWidth = 32;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeText('Em Khánh Huyền', canvas.width / 2, canvas.height / 2);

    const textGrad = ctx.createLinearGradient(0, 140, 0, 370);
    textGrad.addColorStop(0, '#ff1a70');
    textGrad.addColorStop(0.45, '#d6004f');
    textGrad.addColorStop(1, '#780026');

    ctx.fillStyle = textGrad;
    ctx.fillText('Em Khánh Huyền', canvas.width / 2, canvas.height / 2);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 7;
    ctx.strokeText('Em Khánh Huyền', canvas.width / 2, canvas.height / 2);

    ctx.font = '95px sans-serif';
    ctx.fillStyle = '#ff1a75';
    ctx.fillText('🎂', 130, canvas.height / 2);
    ctx.fillText('💖', canvas.width - 130, canvas.height / 2);

    const bannerTexture = new THREE.CanvasTexture(canvas);
    bannerTexture.colorSpace = THREE.SRGBColorSpace;
    bannerTexture.minFilter = THREE.LinearFilter;
    bannerTexture.magFilter = THREE.LinearFilter;
    bannerTexture.anisotropy = 16;
    bannerTexture.generateMipmaps = true;

    const thetaLength = 2.02;
    const bannerGeo = new THREE.CylinderGeometry(
      cakeRadius + 0.05,
      cakeRadius + 0.05,
      cakeHeight * 0.76,
      48,
      1,
      true,
      Math.PI - thetaLength / 2, // Centered at angle PI -> exactly -Z axis!
      thetaLength
    );

    const bannerMat = new THREE.MeshBasicMaterial({
      map: bannerTexture,
      transparent: true,
      side: THREE.DoubleSide,
      toneMapped: false,
    });

    this.bannerBackMesh = new THREE.Mesh(bannerGeo, bannerMat);
    this.tier2Group.add(this.bannerBackMesh);
  }

  // --- 3. TIER 3 (Top Tier: Radius 1.5, Height 0.85) ---
  private buildTier3() {
    const radius = 1.5;
    const height = 0.85;
    const yCenter = 0.785 + 1.05 / 2 + height / 2; // y = 1.735

    const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 48);
    const body = new THREE.Mesh(bodyGeo, this.tier3Mat);
    this.tier3Group.add(body);

    // Cream piping swirls on top edge (full 360° ring)
    const rosetteCount = 24;
    const rosetteGeo = new THREE.SphereGeometry(0.1, 16, 16);
    for (let i = 0; i < rosetteCount; i++) {
      const angle = (i / rosetteCount) * Math.PI * 2;
      const rosette = new THREE.Mesh(rosetteGeo, this.creamMat);
      rosette.position.set(
        Math.cos(angle) * (radius - 0.08),
        height / 2 + 0.06,
        Math.sin(angle) * (radius - 0.08)
      );
      this.tier3Group.add(rosette);
    }

    this.tier3Group.position.y = yCenter;
  }

  // --- 4. ELEGANT BIRTHDAY CANDLES FRAMING THE NUMBER 16 TOPPER ---
  private buildCandles() {
    const yTopSurface = 1.735 + 0.85 / 2; // y = 2.16

    // 4 Luxury Candles symmetrically framing the central Number 16 topper
    const candlePositions: { x: number; z: number }[] = [
      { x: 0.82, z: 0.32 },
      { x: -0.82, z: 0.32 },
      { x: 0.82, z: -0.32 },
      { x: -0.82, z: -0.32 },
    ];

    candlePositions.forEach((pos) => {
      const candleGroup = new THREE.Group();

      const stemHeight = 0.65;
      const stemGeo = new THREE.CylinderGeometry(0.06, 0.06, stemHeight, 16);
      const stem = new THREE.Mesh(stemGeo, this.candleMat);
      stem.position.y = stemHeight / 2;
      candleGroup.add(stem);

      // Gold spiral accent bands
      const bandGeo = new THREE.TorusGeometry(0.064, 0.012, 8, 20);
      bandGeo.rotateX(Math.PI / 2);
      const band1 = new THREE.Mesh(bandGeo, this.goldMat);
      band1.position.y = stemHeight * 0.35;
      candleGroup.add(band1);
      const band2 = new THREE.Mesh(bandGeo, this.goldMat);
      band2.position.y = stemHeight * 0.70;
      candleGroup.add(band2);

      // Candle Wick
      const wick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.12, 8),
        new THREE.MeshBasicMaterial({ color: 0x222222 })
      );
      wick.position.y = stemHeight + 0.06;
      candleGroup.add(wick);

      // Flame
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.22, 16), this.flameMat);
      flame.position.y = stemHeight + 0.12 + 0.11;
      candleGroup.add(flame);
      this.flames.push(flame);

      // Dynamic light
      const light = new THREE.PointLight(0xffa500, 0, 3.5);
      light.position.y = flame.position.y;
      candleGroup.add(light);
      this.lights.push(light);

      candleGroup.position.set(pos.x, yTopSurface, pos.z);
      this.candlesGroup.add(candleGroup);
    });
  }

  // --- 4B. ROYAL 24K GOLD NUMBER 16 TOPPER ON TOP OF THE CAKE (360° DOUBLE-SIDED) ---
  private buildNumber16() {
    const yTopSurface = 1.735 + 0.85 / 2; // y = 2.16

    // 1. Two 24K Gold Support Dowels / Stakes
    const stakeGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.48, 16);
    const stake1 = new THREE.Mesh(stakeGeo, this.goldMat);
    stake1.position.set(-0.35, yTopSurface + 0.24, 0);
    this.number16Group.add(stake1);

    const stake2 = new THREE.Mesh(stakeGeo, this.goldMat);
    stake2.position.set(0.35, yTopSurface + 0.24, 0);
    this.number16Group.add(stake2);

    // Cream rosettes at base of stakes
    const rosetteGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const rosette1 = new THREE.Mesh(rosetteGeo, this.creamMat);
    rosette1.position.set(-0.35, yTopSurface + 0.06, 0);
    this.number16Group.add(rosette1);

    const rosette2 = new THREE.Mesh(rosetteGeo, this.creamMat);
    rosette2.position.set(0.35, yTopSurface + 0.06, 0);
    this.number16Group.add(rosette2);

    // 2. Medallion Plaque Frame (Width 1.56, Height 1.28, Depth 0.08)
    const plaqueWidth = 1.56;
    const plaqueHeight = 1.28;
    const plaqueThickness = 0.08;
    const plaqueY = yTopSurface + 0.48 + plaqueHeight / 2; // y ~ 3.28

    // Beveled 24K Gold Frame
    const casingGeo = new THREE.BoxGeometry(plaqueWidth, plaqueHeight, plaqueThickness);
    const casing = new THREE.Mesh(casingGeo, this.goldMat);
    casing.position.set(0, plaqueY, 0);
    this.number16Group.add(casing);

    // Royal Crown Peak
    const crownGeo = new THREE.ConeGeometry(0.16, 0.22, 5);
    const crown = new THREE.Mesh(crownGeo, this.goldMat);
    crown.position.set(0, plaqueY + plaqueHeight / 2 + 0.09, 0);
    this.number16Group.add(crown);

    const jewelGeo = new THREE.OctahedronGeometry(0.10);
    const jewel = new THREE.Mesh(
      jewelGeo,
      new THREE.MeshBasicMaterial({ color: 0xff1493 })
    );
    jewel.position.set(0, plaqueY + plaqueHeight / 2 + 0.20, 0);
    this.number16Group.add(jewel);

    // 3. Ultra High-Resolution 2048x1536 Double-Sided Medallion Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1536;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // High-contrast clean porcelain white/warm ivory
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#ffffff');
    bgGrad.addColorStop(0.5, '#fff5f8');
    bgGrad.addColorStop(1, '#ffe4ee');

    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(40, 40, canvas.width - 80, canvas.height - 80, 100);
    ctx.fill();

    // Sharp dark outer border + 24K gold inner border
    ctx.strokeStyle = '#20010c';
    ctx.lineWidth = 26;
    ctx.stroke();

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.roundRect(68, 68, canvas.width - 136, canvas.height - 136, 80);
    ctx.stroke();

    // Corner Filigree Accents
    ctx.fillStyle = '#b38728';
    const corners = [
      [130, 130],
      [canvas.width - 130, 130],
      [130, canvas.height - 130],
      [canvas.width - 130, canvas.height - 130],
    ];
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fill();
    });

    // Top Subtitle: "★ SWEET 16 ★"
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 110px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Arial Black", sans-serif';
    ctx.fillStyle = '#6a0024';
    ctx.fillText('★ SWEET 16 ★', canvas.width / 2, 230);

    // Main Centerpiece: "16" Extra Bold with High-Contrast Dark Outline & Radiant Ruby Crimson Fill
    ctx.font = '900 960px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Arial Black", "Impact", sans-serif';

    // 1. Deep 3D Drop Shadow
    ctx.fillStyle = 'rgba(25, 0, 10, 0.45)';
    ctx.fillText('16', canvas.width / 2 + 14, canvas.height / 2 + 125);

    // 2. Bold Dark Outline for Instant Crisp Readability
    ctx.strokeStyle = '#180008';
    ctx.lineWidth = 56;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeText('16', canvas.width / 2, canvas.height / 2 + 105);

    // 3. Radiant Saturated Ruby Crimson Gradient Fill
    const numGrad = ctx.createLinearGradient(0, 320, 0, 1300);
    numGrad.addColorStop(0.0, '#ff1a70');  // Luminous hot rose
    numGrad.addColorStop(0.48, '#e00052'); // Rich vivid ruby red
    numGrad.addColorStop(1.0, '#800026');  // Deep velvet crimson
    ctx.fillStyle = numGrad;
    ctx.fillText('16', canvas.width / 2, canvas.height / 2 + 105);

    // 4. White Inner Gleam Outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 14;
    ctx.strokeText('16', canvas.width / 2, canvas.height / 2 + 105);

    // Sparkle Jewels on both sides
    ctx.font = '140px sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.fillText('✨', 260, canvas.height / 2 + 75);
    ctx.fillText('✨', canvas.width - 260, canvas.height / 2 + 75);

    // Bottom Decorative Flourish
    ctx.font = '900 95px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Arial Black", sans-serif';
    ctx.fillStyle = '#6a0024';
    ctx.fillText('💖 HAPPY BIRTHDAY 💖', canvas.width / 2, canvas.height - 180);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 16;
    texture.generateMipmaps = true;

    const faceGeo = new THREE.PlaneGeometry(plaqueWidth - 0.04, plaqueHeight - 0.04);
    // MeshBasicMaterial ensures 100% color fidelity, high contrast, and ZERO lighting washout
    const faceMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      toneMapped: false,
    });

    // Front Face (+Z) facing camera
    const frontMesh = new THREE.Mesh(faceGeo, faceMat);
    frontMesh.position.set(0, plaqueY, plaqueThickness / 2 + 0.005);
    this.number16Group.add(frontMesh);

    // Back Face (-Z) rotated 180° so "16" is read right-side-up from the back too!
    const backMesh = new THREE.Mesh(faceGeo, faceMat);
    backMesh.position.set(0, plaqueY, -plaqueThickness / 2 - 0.005);
    backMesh.rotation.y = Math.PI;
    this.number16Group.add(backMesh);
  }

  // --- 5. 3D MAGIC PEN ---
  private buildMagicPen() {
    const penBody = new THREE.Group();

    // A. Golden Writing Nib (Tip at 0, 0, 0)
    const nibGeo = new THREE.ConeGeometry(0.075, 0.42, 16);
    nibGeo.translate(0, 0.21, 0);
    const nib = new THREE.Mesh(nibGeo, this.goldMat);
    penBody.add(nib);

    // B. Grip Ring
    const gripGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 16);
    gripGeo.translate(0, 0.42 + 0.175, 0);
    const grip = new THREE.Mesh(gripGeo, this.goldMat);
    penBody.add(grip);

    // C. Pearlescent Stylus Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.065, 0.08, 1.45, 16);
    barrelGeo.translate(0, 0.42 + 0.35 + 0.725, 0);
    const barrelMat = new THREE.MeshStandardMaterial({
      color: 0xfff0f5,
      roughness: 0.18,
      metalness: 0.25,
    });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    penBody.add(barrel);

    // D. Faceted Crystal Jewel Crown
    const jewelGeo = new THREE.OctahedronGeometry(0.14);
    jewelGeo.translate(0, 0.42 + 0.35 + 1.45 + 0.1, 0);
    const jewelMat = new THREE.MeshBasicMaterial({
      color: 0xff3388,
    });
    const jewel = new THREE.Mesh(jewelGeo, jewelMat);
    penBody.add(jewel);

    // E. Dynamic Glowing Tip Light
    this.penTipLight = new THREE.PointLight(0xffdf70, 0, 4.5);
    this.penTipLight.position.set(0, 0, 0);
    penBody.add(this.penTipLight);

    penBody.rotation.x = Math.PI / 3.2;
    penBody.rotation.z = -Math.PI / 8;

    this.penGroup.add(penBody);
  }

  // --- 6. PEN SPARKLE TRAIL ---
  private buildPenTrail() {
    this.penTrailPositions = new Float32Array(this.maxTrailPoints * 3);

    for (let i = 0; i < this.maxTrailPoints; i++) {
      this.penTrailPositions[i * 3] = 0;
      this.penTrailPositions[i * 3 + 1] = -100;
      this.penTrailPositions[i * 3 + 2] = 0;
    }

    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(this.penTrailPositions, 3));

    const heartTexture = createHeartSpriteTexture();

    this.penTrailMaterial = new THREE.PointsMaterial({
      size: 0.22,
      map: heartTexture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.penTrailPoints = new THREE.Points(trailGeo, this.penTrailMaterial);
    this.group.add(this.penTrailPoints);
  }

  public resetForDrawing() {
    this.plateGroup.scale.set(0, 0, 0);
    this.tier1Group.scale.set(0, 0, 0);
    this.tier2Group.scale.set(0, 0, 0);
    this.tier3Group.scale.set(0, 0, 0);
    this.candlesGroup.scale.set(0, 0, 0);
    this.number16Group.scale.set(0, 0, 0);

    this.flames.forEach((f) => f.scale.set(0, 0, 0));
    this.lights.forEach((l) => (l.intensity = 0));
    this.penTipLight.intensity = 0;

    this.penGroup.position.set(5, -2, 4);
    this.penGroup.scale.set(0, 0, 0);

    if (this.penTrailMaterial) {
      this.penTrailMaterial.opacity = 0.9;
    }

    this.isDrawing = false;
    this.isAssembled = false;
    this.isCandlesLit = false;
  }

  // TRIGGER: HIỆU ỨNG CHIẾC BÚT VẼ BÁNH SINH NHẬT 3D XOAY TRÒN TỪ DƯỚI LÊN TRÊN
  public playDrawWithPenAnimation(onComplete?: () => void) {
    // Khi đã tạo xong bánh lần 1 thì KHÔNG vẽ lại lần 2!
    if (this.isAssembled) {
      if (onComplete) onComplete();
      return;
    }
    if (this.isDrawing) return;

    if (this.drawTimeline) this.drawTimeline.kill();

    this.resetForDrawing();
    this.isDrawing = true;
    this.group.visible = true;

    romanticAudio.playPaperSound();

    const tl = gsap.timeline({
      onComplete: () => {
        this.isDrawing = false;
        this.isAssembled = true;
        this.isCandlesLit = true;
        this.number16Group.scale.set(1, 1, 1);
        if (onComplete) onComplete();
      },
    });
    this.drawTimeline = tl;

    // 1. The Magic Pen swoops into view with a brilliant sparkle flash
    tl.to(this.penGroup.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.6,
      ease: 'back.out(2)',
      onStart: () => {
        this.penTipLight.intensity = 3.0;
        romanticAudio.playSparkleSound();
      },
    }, 0);

    // 2. The Pen Spirals rapidly in 360° circles from bottom to top over 4.2 seconds
    this.drawProgress.value = 0;
    tl.to(
      this.drawProgress,
      {
        value: 1,
        duration: 4.2,
        ease: 'power1.inOut',
      },
      0.3
    );

    // 3. Progressive Reveal of each layer as the Pen reaches its height
    // A. Base Plate (t ~ 0.12)
    tl.to(
      this.plateGroup.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.55,
        ease: 'back.out(1.8)',
        onStart: () => romanticAudio.playPopSound(1.0),
      },
      0.75
    );

    // B. Tier 1 (t ~ 0.32)
    tl.to(
      this.tier1Group.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.6,
        ease: 'back.out(1.7)',
        onStart: () => romanticAudio.playPopSound(1.2),
      },
      1.5
    );

    // C. Tier 2 + Banners (t ~ 0.55)
    tl.to(
      this.tier2Group.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.65,
        ease: 'back.out(1.8)',
        onStart: () => {
          romanticAudio.playPopSound(1.4);
          romanticAudio.playSparkleSound();
        },
      },
      2.3
    );

    // D. Tier 3 (t ~ 0.74)
    tl.to(
      this.tier3Group.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.6,
        ease: 'back.out(1.8)',
        onStart: () => romanticAudio.playPopSound(1.6),
      },
      3.05
    );

    // E. Perimeter Candles appear (t ~ 0.88)
    tl.to(
      this.candlesGroup.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.55,
        ease: 'back.out(2)',
      },
      3.6
    );

    // E2. Royal 24K Gold Number 16 Topper appears on top of the cake with sparkle chime!
    tl.to(
      this.number16Group.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.65,
        ease: 'back.out(2.2)',
        onStart: () => {
          romanticAudio.playPopSound(1.8);
          romanticAudio.playSparkleSound();
        },
      },
      3.68
    );

    // F. The Pen lights all candle flames with a glorious chime burst
    tl.add(() => {
      romanticAudio.playSparkleSound();
      this.isCandlesLit = true;
    }, 4.0);

    this.flames.forEach((flame, i) => {
      tl.to(
        flame.scale,
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.4,
          ease: 'back.out(2.5)',
        },
        4.0 + i * 0.08
      );
    });

    this.lights.forEach((light, i) => {
      tl.to(
        light,
        {
          intensity: 1.8,
          duration: 0.4,
        },
        4.0 + i * 0.08
      );
    });

    // G. The Magic Pen does a celebratory loop into the stars & dissolves
    tl.to(
      this.penGroup.position,
      {
        y: 6.5,
        x: 1.5,
        duration: 0.8,
        ease: 'power2.in',
      },
      4.5
    );

    tl.to(
      this.penGroup.scale,
      {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          this.penTipLight.intensity = 0;
          if (this.penTrailMaterial) {
            gsap.to(this.penTrailMaterial, { opacity: 0, duration: 1.0 });
          }
        },
      },
      4.7
    );

    return tl;
  }

  // Blow out candles feature
  public blowCandles(onComplete?: () => void) {
    if (!this.isCandlesLit) return;
    this.isCandlesLit = false;

    this.flames.forEach((flame) => {
      gsap.to(flame.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.35,
        ease: 'power2.in',
      });
    });

    this.lights.forEach((light) => {
      gsap.to(light, {
        intensity: 0,
        duration: 0.35,
      });
    });

    romanticAudio.playPaperSound();
    if (onComplete) onComplete();
  }

  public update(time: number, delta: number = 0.016) {
    // 1. UPDATE PEN POSITION ALONG 3D HELICAL SPIRAL WHILE DRAWING
    if (this.isDrawing) {
      const p = this.drawProgress.value;

      const totalTurns = 5.2;
      const angle = p * totalTurns * Math.PI * 2;
      const currentY = -1.25 + p * 3.95;

      let targetRadius = 3.8;
      if (currentY < -0.3) {
        targetRadius = 3.65;
      } else if (currentY < 0.9) {
        targetRadius = 2.75;
      } else if (currentY < 1.9) {
        targetRadius = 1.85;
      } else {
        targetRadius = 0.95;
      }

      const currentX = Math.cos(angle) * targetRadius;
      const currentZ = Math.sin(angle) * targetRadius;

      this.penGroup.position.set(currentX, currentY, currentZ);
      this.penGroup.rotation.y = -angle + Math.PI / 2;

      const posAttr = this.penTrailPoints.geometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      const trailIdx = (this.trailIndex % this.maxTrailPoints) * 3;
      posArray[trailIdx] = currentX + (Math.random() - 0.5) * 0.08;
      posArray[trailIdx + 1] = currentY + (Math.random() - 0.5) * 0.08;
      posArray[trailIdx + 2] = currentZ + (Math.random() - 0.5) * 0.08;
      this.trailIndex++;
      posAttr.needsUpdate = true;
    }

    // 2. IDLE FLOATING, CANDLE FLICKER & STEADY FRONT-FACING ORIENTATION (NO ROTATION)
    if (this.isAssembled) {
      this.group.position.y = -2.15 + Math.sin(time * 1.5) * 0.03;
      this.group.rotation.y = 0; // Fixed front-facing, no auto-rotation

      if (this.isCandlesLit) {
        this.flames.forEach((flame, idx) => {
          const flicker = 1.0 + Math.sin(time * 14 + idx * 2.3) * 0.12;
          const sway = Math.cos(time * 10 + idx * 1.7) * 0.08;
          flame.scale.set(flicker, flicker * 1.15, flicker);
          flame.rotation.z = sway;
        });

        this.lights.forEach((light, idx) => {
          light.intensity = 1.8 + Math.sin(time * 18 + idx * 3.1) * 0.35;
        });
      }
    }
  }

  public setVisible(visible: boolean) {
    this.group.visible = visible;
  }

  public dispose() {
    if (this.drawTimeline) this.drawTimeline.kill();
    this.plateMat.dispose();
    this.goldMat.dispose();
    this.tier1Mat.dispose();
    this.tier2Mat.dispose();
    this.tier3Mat.dispose();
    this.creamMat.dispose();
    this.strawberryMat.dispose();
    this.leafMat.dispose();
    this.candleMat.dispose();
    this.flameMat.dispose();
    if (this.penTrailMaterial) this.penTrailMaterial.dispose();
  }
}
