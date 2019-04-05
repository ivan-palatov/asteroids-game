interface IThrust {
  x: number;
  y: number;
}

export class Ship {
  public x: number = this.canv.width / 2;
  public y: number = this.canv.height / 2;
  public r: number = this.SIZE / 2;
  public a: number = Math.PI / 2;
  public rot: number = 0;
  public explodeTime: number = 0;
  public thrusting: boolean = false;
  public thrust: IThrust = { x: 0, y: 0 };
  public blinkTime: number = Math.ceil(this.BLINK_DURATION * this.FPS);
  public blinkNum: number = Math.ceil(this.INV_DURATION / this.BLINK_DURATION);
  public canShoot: boolean = true;
  public lasers: any[] = []; // TODO: change type
  public dead: boolean = false;
  public cos: number = Math.cos(this.a);
  public sin: number = Math.sin(this.a);
  public sinMinCos: number = Math.sin(this.a) - Math.cos(this.a);
  public sinPlusCos: number = Math.sin(this.a) + Math.cos(this.a);
  private readonly THICKNESS: number = this.SIZE / 20;

  constructor(
    private readonly canv: HTMLCanvasElement,
    private readonly ctx: CanvasRenderingContext2D,
    private readonly FPS: number,
    private readonly SIZE: number = 30,
    public readonly TURN_SPEED: number = 180,
    private readonly THRUST: number = 5,
    private readonly EXPLODE_DURATION: number = 10,
    private readonly INV_DURATION: number = 3,
    private readonly BLINK_DURATION: number = 0.1,
    private COLOR: string = "#fff"
  ) {}

  public draw() {
    if (this.rot !== 0) {
      this.recalcAngle();
    }
    this.ctx.strokeStyle = this.COLOR;
    this.ctx.lineWidth = this.THICKNESS;
    this.ctx.beginPath();
    this.ctx.moveTo(
      this.x + (4 / 3) * this.r * this.cos,
      this.y - (4 / 3) * this.r * this.sin
    );
    this.ctx.lineTo(
      this.x - this.r * ((2 / 3) * this.sinPlusCos),
      this.y + this.r * ((2 / 3) * this.sinMinCos)
    );
    this.ctx.lineTo(
      this.x + this.r * ((2 / 3) * this.sinMinCos),
      this.y + this.r * ((2 / 3) * this.sinPlusCos)
    );
    this.ctx.closePath();
    this.ctx.stroke();
  }

  private recalcAngle() {
    this.a += this.rot;
    this.cos = Math.cos(this.a);
    this.sin = Math.sin(this.a);
    this.sinMinCos = Math.sin(this.a) - Math.cos(this.a);
    this.sinPlusCos = Math.sin(this.a) + Math.cos(this.a);
  }
}
