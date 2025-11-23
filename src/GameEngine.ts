import { GameConfig, BusinessCardInfo } from './types';
import { BallPhysics } from './Ball';
import { PaddleController } from './Paddle';
import { BlockManager, CardLayout } from './BlockManager';
import { ParticleSystem } from './ParticleSystem';
import { Renderer } from './Renderer';
import { ELEMENT_COLORS } from './config';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private config: GameConfig;
  private ball: BallPhysics;
  private paddle: PaddleController;
  private blockManager: BlockManager;
  private particleSystem: ParticleSystem;
  private renderer: Renderer;

  private gameRunning: boolean = false;
  private gamePaused: boolean = false;
  private gameOver: boolean = false;
  private gameCleared: boolean = false;
  private score: number = 0;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private frameCount: number = 0; // フレームカウンター
  private lastFpsUpdate: number = 0; // FPS更新時刻
  private currentFps: number = 0; // 現在のFPS

  private pointerX: number = 0;
  private lastPointerMoveTime: number = 0;

  constructor(canvasElement: HTMLCanvasElement, config?: Partial<GameConfig>) {
    this.canvas = canvasElement;

    
    // ← 論理ピクセルサイズを取得
    const logicalWidth = config?.width || canvasElement.width;
    const logicalHeight = config?.height || canvasElement.height;

    // ← ゲーム性調整パラメータ（カスタマイズ可能）
    const paddleWidthRatio = config?.paddleWidthRatio ?? 0.4;   // 40%
    const paddleSpeedRatio = config?.paddleSpeedRatio ?? 0.015;  // 1.3%
    const ballSpeedRatio = config?.ballSpeedRatio ?? 0.009;     // 0.66%
    const ballRadiusRatio = config?.ballRadiusRatio ?? 0.012;    // 0.9%
    
    const calculatedPaddleWidth = Math.floor(logicalWidth * paddleWidthRatio);
    const calculatedPaddleSpeed = Math.max(logicalWidth * paddleSpeedRatio, 5);  // 最低5
    const calculatedBallSpeed = Math.max(logicalWidth * ballSpeedRatio, 3);      // 最低3
    const calculatedBallRadius = Math.max(logicalWidth * ballRadiusRatio, 4);    // 最低4

    // デフォルト設定
    //configが渡されない場合のフォールバック値として機能します。index.htmlで明示的に値を渡している場合、そちらが優先されます。
    this.config = {
      width: logicalWidth,
      height: logicalHeight,
      paddleSpeed: calculatedPaddleSpeed,
      ballSpeed: calculatedBallSpeed,
      ballRadius: calculatedBallRadius,
      paddleHeight: 4,
      paddleWidthRatio: paddleWidthRatio,
      paddleWidth: calculatedPaddleWidth,  // ← 相対値（自動調整）,
      gravity: 0,
      friction: 1.0,
      blockRecoveryTime: 10000,
      effectDuration: 5000,
      destructionRadius: 30,
      dpr: 1,
      ...config
    };

    const dpr = this.config.dpr || 1;
    console.log('GameEngine.tsのdpr:', dpr)

    // コンポーネント初期化
    this.ball = new BallPhysics(
      this.config.width / 2,
      this.config.height / 2,
      this.config.ballRadius,
      this.config.ballSpeed // gravityではなくbaseSpeedを渡す
    );

    // パドル初期化（
    this.paddle = new PaddleController(
      this.config.width / 2 - this.config.paddleWidth / 2,
      this.config.height - this.config.paddleHeight - 1,
      this.config.paddleWidth,
      this.config.paddleHeight,
      this.config.paddleSpeed
    );

    this.blockManager = new BlockManager(
      this.config.blockRecoveryTime, 
      this.config.effectDuration,
      dpr,
      ELEMENT_COLORS
    );
    this.particleSystem = new ParticleSystem();
    this.renderer = new Renderer(canvasElement, dpr);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // マウス移動
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointerX = e.clientX - rect.left;
      this.lastPointerMoveTime = performance.now();  // ← 追加：マウス移動時刻を記録
    });

    // タッチ移動
    this.canvas.addEventListener('touchmove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointerX = e.touches[0].clientX - rect.left;
      this.lastPointerMoveTime = performance.now();  // ← 追加：タッチ移動時刻を記録
    });

    // ← 追加：クリック/タップでゲーム開始 or リスタート
    this.canvas.addEventListener('click', () => {
      if (!this.gameRunning && !this.gameOver && !this.gameCleared) {
        this.start();
      } else if (this.gameOver || this.gameCleared) {
        // ゲームオーバーまたはクリア時にクリックでリスタート
        this.restart();
      }
    });
  
    // ← 追加：タッチでも同様に
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!this.gameRunning && !this.gameOver && !this.gameCleared) {
        this.start();
      } else if (this.gameOver || this.gameCleared) {
        this.restart();
      }
    });
      
    // キー入力（ゲーム制御のみ）
    window.addEventListener('keydown', (e) => {
      if (e.key === 'r' || e.key === 'R') {
        if (this.gameOver || this.gameCleared) {
          this.restart();
        }
      }
      if (e.key === ' ') {
        if (!this.gameRunning && !this.gameOver && !this.gameCleared) {
          this.start();
        } else if (this.gameRunning) {
          this.togglePause();
        }
      }
    });

    // クリック/タップ開始
    this.canvas.addEventListener('click', () => {
      if (!this.gameRunning && !this.gameOver && !this.gameCleared) {
        this.start();
      }
    });
  }

  /**
   * ポインター（マウス/タッチ）が最近動いたかチェック
   */
  private isPointerActive(): boolean {
    return performance.now() - this.lastPointerMoveTime < 500;
  }

  /**
   * 名刺情報からゲームを初期化（レイアウト指定可能）
   */
  initializeWithBusinessCard(cardInfo: BusinessCardInfo, layout: CardLayout = 'standard'): void {

    console.log('initializeWithBusinessCard called:', {
      layout: layout,
      stackTrace: new Error().stack  // ← 呼び出し元を確認
    });
    this.blockManager.createBlocksFromBusinessCard(
      cardInfo,
      this.config.width,
      this.config.height,
      1, //PixelSize
      layout
    );
    this.resetGameState();
  }


  /**
   * ゲームを開始
   */
  start(): void {
    if (this.gameRunning) return;

    this.gameRunning = true;
    this.gamePaused = false;

    // ボールに初速を与える
    const angle = (Math.random() - 0.5) * Math.PI / 2;
    this.ball.setVelocity(
      Math.cos(angle) * this.config.ballSpeed,
      -Math.abs(Math.sin(angle) * this.config.ballSpeed)
    );

    // FPS計測の初期化
    this.lastTime = performance.now();
    this.lastFpsUpdate = this.lastTime;
    this.frameCount = 0;
    
    this.gameLoop();
  }

  /**
   * ゲームを一時停止/再開
   */
  togglePause(): void {
    this.gamePaused = !this.gamePaused;
  }

  /**
   * ゲームをリスタート
   */
  restart(): void {
    this.resetGameState();
    this.blockManager.reset();
    this.score = 0;
    this.gameRunning = false;
    this.gamePaused = false;
    this.gameOver = false;
    this.gameCleared = false;
    this.particleSystem.clear();
    this.render();
  }

  /**
   * ゲーム状態をリセット
   */
  private resetGameState(): void {
    const ballX = this.config.width - 50;  // 画面右端から50px内側
    const ballY = 50;                      // 画面上端から50px下
    this.ball.reset(ballX, ballY);

    this.paddle.reset(
      this.config.width / 2 - this.config.paddleWidth / 2,
      this.config.height - this.config.paddleHeight - 1
    );
  }

  /**
   * メインゲームループ
   */
  private gameLoop = (): void => {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    const updateStart = performance.now();
    if (!this.gamePaused) {
      this.update(currentTime);
    }
    const updateTime = performance.now() - updateStart;
  
    const renderStart = performance.now();
    this.render();
    const renderTime = performance.now() - renderStart;
  
    // FPS計算
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.currentFps = Math.round(this.frameCount * 1000 / (currentTime - this.lastFpsUpdate));
      console.log(`FPS: ${this.currentFps} | Update: ${updateTime.toFixed(2)}ms | Render: ${renderTime.toFixed(2)}ms | Frame Time: ${deltaTime.toFixed(2)}ms `);
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }
    
    if (!this.gamePaused) {
      this.update(currentTime);
    }

    this.render();

    if (this.gameRunning && !this.gameOver && !this.gameCleared) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  };

  /**
 * ゲーム状態を更新（周辺ブロック破壊機能付き）
 */
  private update(currentTime: number): void {
    // パドル移動
    this.paddle.update(this.config.width, this.config.paddleSpeed);
    
    // マウス/タッチが最近動いた場合のみポインター追従
    if (this.isPointerActive() && !this.paddle.isKeyboardActive()) {
      this.paddle.updateFromPointer(this.pointerX, this.config.width);
    }

    // ボール更新
    this.ball.update();
  
    // 壁との衝突判定
    this.ball.checkWallCollision(this.config.width, this.config.height);
    
    // パドルとの衝突判定
    this.ball.checkPaddleCollision(
      this.paddle.getPaddle().x,
      this.paddle.getPaddle().y,
      this.paddle.getPaddle().width,
      this.paddle.getPaddle().height
    );
    
    // ブロック復活チェック
    this.blockManager.updateBlockRecovery(currentTime);
    
    // ブロックとの衝突判定（メインの当たり判定）
    const blockIndex = this.blockManager.checkCollision(
      this.ball.getBall().x,
      this.ball.getBall().y,
      this.ball.getBall().radius
    );
    
    if (blockIndex !== -1) {
      const block = this.blockManager.getBlocks()[blockIndex];
      
      if (!block.isDestroyed) {
        // メインブロックを破壊
        this.blockManager.destroyBlock(blockIndex, currentTime);
        this.particleSystem.createBlockDestructionEffect(
          block.x + block.width / 2,
          block.y + block.height / 2,
          block.color,
          15
        );
        this.score += 10;
        
        // 周辺ブロックも破壊（拡張範囲）
        this.destroyNearbyBlocks(
          this.ball.getBall().x,
          this.ball.getBall().y,
          this.ball.getBall().radius * 0.5, // ボール半径の2.5倍の範囲
          currentTime
        );
        
        // ボール反射（元のロジック）
        const collision = this.ball.checkBlockCollision(
          block.x,
          block.y,
          block.width,
          block.height
        );
        
        if (collision.collided) {
          this.particleSystem.createImpactEffect(
            this.ball.getBall().x,
            this.ball.getBall().y,
            block.color,
            8
          );
        }
      }
    }
    
    // パーティクル更新
    this.particleSystem.update();
    
    // ゲームオーバー判定（ボールが下に落ちた）
    if (this.ball.getBall().y > this.config.height + 50) {
      this.gameOver = true;
      this.gameRunning = false;
    }
    
    // ゲームクリア判定
    if (this.blockManager.allBlocksDestroyed()) {
      this.gameCleared = true;
      this.gameRunning = false;
    }
  }

  /**
   * 指定位置の周辺ブロックを破壊
   */
  private destroyNearbyBlocks(
    centerX: number,
    centerY: number,
    radius: number,
    currentTime: number
  ): void {
    const blocks = this.blockManager.getBlocks();
    
    blocks.forEach((block, index) => {
      if (block.isDestroyed) return;
      
      // ブロックの中心座標
      const blockCenterX = block.x + block.width / 2;
      const blockCenterY = block.y + block.height / 2;
      
      // 中心からの距離を計算
      const dx = blockCenterX - centerX;
      const dy = blockCenterY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 範囲内のブロックを破壊
      if (distance < radius*2) {
        this.blockManager.destroyBlock(index, currentTime);
        
      // パーティクル数を減らす（パフォーマンス向上）
      if (Math.random() < 0.3) {  // 30%の確率でエフェクト
        this.particleSystem.createBlockDestructionEffect(
          blockCenterX,
          blockCenterY,
          block.color,
          3
        );
      }
        // スコア加算（周辺ブロックは少なめ）
        this.score += 5;
      }
    });
  }
    
  /**
   * ゲームを描画
   */
  private render(): void {
    this.renderer.clear(this.config.width, this.config.height);
    this.renderer.drawBackground(this.config.width, this.config.height);
    const currentTime = performance.now();
    
    // BlockManagerインスタンスも渡す
    this.renderer.drawBlocks(
      this.blockManager.getBlocks(),
      currentTime,
      this.blockManager
    );
    
    this.renderer.drawBall(this.ball.getBall());
    this.renderer.drawPaddle(this.paddle.getPaddle());
    this.renderer.drawParticles(this.particleSystem.getParticles());
    
    //キャンパス内のスコア表示
    this.renderer.drawScore(this.score, this.config.width, this.config.height);
    
    if (this.gameOver) {
      this.renderer.drawGameOver(this.config.width, this.config.height, this.score);
    } else if (this.gameCleared) {
      this.renderer.drawGameClear(this.config.width, this.config.height, this.score);
    }
  }
  

  /**
   * ゲームを停止
   */
  stop(): void {
    this.gameRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * スコアを取得
   */
  getScore(): number {
    return this.score;
  }

  /**
   * ゲーム状態を取得
   */
  getGameState(): { running: boolean; paused: boolean; gameOver: boolean; cleared: boolean } {
    return {
      running: this.gameRunning,
      paused: this.gamePaused,
      gameOver: this.gameOver,
      cleared: this.gameCleared
    };
  }
}