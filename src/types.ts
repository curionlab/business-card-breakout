/**
 * ゲーム設定オプション
 */
export interface GameConfig {
  width: number;
  height: number;
  paddleSpeed: number;
  ballSpeed: number;
  ballRadius: number;
  paddleHeight: number;
  paddleWidthRatio?: number;   // パドル幅の比率（デフォルト: 0.4）
  paddleSpeedRatio?: number;   // パドル速度の比率（デフォルト: 0.015）
  ballSpeedRatio?: number;     // ボール速度の比率（デフォルト: 0.009）
  ballRadiusRatio?: number;    // ボール半径の比率（デフォルト: 0.012）
  paddleWidth: number;
  gravity: number;
  friction: number;
  blockRecoveryTime: number; // ミリ秒
  effectDuration: number; // ミリ秒
  destructionRadius: number; 
  dpr: number;
}

/**
 * ブロック情報
 */
export interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  isDestroyed: boolean;
  destroyedAt: number; // タイムスタンプ
  color: string;
  fontSize: number;
  fontFamily: string;
}

/**
 * ボール情報
 */
export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

/**
 * パドル情報
 */
export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
}

/**
 * 名刺情報
 */
export interface BusinessCardInfo {
  name: string | undefined;
  nameEn?: string | undefined;        // 英語名（オプション）
  title: string | undefined;
  tagline?: string | undefined;       // キャッチフレーズ（オプション）
  company: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  sns?: string | undefined;
  website: string | undefined;
}


/**
 * エフェクト情報
 */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}
