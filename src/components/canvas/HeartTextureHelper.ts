import * as THREE from 'three';

// Generate a crisp, distinct, beautiful 3D glossy heart sprite texture
// Sharp silhouette so each individual heart is clearly recognizable even when small
export function createHeartSpriteTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2 - 4;
  const scale = 2.4;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Exact parametric heart path
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-14, -12, -25, 4, 0, 24);
  ctx.bezierCurveTo(25, 4, 14, -12, 0, 6);
  ctx.closePath();

  // Subtle dark-rose outline for contrast against overlapping neighbors
  ctx.strokeStyle = 'rgba(120, 0, 45, 0.85)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Rich gradient: deep crimson to vibrant pink-rose
  const grad = ctx.createLinearGradient(-12, -10, 12, 22);
  grad.addColorStop(0, '#ff9ebb'); // soft bright top edge
  grad.addColorStop(0.3, '#ff2a75'); // glowing vibrant magenta-rose
  grad.addColorStop(0.8, '#d6004c'); // deep romantic ruby
  grad.addColorStop(1, '#8b0032'); // shadow bottom

  ctx.fillStyle = grad;
  ctx.fill();

  // Specular glossy reflection highlights (left lobe shine)
  ctx.beginPath();
  ctx.ellipse(-6, -1, 3.2, 5.5, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fill();

  // Tiny accent highlight on right lobe
  ctx.beginPath();
  ctx.arc(6, -2, 1.8, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fill();

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
