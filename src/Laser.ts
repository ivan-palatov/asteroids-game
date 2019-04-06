export class Laser {
  public x: number;
  public y: number;
  public xv: number;
  public yv: number;
  public dist: number = 0;
  public explodeTime: number = 0;

  constructor(
    x: number,
    y: number,
    cos: number,
    sin: number,
    private readonly canv: HTMLCanvasElement,
    private readonly ctx: CanvasRenderingContext2D,
    private readonly SPEED: number = 500,
    private readonly SIZE: number = 2,
    private readonly FPS: number = 30,
    public readonly DIST: number = 0.8
  ) {
    this.x = x + (20 / 3) * cos;
    this.y = y - (20 / 3) * sin;
    this.xv = (this.SPEED * cos) / this.FPS;
    this.yv = (-this.SPEED * sin) / this.FPS;
  }

  public draw() {
    if (this.explodeTime === 0) {
      // draw laser
      this.ctx.fillStyle = "salmon";
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, this.SIZE, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // draw explosion
      this.ctx.fillStyle = "orangered";
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, 15 * 0.75, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = "salmon";
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, 15 * 0.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = "pink";
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, 15 * 0.25, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  public update() {
    if (this.explodeTime > 0) {
      return;
    }
    this.x += this.xv;
    this.y += this.yv;
    // calculate the distance traveled
    this.dist += Math.sqrt(this.xv ** 2 + this.yv ** 2);

    // handle edge of screen
    if (this.x < 0) {
      this.x = this.canv.width;
    } else if (this.x > this.canv.width) {
      this.x = 0;
    }
    if (this.y < 0) {
      this.y = this.canv.height;
    } else if (this.y > this.canv.height) {
      this.y = 0;
    }
  }
}
