import { GameConfig, BusinessCardInfo } from './types';
import { CardLayout } from './BlockManager';
export declare class GameEngine {
    private canvas;
    private config;
    private ball;
    private paddle;
    private blockManager;
    private particleSystem;
    private renderer;
    private gameRunning;
    private gamePaused;
    private gameOver;
    private gameCleared;
    private score;
    private animationFrameId;
    private lastTime;
    private frameCount;
    private lastFpsUpdate;
    private currentFps;
    private pointerX;
    private lastPointerMoveTime;
    constructor(canvasElement: HTMLCanvasElement, config?: Partial<GameConfig>);
    private setupEventListeners;
    /**
     * ポインター（マウス/タッチ）が最近動いたかチェック
     */
    private isPointerActive;
    /**
     * 名刺情報からゲームを初期化（レイアウト指定可能）
     */
    initializeWithBusinessCard(cardInfo: BusinessCardInfo, layout?: CardLayout): void;
    /**
     * ゲームを開始
     */
    start(): void;
    /**
     * ゲームを一時停止/再開
     */
    togglePause(): void;
    /**
     * ゲームをリスタート
     */
    restart(): void;
    /**
     * ゲーム状態をリセット
     */
    private resetGameState;
    /**
     * メインゲームループ
     */
    private gameLoop;
    /**
   * ゲーム状態を更新（周辺ブロック破壊機能付き）
   */
    private update;
    /**
     * 指定位置の周辺ブロックを破壊
     */
    private destroyNearbyBlocks;
    /**
     * ゲームを描画
     */
    private render;
    /**
     * ゲームを停止
     */
    stop(): void;
    /**
     * スコアを取得
     */
    getScore(): number;
    /**
     * ゲーム状態を取得
     */
    getGameState(): {
        running: boolean;
        paused: boolean;
        gameOver: boolean;
        cleared: boolean;
    };
}
//# sourceMappingURL=GameEngine.d.ts.map