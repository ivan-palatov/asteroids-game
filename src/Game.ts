import { Ship } from "./Ship";

class Game {
  public ship: Ship;
  private canv: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private interval: number;

  constructor(public readonly FPS: number = 30) {
    this.canv = document.getElementById("game") as HTMLCanvasElement;
    this.ctx = this.canv.getContext("2d")!;
    this.interval = 1000 / this.FPS;
    this.ship = new Ship(this.canv, this.ctx, this.FPS);
  }

  public start() {
    this.drawBackground();
    this.ship.update();
    this.ship.draw();
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
      // TODO: add asteroids collision check here
      // if (laser.explodeTime === 0 && this.distBetweenPoints(laser.x,laser.y,asteroid.x,asteroid.y) < asteroid.r)
    }
    setTimeout(this.start.bind(this), this.interval);
  }

  private drawBackground() {
    this.ctx.fillStyle = "#001";
    this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);
  }

  private distBetweenPoints(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
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
