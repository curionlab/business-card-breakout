import { GameEngine } from './GameEngine';
import { BusinessCardInfo, GameConfig } from './types';
import { CardLayout } from './BlockManager';
export { GameEngine };
export type { BusinessCardInfo, GameConfig, Block, Ball, Paddle, Particle } from './types';
export { BallPhysics } from './Ball';
export { PaddleController } from './Paddle';
export { BlockManager } from './BlockManager';
export { ParticleSystem } from './ParticleSystem';
export { Renderer } from './Renderer';
export { DEFAULT_GAME_CONFIG, DEFAULT_BUSINESS_CARD, DEFAULT_LAYOUT } from './config';
/**
 * ライブラリの初期化関数（CDN配信対応、完全自動設定）
 */
export declare function initializeGame(containerId: string, businessCard?: Partial<BusinessCardInfo>, // ← 変更: 第2引数
gameConfig?: Partial<GameConfig>, // ← 変更: 第3引数に移動
layout?: CardLayout, autoStart?: boolean): GameEngine;
/**
 * 高度な初期化関数
 */
export declare function initializeGameWithCanvas(canvas: HTMLCanvasElement, businessCardInfo: BusinessCardInfo, config?: Partial<GameConfig>): GameEngine;
//# sourceMappingURL=index.d.ts.map