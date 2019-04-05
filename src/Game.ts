import { Ship } from "./Ship";

class Game {
  public ship: Ship;
  private canv: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private interval: number;

  constructor(private readonly FPS: number = 30) {
    this.canv = document.getElementById("game") as HTMLCanvasElement;
    this.ctx = this.canv.getContext("2d")!;
    this.interval = 1000 / this.FPS;
    this.ship = new Ship(this.canv, this.ctx, this.FPS);
  }

  public start() {
    this.drawBackground();
    this.ship.draw();
    setTimeout(this.start.bind(this), this.interval);
  }

  public rotateShip(d: -1 | 1) {
    this.ship.rot = (d * ((this.ship.TURN_SPEED / 100) * Math.PI)) / this.FPS;
    this.ship.turn();
  }

  public stopRotation() {
    this.ship.rot = 0;
  }

  private drawBackground() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);
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
      game.rotateShip(1);
      break;

    case "Right":
    case "ArrowRight":
      game.rotateShip(-1);
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
  }
};

document.addEventListener("keydown", keyDown);
