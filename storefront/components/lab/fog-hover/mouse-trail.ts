// Mouse trail mask: a 2D canvas, white everywhere, with a thick black stroke
// following the cursor. Wrapped in a CanvasTexture so the fluid sim can sample it.
// Ported from AudioVisuals/visualisers/webgl-sauna-timeout-overlay/mouse-trail.js
import * as THREE from "three";

export default class MouseTrail {
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  texture!: THREE.CanvasTexture;
  active = false;
  /** Brush size multiplier, grows while the user wipes. */
  scale = 1;
  /** Brush width as a fraction of the sim width. */
  brushSize = 0.1;
  /** How quickly the brush catches up with the cursor (0-1). */
  follow = 0.25;

  private currentX: number | null = null;
  private currentY = 0;
  private lastX = 0;
  private lastY = 0;
  private opacity = 0;

  constructor(width: number, height: number) {
    this.createCanvas(width, height);
    this.createTexture();
  }

  private createCanvas(width: number, height: number) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, width, height);
  }

  private createTexture() {
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.currentX = null;
    this.texture.dispose();
    this.createTexture();
  }

  update(mouseX: number, mouseY: number) {
    const targetX = mouseX * this.canvas.width;
    const targetY = mouseY * this.canvas.height;

    if (this.currentX === null) {
      this.currentX = this.lastX = targetX;
      this.currentY = this.lastY = targetY;
      return;
    }

    this.currentX += (targetX - this.currentX) * this.follow;
    this.currentY += (targetY - this.currentY) * this.follow;

    const moved = Math.hypot(this.currentX - this.lastX, this.currentY - this.lastY);
    const target = this.active && moved > 0.3 ? 1 : 0;
    this.opacity += (target - this.opacity) * 0.15;

    this.draw();
    this.lastX = this.currentX;
    this.lastY = this.currentY;
    this.texture.needsUpdate = true;
  }

  private draw() {
    const { canvas, ctx } = this;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const base = Math.max(canvas.width * this.brushSize, 18);
    // (a 0 lineWidth is ignored by canvas, which would keep the old width - so skip instead)
    if (this.opacity > 0.01 && base * this.scale >= 0.5) {
      ctx.beginPath();
      ctx.moveTo(this.lastX, this.lastY);
      ctx.lineTo(this.currentX!, this.currentY);
      ctx.lineCap = "round";
      ctx.lineWidth = base * this.scale;
      ctx.strokeStyle = `rgba(0, 0, 0, ${this.opacity})`;
      ctx.stroke();
    }
  }

  dispose() {
    this.texture.dispose();
  }
}
