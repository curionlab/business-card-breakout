import { Ball } from './types';

export class BallPhysics {
  private ball: Ball;
  private baseSpeed: number; // 基本速度を保持

  constructor(x: number, y: number, radius: number, baseSpeed: number = 6) {
    this.ball = {
      x,
      y,
      vx: 0,
      vy: 0,
      radius
    };
    this.baseSpeed = baseSpeed;
  }

  getBall(): Ball {
    return this.ball;
  }

  update(): void {
    // 速度を適用（重力なし、摩擦なし）
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
    
    // 速度が低下した場合、基本速度を維持
    const currentSpeed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
    if (currentSpeed < this.baseSpeed && currentSpeed > 0) {
      const ratio = this.baseSpeed / currentSpeed;
      this.ball.vx *= ratio;
      this.ball.vy *= ratio;
    }
  }

  setVelocity(vx: number, vy: number): void {
    this.ball.vx = vx;
    this.ball.vy = vy;
  }

  // 壁との衝突判定と反射
  checkWallCollision(width: number, _height: number): void {
    // 左右の壁
    if (this.ball.x - this.ball.radius < 0) {
      this.ball.x = this.ball.radius;
      this.ball.vx = Math.abs(this.ball.vx);
    }
    if (this.ball.x + this.ball.radius > width) {
      this.ball.x = width - this.ball.radius;
      this.ball.vx = -Math.abs(this.ball.vx);
    }
    // 上の壁
    if (this.ball.y - this.ball.radius < 0) {
      this.ball.y = this.ball.radius;
      this.ball.vy = Math.abs(this.ball.vy);
    }
  }

  reset(x: number, y: number): void {
    this.ball.x = x;
    this.ball.y = y;
    this.ball.vx = 0;
    this.ball.vy = 0;
  }

  // パドルとの衝突判定
  checkPaddleCollision(paddleX: number, paddleY: number, paddleWidth: number, paddleHeight: number): boolean {
    if (this.ball.y + this.ball.radius >= paddleY &&
        this.ball.y - this.ball.radius <= paddleY + paddleHeight &&
        this.ball.x + this.ball.radius >= paddleX &&
        this.ball.x - this.ball.radius <= paddleX + paddleWidth) {
      
      // パドルのどの位置に当たったかで反射角度を変える
      const hitPos = (this.ball.x - paddleX) / paddleWidth; // 0 ~ 1
      const angle = (hitPos - 0.5) * Math.PI * 0.7; // -63° ~ 63°
      
      this.ball.vx = Math.sin(angle) * this.baseSpeed;
      this.ball.vy = -Math.abs(Math.cos(angle) * this.baseSpeed);
      this.ball.y = paddleY - this.ball.radius;
      return true;
    }
    return false;
  }

  // ブロックとの衝突判定
  checkBlockCollision(blockX: number, blockY: number, blockWidth: number, blockHeight: number): { collided: boolean; normal: { x: number; y: number } } {
    const closestX = Math.max(blockX, Math.min(this.ball.x, blockX + blockWidth));
    const closestY = Math.max(blockY, Math.min(this.ball.y, blockY + blockHeight));
    const distanceX = this.ball.x - closestX;
    const distanceY = this.ball.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    if (distanceSquared < this.ball.radius * this.ball.radius) {
      // 衝突法線を計算
      const distance = Math.sqrt(distanceSquared);
      const normalX = distance > 0 ? distanceX / distance : 0;
      const normalY = distance > 0 ? distanceY / distance : 0;

      // ボールを押し出す
      const overlap = this.ball.radius - distance;
      this.ball.x += normalX * overlap;
      this.ball.y += normalY * overlap;

      // 反射（速度を維持）
      const dotProduct = this.ball.vx * normalX + this.ball.vy * normalY;
      this.ball.vx = this.ball.vx - 2 * dotProduct * normalX;
      this.ball.vy = this.ball.vy - 2 * dotProduct * normalY;

      return { collided: true, normal: { x: normalX, y: normalY } };
    }

    return { collided: false, normal: { x: 0, y: 0 } };
  }
}
