  /**
   * デフォルトの名刺情報
   */
  export const DEFAULT_BUSINESS_CARD = {
    name: '山田　太郎',           // 日本語
    // name: 'Müller Schmidt',   // ドイツ語
    // name: 'Владимир Петров',  // ロシア語（キリル文字）
    // name: '王小明',           // 中国語
    // name: '김민수',           // 韓国語
    // name: 'สมชาย วงศ์สุวรรณ', // タイ語
    // name: 'أحمد محمد',        // アラビア語  
    nameEn: 'Taro Yamada',
    title: 'Senior Software Engineer',
    tagline: 'Building the future, one line at a time.',
    company: 'Tech Solutions Inc.',
    email: 'taro.yamada@example.com',
    phone: '+81-90-0000-0000',
    sns: 'https://example.com/taroy',
    website: 'https://www.example.com/'
  };

  
  /**
   * デフォルトのゲーム設定
   */
  export const DEFAULT_GAME_CONFIG = {
    ballSpeed: 10,
    ballRadius: 12,
    paddleSpeed: 12,
    paddleWidthRatio: 0.4,
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


  