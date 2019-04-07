import { Asteroid } from "./Asteroid";
import { Ship } from "./Ship";

class Game {
  public ship: Ship;

  public lvl: number = -1;
  public score: number = 0;
  public lives: number = 3;

  private canv: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private interval: number;
  private asteroids: Asteroid[] = [];
  private readonly ASTEROIDS_AMOUNT: number = 3;
  private readonly ASTEROIDS_SIZE: number = 100;
  private readonly ASTEROIDS_PTS_LGE: number = 20;
  private readonly ASTEROIDS_PTS_MED: number = 50;
  private readonly ASTEROIDS_PTS_SML: number = 100;
  private readonly LASER_EXPLODE_DUR: number = 0.1;

  constructor(public readonly FPS: number = 30) {
    this.canv = document.getElementById("game") as HTMLCanvasElement;
    this.ctx = this.canv.getContext("2d")!;
    this.interval = 1000 / this.FPS;
    this.ship = new Ship(this.canv, this.ctx, this.FPS);
  }

  public start() {
    this.nextLevel();
    this.drawAndUpdate();
  }

  private drawAndUpdate() {
    this.drawBackground();

    // draw the ship
    if (!this.ship.dead) {
      // if ship is alive, update its properties and draw
      this.ship.update();
      this.ship.draw();
    } else if (this.ship.explodeTime > 0) {
      // if ship is dead and still exploding, draw explosion and decrease explodeTime
      this.ship.explodeTime--;
      this.ship.drawExplosion();
    } else {
      // if ship is dead and is no longer exploding, spawn a new ship
      this.ship = new Ship(this.canv, this.ctx, this.FPS);
    }

    // draw asteroids
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      this.asteroids[i].update();
      this.asteroids[i].draw();
      const deleted = this.handleLaserCollision(i);
      if (deleted) {
        continue;
      }
      this.handleShipCollision(i);
    }

    // draw lasers
    for (let i = this.ship.lasers.length - 1; i >= 0; i--) {
      const laser = this.ship.lasers[i];
      if (laser.dist > laser.DIST * this.canv.width) {
        this.ship.lasers.splice(i, 1);
        continue;
      }
      if (laser.explodeTime > 0) {
        laser.explodeTime--;
        if (laser.explodeTime === 0) {
          this.ship.lasers.splice(i, 1);
          continue;
        }
      }
      laser.update();
      laser.draw();
    }

    // recursion
    setTimeout(this.drawAndUpdate.bind(this), this.interval);
  }

  private handleLaserCollision(i: number) {
    for (let j = this.ship.lasers.length - 1; j >= 0; j--) {
      const laser = this.ship.lasers[j];
      if (
        laser.explodeTime === 0 &&
        this.distBetweenPoints(
          laser.x,
          laser.y,
          this.asteroids[i].x,
          this.asteroids[i].y
        ) < this.asteroids[i].r
      ) {
        this.destroyAsteroid(i);
        laser.explodeTime = Math.ceil(this.LASER_EXPLODE_DUR * this.FPS);
        return true;
      }
    }
    return false;
  }

  private handleShipCollision(i: number) {
    if (
      this.ship.blinkNum === 0 &&
      !this.ship.dead &&
      this.distBetweenPoints(
        this.ship.x,
        this.ship.y,
        this.asteroids[i].x,
        this.asteroids[i].y
      ) <
        this.ship.r + this.asteroids[i].r
    ) {
      this.ship.destroy();
      this.destroyAsteroid(i);
      return true;
    }
    return false;
  }

  private drawBackground() {
    this.ctx.fillStyle = "#001";
    this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);
  }

  private distBetweenPoints(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  private createAsteroids() {
    let x: number;
    let y: number;
    for (let i = 0; i < this.ASTEROIDS_AMOUNT + this.lvl; i++) {
      do {
        x = Math.floor(Math.random() * this.canv.width);
        y = Math.floor(Math.random() * this.canv.height);
      } while (
        this.distBetweenPoints(this.ship.x, this.ship.y, x, y) <
        this.ASTEROIDS_SIZE * 2 + this.ship.r
      );
      this.asteroids.push(
        new Asteroid(
          x,
          y,
          Math.ceil(this.ASTEROIDS_SIZE / 2),
          this.lvl,
          this.canv,
          this.ctx
        )
      );
    }
  }

  private destroyAsteroid(i: number) {
    const { x, y, r } = this.asteroids[i];

    // Split asteroid in two if large enough
    if (r === Math.ceil(this.ASTEROIDS_SIZE / 2)) {
      this.asteroids.push(
        new Asteroid(x, y, r / 2, this.lvl, this.canv, this.ctx),
        new Asteroid(x, y, r / 2, this.lvl, this.canv, this.ctx)
      );
      this.score += this.ASTEROIDS_PTS_LGE;
    } else if (r === Math.ceil(this.ASTEROIDS_SIZE / 4)) {
      this.asteroids.push(
        new Asteroid(x, y, r / 2, this.lvl, this.canv, this.ctx),
        new Asteroid(x, y, r / 2, this.lvl, this.canv, this.ctx)
      );
      this.score += this.ASTEROIDS_PTS_MED;
    } else {
      this.score += this.ASTEROIDS_PTS_SML;
    }

    // destroy asteroid
    this.asteroids.splice(i, 1);

    // new level if asteroids no mo
    if (this.asteroids.length === 0) {
      this.nextLevel();
    }
  }

  private nextLevel() {
    this.lvl++;
    this.createAsteroids();
  }
}

const game = new Game();
game.start();

const keyDown = (e: KeyboardEvent) => {
  if (game.ship.dead) {
    return;
  }
  switch (e.key) {
    case "Left":
    case "ArrowLeft":
      game.ship.rot = ((game.ship.TURN_SPEED / 100) * Math.PI) / game.FPS;
      break;
    case "Right":
    case "ArrowRight":
      game.ship.rot = -((game.ship.TURN_SPEED / 100) * Math.PI) / game.FPS;
      break;
    case "Up":
    case "ArrowUp":
      game.ship.thrusting = true;
      break;
    case " ":
      game.ship.shoot();
      break;
  }
};

const keyUp = (e: KeyboardEvent) => {
  if (game.ship.dead) {
    return;
  }
  switch (e.key) {
    case "Left":
    case "ArrowLeft":
      game.ship.rot = 0;
      break;
    case "Right":
    case "ArrowRight":
      game.ship.rot = 0;
      break;
    case "Up":
    case "ArrowUp":
      game.ship.thrusting = false;
      break;
    case " ":
      game.ship.canShoot = true;
      break;
  }
};

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
