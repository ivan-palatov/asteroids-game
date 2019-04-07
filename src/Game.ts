import { Asteroid } from './Asteroid';
import { Ship } from './Ship';

class Game {
  public ship: Ship;

  public lvl: number = -1;
  public score: number = 0;
  public lives: number = 3;
  public record: number;

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
  private readonly TEXT_FADE_TIME: number = 2.5;
  private readonly TEXT_SIZE: number = 40;
  private text: string = '';
  private textOpacity: number = 0;

  private readonly COS: number = Math.cos(Math.PI / 3);
  private readonly SIN: number = Math.sin(Math.PI / 3);

  constructor(public readonly FPS: number = 30) {
    this.canv = document.getElementById('game') as HTMLCanvasElement;
    this.ctx = this.canv.getContext('2d')!;
    this.interval = 1000 / this.FPS;
    this.ship = new Ship(this.canv, this.ctx, this.FPS);
    this.record = parseInt(localStorage.getItem('record') || '0', 10);
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
      // Reduse lives at the last frame
      if (this.ship.explodeTime === 1) {
        this.lives--;
      }
      // Draw end game text
      if (this.lives === 0) {
        this.text = 'Game Over';
        this.textOpacity = 1.0;
      }
      // if ship is dead and still exploding, draw explosion and decrease explodeTime
      this.ship.explodeTime--;
      this.ship.drawExplosion();
    } else if (this.lives > 0) {
      // if ship is dead and is no longer exploding, spawn a new ship
      this.ship = new Ship(this.canv, this.ctx, this.FPS);
    } else {
      // if no lives left, save record(if needed) and start a new game
      if (this.score > this.record) {
        localStorage.setItem('record', `${this.score}`);
      }
      this.restart();
      this.text = `Level ${this.lvl}`;
      this.textOpacity = 1.0;
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

    // Draw text
    this.drawGameText();

    // Draw score
    this.drawScore(this.score, 'right');
    this.drawScore(this.record, 'center');

    // Draw lives
    this.drawLives();

    // recursion
    setTimeout(this.drawAndUpdate.bind(this), this.interval);
  }

  private restart() {
    this.lvl = 0;
    this.score = 0;
    this.record = parseInt(localStorage.getItem('record') || '0', 10);
    this.lives = 3;
    this.ship = new Ship(this.canv, this.ctx, this.FPS);
    this.createAsteroids();
  }

  private drawGameText() {
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = `rgba(255,255,255,${this.textOpacity})`;
    this.ctx.font = `small-caps ${this.TEXT_SIZE}px dejavu sans mono`;
    this.ctx.fillText(this.text, this.canv.width / 2, this.canv.height * 0.25);
    this.textOpacity -= 1 / this.TEXT_FADE_TIME / this.FPS;
  }

  private drawScore(score: number, align: 'center' | 'right') {
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = `#fff`;
    this.ctx.font = `${this.TEXT_SIZE}px dejavu sans mono`;
    this.ctx.fillText(
      `${score}`,
      align === 'right' ? this.canv.width - 15 : this.canv.width / 2,
      35
    );
    this.textOpacity -= 1 / this.TEXT_FADE_TIME / this.FPS;
  }

  private drawLives() {
    for (let i = 0; i < this.lives; i++) {
      this.ctx.strokeStyle =
        this.ship.explodeTime > 0 && i === this.lives - 1 ? '#f00' : '#fff';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(30 + i * 36 + 15 * this.COS, 35 - 15 * this.SIN);
      this.ctx.lineTo(
        30 + i * 36 - 15 * (this.SIN + this.COS),
        35 + 15 * (this.SIN - this.COS)
      );
      this.ctx.lineTo(
        30 + i * 36 + 15 * (this.SIN - this.COS),
        35 + 15 * (this.SIN + this.COS)
      );
      this.ctx.closePath();
      this.ctx.stroke();
    }
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
    this.ctx.fillStyle = '#001';
    this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);
  }

  private distBetweenPoints(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  private createAsteroids() {
    let x: number;
    let y: number;
    this.asteroids = [];
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
    this.text = `Level ${this.lvl}`;
    this.textOpacity = 1.0;
  }
}

const game = new Game();
game.start();

const keyDown = (e: KeyboardEvent) => {
  if (game.ship.dead) {
    return;
  }
  switch (e.key) {
    case 'Left':
    case 'ArrowLeft':
      game.ship.rot = ((game.ship.TURN_SPEED / 100) * Math.PI) / game.FPS;
      break;
    case 'Right':
    case 'ArrowRight':
      game.ship.rot = -((game.ship.TURN_SPEED / 100) * Math.PI) / game.FPS;
      break;
    case 'Up':
    case 'ArrowUp':
      game.ship.thrusting = true;
      break;
    case ' ':
      game.ship.shoot();
      break;
  }
};

const keyUp = (e: KeyboardEvent) => {
  if (game.ship.dead) {
    return;
  }
  switch (e.key) {
    case 'Left':
    case 'ArrowLeft':
      game.ship.rot = 0;
      break;
    case 'Right':
    case 'ArrowRight':
      game.ship.rot = 0;
      break;
    case 'Up':
    case 'ArrowUp':
      game.ship.thrusting = false;
      break;
    case ' ':
      game.ship.canShoot = true;
      break;
  }
};

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
