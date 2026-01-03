  /**
   * デフォルトの名刺情報
   */
  export const DEFAULT_BUSINESS_CARD = {
    name: 'Your Name',  
    nameEn: '',
    title: '',
    tagline: '',
    company: '',
    email: '',
    phone: '',
    sns: '',
    website: ''
  };

  
  /**
   * デフォルトのゲーム設定
   */
  export const DEFAULT_GAME_CONFIG = {
    paddleWidthRatio: 0.4,
    paddleSpeedRatio: 0.015,
    ballSpeedRatio: 0.009,
    ballRadiusRatio: 0.012,
    paddleHeight: 4,
    gravity: 0,
    friction: 1.0,
    blockRecoveryTime: 10000,
    effectDuration: 5000,
    destructionRadius: 30
  };
  
  /**
   * デフォルトのレイアウト
   */
  export const DEFAULT_LAYOUT = 'standard' as const;

  /**
   * 要素の色設定（視認性向上・色かぶり解消版）
   */
  export const ELEMENT_COLORS = {
    company: '#60A5FA',   // 青（会社名）
    tagline: '#C084FC',   // 紫（タグライン）
    name: '#F16584',      // ピンク（氏名）- より鮮やかに
    nameEn: '#34D399',    // 緑（英語名）- 青緑から緑に変更
    title: '#A78BFA',     // 薄紫（役職）
    email: '#4ECDC4',     // ターコイズ（メール）- 緑から移動
    phone: '#FB923C',     // オレンジ（電話）
    sns: '#EC4899',       // マゼンタ（SNS）- ピンクから差別化
    website: '#FBBF24'    // 黄色（ウェブサイト）
  };


  