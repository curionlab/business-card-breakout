import { Paddle } from './types';

export class PaddleController {
  private paddle: Paddle;
  private keysPressed: Map<string, boolean> = new Map();
  private lastKeyPressTime: number = 0;

  constructor(x: number, y: number, width: number, height: number, _speed: number = 8) {
    this.paddle = {
      x,
      y,
      width,
      height,
      vx: 0
    };

    this.setupKeyListeners();
  }

  getPaddle(): Paddle {
    return this.paddle;
  }

  getWidth(): number {
    return this.paddle.width;
  }

  private setupKeyListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      this.keysPressed.set(key, true);
      
      // ← 追加：矢印キーやA/Dキーが押されたら時刻を記録
      if (key === 'arrowleft' || key === 'arrowright' || key === 'a' || key === 'd') {
        this.lastKeyPressTime = performance.now();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed.set(e.key.toLowerCase(), false);
    });
  }


  /**
   * キーボードが最近使われたかチェック（500ms以内）
   */
  isKeyboardActive(): boolean {
    return performance.now() - this.lastKeyPressTime < 500;
  }  

  update(canvasWidth: number, paddleSpeed: number): void {
    this.paddle.vx = 0;

    if (this.keysPressed.get('arrowleft') || this.keysPressed.get('a')) {
      this.paddle.vx = -paddleSpeed;
      this.lastKeyPressTime = performance.now(); // ← 追加：移動中も更新
    }
    if (this.keysPressed.get('arrowright') || this.keysPressed.get('d')) {
      this.paddle.vx = paddleSpeed;
      this.lastKeyPressTime = performance.now(); // ← 追加：移動中も更新
    }

    this.paddle.x += this.paddle.vx;

    // 画面端での制限
    if (this.paddle.x < 0) {
      this.paddle.x = 0;
    }
    if (this.paddle.x + this.paddle.width > canvasWidth) {
      this.paddle.x = canvasWidth - this.paddle.width;
    }
  }

  // マウス/タッチ位置に基づいてパドルを移動
  updateFromPointer(pointerX: number, canvasWidth: number): void {
    const centerX = pointerX - this.paddle.width / 2;
    this.paddle.x = Math.max(0, Math.min(centerX, canvasWidth - this.paddle.width));
  }

  reset(x: number, y: number): void {
    this.paddle.x = x;
    this.paddle.y = y;
    this.paddle.vx = 0;
  }
}
