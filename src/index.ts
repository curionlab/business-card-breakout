import { GameEngine } from './GameEngine';
import { BusinessCardInfo, GameConfig } from './types';

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
export function initializeGame(
  containerId: string,
  businessCard?: Partial<BusinessCardInfo>,  // ← 変更: 第2引数
  gameConfig?: Partial<GameConfig>,           // ← 変更: 第3引数に移動
  layout: 'standard' | 'professional' | 'minimal' = 'standard',
  autoStart: boolean = false  // ← 追加: デフォルトで自動開始しない
): GameEngine {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container with ID "${containerId}" not found`);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ステップ1: コンテナサイズを取得（CSS論理ピクセル）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const businessCardRatio = 91 / 55;
  
  // 1. container の clientWidth を取得
  let containerWidth = container.clientWidth;
  
  // 2. 0 または異常に大きい場合はデフォルト値を使用
  if (containerWidth === 0 || containerWidth > 2000) {
    containerWidth = 600; // ← より現実的なデフォルト
    console.warn(`Container "${containerId}" has invalid width. Using default: 600px`);
  }
  
  // 3. CSS 論理ピクセルサイズを計算
  let cssWidth = containerWidth;
  let cssHeight = containerWidth / businessCardRatio;
  
  // 4. container に明示的にサイズを設定（ユーザーが指定していない場合）
  if (!container.style.height || container.style.height === '0px') {
    container.style.height = `${cssHeight}px`;
  }
  
  // 8の倍数に丸める（レンダリング最適化）
  cssWidth = Math.floor(cssWidth / 8) * 8;
  cssHeight = Math.floor(cssHeight / 8) * 8;
  
  // 最小サイズを保証（スマホで小さくなりすぎない）
  const minWidth = 320;
  if (cssWidth < minWidth) {
    cssWidth = minWidth;
    cssHeight = Math.floor((cssWidth / businessCardRatio) / 8) * 8;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ステップ2: DPRを取得して物理ピクセルを計算
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const dpr = window.devicePixelRatio || 1;
  
  // Canvas内部解像度（物理ピクセル）= CSS論理ピクセル × DPR
  const physicalWidth = Math.floor((cssWidth * dpr) / 8) * 8;
  const physicalHeight = Math.floor((cssHeight * dpr) / 8) * 8;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ステップ3: Canvas要素を作成・設定
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const canvas = document.createElement('canvas');
  
  // Canvas内部解像度を物理ピクセルで設定（高精細）
  canvas.width = physicalWidth;
  canvas.height = physicalHeight;
  
  // CSS表示サイズを論理ピクセルで設定（レスポンシブ）
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.style.display = 'block';
  canvas.style.backgroundColor = '#1a1a2e';
  canvas.style.borderRadius = '8px';
  canvas.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
  canvas.style.margin = '0 auto';
  
  container.appendChild(canvas);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ステップ4: GameEngineに論理ピクセルサイズを渡す
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GameEngineには論理ピクセルサイズとDPRを渡す
  const mergedConfig = {
    ...gameConfig,
    width: cssWidth,        // ← 論理ピクセル（ゲームロジック用）
    height: cssHeight,      // ← 論理ピクセル（ゲームロジック用）
    dpr: dpr,               // ← レンダラーで使用
  };
  console.log('index.tsのdpr:', dpr)

  const gameEngine = new GameEngine(canvas, mergedConfig);
  
  // ← 追加: 名刺情報で初期化
  if (businessCard) {
    const cardInfo: BusinessCardInfo = {
      name: businessCard.name,
      nameEn: businessCard.nameEn,
      title: businessCard.title,
      company: businessCard.company,
      tagline: businessCard.tagline,
      email: businessCard.email,
      phone: businessCard.phone,
      sns: businessCard.sns,
      website: businessCard.website
    };
    gameEngine.initializeWithBusinessCard(cardInfo, layout);
    if (autoStart) {  // ← 変更: 条件付きで開始
      gameEngine.start();
    }
  }

  return gameEngine;
}

/**
 * 高度な初期化関数
 */
export function initializeGameWithCanvas(
  canvas: HTMLCanvasElement,
  businessCardInfo: BusinessCardInfo,
  config?: Partial<GameConfig>
): GameEngine {
  const gameEngine = new GameEngine(canvas, config);
  gameEngine.initializeWithBusinessCard(businessCardInfo);
  return gameEngine;
}
