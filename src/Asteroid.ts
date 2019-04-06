export class Asteroid {
  public readonly xv: number;
  public readonly yv: number;
  private readonly vert: number;
  private readonly a: number;
  private readonly offs: number[];

  constructor(
    public x: number,
    public y: number,
    public r: number,
    private readonly lvl: number = 0,
    private readonly canv: HTMLCanvasElement,
    private readonly ctx: CanvasRenderingContext2D,
    private readonly FPS: number = 30,
    private readonly INITIAL_SPEED: number = 50,
    private readonly THICKNESS: number = 1.5,
    private readonly COLOR: string = "#ddd",
    private readonly MAX_VERT: number = 10,
    private readonly JAG: number = 0.3
  ) {
    const speed = (1 + 0.1 * this.lvl) * this.INITIAL_SPEED;

    this.vert = Math.floor(
      Math.random() * (this.MAX_VERT + 1) + this.MAX_VERT / 2
    );
    this.xv =
      ((Math.random() * speed) / this.FPS) * (Math.random() < 0.5 ? 1 : -1);
    this.yv =
      ((Math.random() * speed) / this.FPS) * (Math.random() < 0.5 ? 1 : -1);
    this.a = Math.random() * Math.PI * 2;
    this.offs = [];
    for (let i = 0; i < this.vert; i++) {
      this.offs.push(Math.random() * this.JAG * 2 + 1 - this.JAG);
    }
  }

  public draw() {
    this.ctx.strokeStyle = this.COLOR;
    this.ctx.lineWidth = this.THICKNESS;
    this.ctx.beginPath();
    this.ctx.moveTo(
      this.x + this.r * this.offs[0] * Math.cos(this.a),
      this.y + this.r * this.offs[0] * Math.sin(this.a)
    );
    for (let i = 1; i < this.vert; i++) {
      const angle = this.a + (i * Math.PI * 2) / this.vert;
      this.ctx.lineTo(
        this.x + this.r * this.offs[i] * Math.cos(angle),
        this.y + this.r * this.offs[i] * Math.sin(angle)
      );
    }
    this.ctx.closePath();
    this.ctx.stroke();
  }

  public update() {
    // move asteroids
    this.x += this.xv;
    this.y += this.yv;

    // handle edge of screen
    if (this.x < 0 - this.r) {
      this.x = this.canv.width + this.r;
    } else if (this.x > this.canv.width + this.r) {
      this.x = 0 - this.r;
    }
    if (this.y < 0 - this.r) {
      this.y = this.canv.height + this.r;
    } else if (this.y > this.canv.height + this.r) {
      this.y = 0 - this.r;
    }
  }
}
