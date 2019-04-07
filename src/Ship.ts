import { Laser } from "./Laser";

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
  public lasers: Laser[] = [];
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
    private readonly FRICTION: number = 0.7,
    private COLOR: string = "#fff",
    private readonly EXPLODE_DURATION: number = 1,
    private readonly INV_DURATION: number = 3,
    private readonly BLINK_DURATION: number = 0.2,
    private readonly MAX_LASERS: number = 10
  ) {}

  public draw() {
    if (this.blinkNum % 2 === 1) {
      return;
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
    if (this.thrusting) {
      this.drawThruster();
    }
  }

  public update() {
    if (this.rot !== 0) {
      this.recalcAngle();
    }
    if (this.thrusting) {
      this.thrustShip();
    } else {
      this.slowDown();
    }
    this.move();

    // handle blinking
    if (this.blinkNum > 0) {
      this.handleBlinking();
    }
  }

  public shoot() {
    if (!this.canShoot || this.MAX_LASERS <= this.lasers.length || this.dead) {
      return;
    }
    this.lasers.push(
      new Laser(this.x, this.y, this.cos, this.sin, this.canv, this.ctx)
    );
    this.canShoot = false;
  }

  public destroy() {
    this.explodeTime = Math.ceil(this.EXPLODE_DURATION * this.FPS);
    this.dead = true;
  }

  public drawExplosion() {
    this.drawExplosionCircle("#990000", this.r * 1.8);
    this.drawExplosionCircle("#f00", this.r * 1.5);
    this.drawExplosionCircle("#ff9900", this.r * 1.2);
    this.drawExplosionCircle("#ffff00", this.r * 0.8);
    this.drawExplosionCircle("#fff", this.r * 0.3);
  }

  private handleBlinking() {
    this.blinkTime--;
    if (this.blinkTime === 0) {
      this.blinkTime = Math.ceil(this.BLINK_DURATION * this.FPS);
      this.blinkNum--;
    }
  }

  private drawExplosionCircle(color: string, r: number) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, r, 0, Math.PI * 2, false);
    this.ctx.fill();
  }

  private recalcAngle() {
    this.a += this.rot;
    this.cos = Math.cos(this.a);
    this.sin = Math.sin(this.a);
    this.sinMinCos = Math.sin(this.a) - Math.cos(this.a);
    this.sinPlusCos = Math.sin(this.a) + Math.cos(this.a);
  }

  private thrustShip() {
    this.thrust.x += (this.THRUST * this.cos) / this.FPS;
    this.thrust.y -= (this.THRUST * this.sin) / this.FPS;
  }

  private slowDown() {
    this.thrust.x -= (this.FRICTION * this.thrust.x) / this.FPS;
    this.thrust.y -= (this.FRICTION * this.thrust.y) / this.FPS;
  }

  private move() {
    this.x += this.thrust.x;
    this.y += this.thrust.y;
    // Handle edge of screen
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

  private drawThruster() {
    this.ctx.fillStyle = "#ffb366";
    this.ctx.strokeStyle = "#ffff80";
    this.ctx.lineWidth = this.SIZE / 10;
    this.ctx.beginPath();
    this.ctx.moveTo(
      this.x - this.r * ((2 / 3) * this.cos + 0.5 * this.sin),
      this.y + this.r * ((2 / 3) * this.sin - 0.5 * this.cos)
    );
    this.ctx.lineTo(
      this.x - this.r * (5 / 3) * this.cos,
      this.y + this.r * (5 / 3) * this.sin
    );
    this.ctx.lineTo(
      this.x - this.r * ((2 / 3) * this.cos - 0.5 * this.sin),
      this.y + this.r * ((2 / 3) * this.sin + 0.5 * this.cos)
    );
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }
}
