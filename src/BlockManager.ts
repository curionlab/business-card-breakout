import { Block, BusinessCardInfo } from './types';

export type CardLayout = 'standard' | 'professional' | 'minimal';

export class BlockManager {
  private blocks: Block[] = [];
  private blockRecoveryTime: number;
  private blockFadeInTime: number;
  private dpr: number = 1;
  private elementColors: { [key: string]: string };

  constructor(
    blockRecoveryTime: number = 10000, 
    blockFadeInTime: number = 5000, 
    dpr: number = 1,
    elementColors: { [key: string]: string } = {} 
  ) {
    this.blockRecoveryTime = blockRecoveryTime;
    this.blockFadeInTime = blockFadeInTime;
    this.dpr = dpr;
    this.elementColors = elementColors;
  }

  getBlocks(): Block[] {
    return this.blocks;
  }

  /**
   * フォントサイズを計算(論理ピクセル)
   */
  private calculateFontSize(baseRatio: number, canvasHeight: number, minSize: number = 16): number {
    const size = canvasHeight * baseRatio;
    return Math.max(Math.round(size), minSize);
  }

  /**
   * キャンバスサイズを計算(論理ピクセル)
   */
  private calculateCanvasSize(ratio: number, dimension: number): number {
    const size = dimension * ratio;
    return Math.round(size);
  }


  /**
   * テキストを描画し、横幅に収める（高さは維持）
   */
  private drawTextFitToWidth(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number,
    fontFamily: string,
    align: 'left' | 'center' | 'right' = 'left'
  ): { actualHeight: number; metrics: TextMetrics } {  // ← 戻り値を変更
    ctx.font = `${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    
    if (textWidth <= maxWidth) {
      ctx.textAlign = align;
      ctx.fillText(text, x, y);
      
      // ← 実際の高さを計算
      const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      return { actualHeight, metrics };
    }
    
    // はみ出る場合は横方向だけスケール
    const scaleX = maxWidth / textWidth;
    ctx.save();
    const drawX = x / scaleX;
    ctx.scale(scaleX, 1);
    ctx.textAlign = align;
    ctx.fillText(text, drawX, y);
    ctx.restore();
    
    // ← 実際の高さを計算（スケールしても高さは変わらない）
    const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    return { actualHeight, metrics };
  }
  


  /**
   * テキストに応じたフォントファミリーを取得
   */
  private getFontFamily(text: string): string {
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
    const hasChinese = /[\u4E00-\u9FFF]/.test(text) && !hasJapanese;
    const hasKorean = /[\uAC00-\uD7AF\u1100-\u11FF]/.test(text);
    const hasThai = /[\u0E00-\u0E7F]/.test(text);
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    const hasCyrillic = /[\u0400-\u04FF]/.test(text);
    
    if (hasJapanese) return '"DotGothic16", monospace';
    if (hasChinese) return '"ZCOOL QingKe HuangYou", "Noto Sans SC", sans-serif';
    if (hasKorean) return '"Noto Sans KR", sans-serif';
    if (hasThai) return '"Noto Sans Thai", sans-serif';
    if (hasArabic) return '"Noto Sans Arabic", sans-serif';
    if (hasCyrillic) return '"Silkscreen", "Press Start 2P", monospace';
    
    return '"Bitcount Prop Single", "DotGothic16", monospace';
  }

  /**
   * 標準レイアウト（横幅フィット対応）
   */
  private createStandardLayout(
    cardInfo: BusinessCardInfo,
    canvasWidth: number,
    canvasHeight: number,
    pixelSize: number
  ): void {
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // 論理サイズで計算
    const padding = this.calculateCanvasSize(0.08, canvasHeight);
    const logicalTempWidth = this.calculateCanvasSize(0.85, canvasWidth);
    const logicalTempHeight = this.calculateCanvasSize(0.81, canvasHeight);

    console.log('createStandardLayout:', {
      canvasWidth,
      canvasHeight,
      padding,
      logicalTempWidth,
      logicalTempHeight,
      dpr: this.dpr
    });

    // Canvas実体は物理解像度
    tempCanvas.width = Math.round(logicalTempWidth * this.dpr);
    tempCanvas.height = Math.round(logicalTempHeight * this.dpr);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

    // DPRスケール適用（以降は論理座標）
    ctx.scale(this.dpr, this.dpr);
    ctx.fillStyle = '#FFFFFF';

    let currentY = padding;
    const elementPositions: Array<{ start: number; end: number; type: string }> = [];

    // 行送り用パラメータ
    const baseLineGapName     = 1.5;
    const baseLineGapTitle    = 1.6;
    const baseLineGapCompany  = 1.8;
    const baseLineGapContact  = 1.5;
    const extraLineSpace      = 1;   // 追加のピクセル行間

    // 名前
    if (cardInfo.name) {
      const fontSize = this.calculateFontSize(0.095, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.name);
      const maxWidth = logicalTempWidth - padding * 2;
      ctx.textBaseline = 'top';

      const { actualHeight } = this.drawTextFitToWidth(
        ctx,
        cardInfo.name,
        padding,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        'left'
      );

      const step = actualHeight * baseLineGapName;
      elementPositions.push({ start: startY, end: startY + step, type: 'name' });
      currentY += step + extraLineSpace;
    }

    // 肩書き
    if (cardInfo.title) {
      const fontSize = this.calculateFontSize(0.055, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.title);
      const maxWidth = logicalTempWidth - padding * 2;
      ctx.textBaseline = 'top';

      const { actualHeight } = this.drawTextFitToWidth(
        ctx,
        cardInfo.title,
        padding,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        'left'
      );

      const step = actualHeight * baseLineGapTitle;
      elementPositions.push({ start: startY, end: startY + step, type: 'title' });
      currentY += step + extraLineSpace;
    }

    // 会社
    if (cardInfo.company) {
      const fontSize = this.calculateFontSize(0.065, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.company);
      const maxWidth = logicalTempWidth - padding * 2;
      ctx.textBaseline = 'top';

      const { actualHeight } = this.drawTextFitToWidth(
        ctx,
        cardInfo.company,
        padding,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        'left'
      );

      const step = actualHeight * baseLineGapCompany;
      elementPositions.push({ start: startY, end: startY + step, type: 'company' });
      currentY += step + extraLineSpace;
    }

    // 連絡先
    const contactFontSize = this.calculateFontSize(0.040, canvasHeight, 12);
    const contactMaxWidth = logicalTempWidth - padding * 2;
    ctx.textBaseline = 'top';

    [
      { data: cardInfo.email,   type: 'email' },
      { data: cardInfo.phone,   type: 'phone' },
      { data: cardInfo.sns,     type: 'sns' },
      { data: cardInfo.website, type: 'website' }
    ].forEach(item => {
      if (!item.data) return;

      const startY = currentY;
      const fontFamily = this.getFontFamily(item.data);

      const { actualHeight } = this.drawTextFitToWidth(
        ctx,
        item.data,
        padding,
        currentY,
        contactMaxWidth,
        contactFontSize,
        fontFamily,
        'left'
      );

      const step = actualHeight * baseLineGapContact;
      elementPositions.push({ start: startY, end: startY + step, type: item.type });
      currentY += step + extraLineSpace;
    });

    // ブロック生成
    this.generateBlocksFromCanvas(
      tempCanvas,
      canvasWidth,
      canvasHeight,
      pixelSize,
      elementPositions,
      {
        company: this.elementColors.company || '#60A5FA',
        name: this.elementColors.name || '#FF6B8A',
        title: this.elementColors.titleEn || '#A78BFA',
        email: this.elementColors.email || '#34D399',
        phone: this.elementColors.phone || '#FB923C',
        sns: this.elementColors.sns || '#F472B6',
        website: this.elementColors.website || '#FBBF24'
      },
      1
    );
  }


  /**
   * Professionalレイアウト（言語別フォント対応）
   */
  private createProfessionalLayout(
    cardInfo: BusinessCardInfo,
    canvasWidth: number,
    canvasHeight: number,
    pixelSize: number
  ): void {
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d', {
      willReadFrequently: true
    });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    // 論理ピクセルでレイアウト計算
    const padding = this.calculateCanvasSize(0.02, canvasHeight);
    const logicalTempWidth = this.calculateCanvasSize(0.85, canvasWidth);
    const logicalTempHeight = this.calculateCanvasSize(0.81, canvasHeight);

    console.log('createProfessionalLayout (logical):', {
      canvasWidth,
      canvasHeight,
      padding,
      logicalTempWidth,
      logicalTempHeight,
      dpr: this.dpr
    });

    // Canvas 実体は物理解像度
    tempCanvas.width = logicalTempWidth * this.dpr;
    tempCanvas.height = logicalTempHeight * this.dpr;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

    // DPR スケールを適用して以降は論理座標で描画
    ctx.scale(this.dpr, this.dpr);
    ctx.fillStyle = '#FFFFFF';

    // 行送り用パラメータ
    const baseLineGapCompany   = 1.3;
    const baseLineGapTagline   = 1.9;
    const baseLineGapName      = 1.35;
    const baseLineGapNameEn    = 1.4;
    const baseLineGapTitle     = 1.8;
    const baseLineGapContact   = 1.4;
    const lineSpace            = 1;   // 追加の1px行間

    let currentY = padding;
    const elementPositions: Array<{ start: number; end: number; type: string }> = [];

    // 会社名（中央）
    if (cardInfo.company) {
      const fontSize = this.calculateFontSize(0.09, canvasHeight, 12);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.company);
      const maxWidth = logicalTempWidth - padding * 2;

      ctx.textBaseline = 'top';
      const { actualHeight } = this.drawTextFitToWidth(
        ctx,
        cardInfo.company,
        logicalTempWidth / 2,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        'center'
      );

      const step = actualHeight * baseLineGapCompany;
      elementPositions.push({ start: startY, end: startY + step, type: 'company' });
      currentY += step + lineSpace;
    }

    // キャッチフレーズ
    if (cardInfo.tagline) {
      const fontSize = this.calculateFontSize(0.04, canvasHeight, 10);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.tagline);
      const maxWidth = logicalTempWidth - padding * 2;

      ctx.textBaseline = 'top';
      const { actualHeight } = this.drawTextFitToWidth(
        ctx,
        cardInfo.tagline,
        logicalTempWidth / 2,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        'center'
      );

      const step = actualHeight * baseLineGapTagline;
      elementPositions.push({ start: startY, end: startY + step, type: 'tagline' });
      currentY += step + lineSpace;
    }

    // 名前（自国語）
    if (cardInfo.name) {
      const fontSize = this.calculateFontSize(0.120, canvasHeight, 12);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.name);
      const maxWidth = logicalTempWidth - padding * 2;

      ctx.textBaseline = 'top';
      const { actualHeight } = this.drawTextFitToWidth(
        ctx,
        cardInfo.name,
        padding,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        'left'
      );

      const step = actualHeight * baseLineGapName;
      elementPositions.push({ start: startY, end: startY + step, type: 'name' });
      currentY += step + lineSpace;
    }

    // 英語名
    if (cardInfo.nameEn) {
      const fontSize = this.calculateFontSize(0.05, canvasHeight, 10);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.nameEn);
      const maxWidth = logicalTempWidth - padding * 2;

      ctx.textBaseline = 'top';
      const { actualHeight } = this.drawTextFitToWidth(
        ctx,
        cardInfo.nameEn,
        padding,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        'left'
      );

      const step = actualHeight * baseLineGapNameEn;
      elementPositions.push({ start: startY, end: startY + step, type: 'nameEn' });
      currentY += step + lineSpace*12;
    }

    // 肩書き
    if (cardInfo.title) {
      const fontSize = this.calculateFontSize(0.052, canvasHeight, 12);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.title);
      const maxWidth = logicalTempWidth - padding * 2;

      ctx.textBaseline = 'top';
      const { actualHeight } = this.drawTextFitToWidth(
        ctx,
        cardInfo.title,
        padding,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        'left'
      );

      const step = actualHeight * baseLineGapTitle;
      elementPositions.push({ start: startY, end: startY + step, type: 'title' });
      currentY += step + lineSpace;
    }

    // 連絡先
    const contactFontSize = this.calculateFontSize(0.04, canvasHeight, 10);
    const labelWidthRatio = 0.17;  // ラベル幅の比率（15%）
    const gapRatio = 0.01;         // ラベルとデータの間隔（2%）

    [
      { label: 'Email',   data: cardInfo.email,   type: 'email' },
      { label: 'Phone',   data: cardInfo.phone,   type: 'phone' },
      { label: 'SNS',     data: cardInfo.sns,     type: 'sns' },
      { label: 'Website', data: cardInfo.website, type: 'website' }
    ].forEach(item => {
      if (!item.data) return;

      const startY = currentY;

      const labelFontFamily = this.getFontFamily(item.label);
      const dataFontFamily = this.getFontFamily(item.data);

      ctx.textBaseline = 'top';

      const availableWidth = logicalTempWidth - padding * 2;
      const labelMaxWidth = availableWidth * labelWidthRatio;
      const gap = availableWidth * gapRatio;
      const dataMaxWidth = availableWidth - labelMaxWidth - gap;

      const { actualHeight: labelHeight } = this.drawTextFitToWidth(
        ctx,
        item.label,
        padding,
        currentY,
        labelMaxWidth,
        contactFontSize,
        labelFontFamily,
        'left'
      );

      const dataStartX = padding + labelMaxWidth + gap;
      const { actualHeight: dataHeight } = this.drawTextFitToWidth(
        ctx,
        item.data,
        dataStartX,
        currentY,
        dataMaxWidth,
        contactFontSize,
        dataFontFamily,
        'left'
      );

      const actualHeight = Math.max(labelHeight, dataHeight);

      const step = actualHeight * baseLineGapContact;
      elementPositions.push({ start: startY, end: startY + step, type: item.type });
      currentY += step + lineSpace;
    });

    // ブロック生成（論理 → 物理は generateBlocksFromCanvas 側）
    this.generateBlocksFromCanvas(
      tempCanvas,
      canvasWidth,
      canvasHeight,
      pixelSize,
      elementPositions,
      {
        company: this.elementColors.company || '#60A5FA',
        tagline: this.elementColors.tagline || '#A78BFA',
        name: this.elementColors.name || '#FF6B8A',
        nameEn: this.elementColors.nameEn || '#4ECDC4',
        title: this.elementColors.titleEn || '#A78BFA',
        email: this.elementColors.email || '#34D399',
        phone: this.elementColors.phone || '#FB923C',
        sns: this.elementColors.sns || '#F472B6',
        website: this.elementColors.website || '#FBBF24'
      },
      1
    );
  }
  
  /**
   * ミニマルレイアウト（横幅フィット対応）
   */
  private createMinimalLayout(
    cardInfo: BusinessCardInfo,
    canvasWidth: number,
    canvasHeight: number,
    pixelSize: number
  ): void {
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d', {
      willReadFrequently: true
    });
    if (!ctx) return;
  
    ctx.imageSmoothingEnabled = false;
  
    // 論理ピクセルでレイアウト計算
    const padding = this.calculateCanvasSize(0.08, canvasHeight);
    const logicalTempWidth = this.calculateCanvasSize(0.8, canvasWidth);
    const logicalTempHeight = this.calculateCanvasSize(0.81, canvasHeight);
  
    console.log('createMinimalLayout (logical):', {
      canvasWidth,
      canvasHeight,
      padding,
      logicalTempWidth,
      logicalTempHeight,
      dpr: this.dpr
    });
  
    // Canvas 実体は物理解像度
    tempCanvas.width = logicalTempWidth * this.dpr;
    tempCanvas.height = logicalTempHeight * this.dpr;
    ctx.imageSmoothingEnabled = false;
  
    ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
  
    // DPR スケールを適用して以降は論理座標
    ctx.scale(this.dpr, this.dpr);
    ctx.fillStyle = '#FFFFFF';
  
    // 行送り用パラメータ
    const baseLineGapName    = 1.6;
    const baseLineGapTitle   = 2.5;
    const baseLineGapContact = 1.6;
    const lineSpace          = 1;   // 追加行間(px)
  
    let currentY = padding;
    const elementPositions: Array<{ start: number; end: number; type: string }> = [];
  
    // 名前（中央・大きく）
    if (cardInfo.name) {
      const fontSize = this.calculateFontSize(0.120, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.name);
      const maxWidth = logicalTempWidth - padding * 2;
  
      ctx.textBaseline = 'top';
      const { actualHeight } = this.drawTextFitToWidth(
        ctx,
        cardInfo.name,
        logicalTempWidth / 2,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        'center'
      );
  
      const step = actualHeight * baseLineGapName;
      elementPositions.push({ start: startY, end: startY + step, type: 'name' });
      currentY += step + lineSpace;
    }
  
    // 肩書き・会社（1行にまとめて中央）
    const titleText = [cardInfo.title, cardInfo.company].filter(Boolean).join(' | ');
    if (titleText) {
      const fontSize = this.calculateFontSize(0.045, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(titleText);
      const maxWidth = logicalTempWidth - padding * 2;
  
      ctx.textBaseline = 'top';
      const { actualHeight } = this.drawTextFitToWidth(
        ctx,
        titleText,
        logicalTempWidth / 2,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        'center'
      );
  
      const step = actualHeight * baseLineGapTitle;
      elementPositions.push({ start: startY, end: startY + step, type: 'title' });
      currentY += step + lineSpace;
    }
  
    // 連絡先（中央）
    const contactFontSize = this.calculateFontSize(0.035, canvasHeight, 12);
    const contactMaxWidth = logicalTempWidth - padding * 2;
  
    ctx.textBaseline = 'top';
  
    [
      { data: cardInfo.email,   type: 'email' },
      { data: cardInfo.phone,   type: 'phone' },
      { data: cardInfo.sns,     type: 'sns' },
      { data: cardInfo.website, type: 'website' }
    ].forEach(item => {
      if (!item.data) return;
  
      const startY = currentY;
      const fontFamily = this.getFontFamily(item.data);
  
      const { actualHeight } = this.drawTextFitToWidth(
        ctx,
        item.data,
        logicalTempWidth / 2,
        currentY,
        contactMaxWidth,
        contactFontSize,
        fontFamily,
        'center'
      );
  
      const step = actualHeight * baseLineGapContact;
      elementPositions.push({ start: startY, end: startY + step, type: item.type });
      currentY += step + lineSpace;
    });
  
    // ブロック生成
    this.generateBlocksFromCanvas(
      tempCanvas,
      canvasWidth,
      canvasHeight,
      pixelSize,
      elementPositions,
      {
        name: this.elementColors.name || '#FF6B8A',
        title: this.elementColors.titleEn || '#A78BFA',
        email: this.elementColors.email || '#34D399',
        phone: this.elementColors.phone || '#FB923C',
        sns: this.elementColors.sns || '#F472B6',
        website: this.elementColors.website || '#FBBF24'
      },
      1
    );
  }
  
  /**
   * 名刺情報からピクセル単位のブロックを生成（レイアウト選択可能）
   */
  createBlocksFromBusinessCard(
    cardInfo: BusinessCardInfo,
    canvasWidth: number,   // CSS論理ピクセル
    canvasHeight: number,   // CSS論理ピクセル
    pixelSize: number = 1,
    layout: CardLayout = 'standard'
  ): void {
    this.blocks = [];
    
    switch (layout) {
      case 'standard':
        this.createStandardLayout(cardInfo, canvasWidth, canvasHeight, pixelSize);
        break;      
      case 'professional':
        this.createProfessionalLayout(cardInfo, canvasWidth, canvasHeight, pixelSize);
        break;
      case 'minimal':
        this.createMinimalLayout(cardInfo, canvasWidth, canvasHeight, pixelSize);
        break;

    }
  }


  /**
 * キャンバスからブロックを生成
 * tempCanvas: 物理ピクセル（logicalWidth * dpr, logicalHeight * dpr）
 * canvasWidth/Height: ゲーム側キャンバス（論理）
 * logicalTempWidth/Height: レイアウトに使った論理キャンバスサイズ
 */
  private generateBlocksFromCanvas(
    tempCanvas: HTMLCanvasElement,
    canvasWidth: number,
    canvasHeight: number,
    pixelSize: number,
    elementPositions: Array<{ start: number; end: number; type: string }>,
    colorMap: { [key: string]: string },
    scaleFactor: number = 1
  ): void {
    const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;

    const dprScale = 1 / this.dpr;
    const logicalTempWidth = tempCanvas.width * dprScale;
    const logicalTempHeight = tempCanvas.height * dprScale;

    const startX = (canvasWidth - logicalTempWidth) / 2;
    const startY = (canvasHeight - logicalTempHeight) / 2;

    const getColorForLogicalY = (logicalY: number): string => {
      for (const pos of elementPositions) {
        if (logicalY >= pos.start && logicalY <= pos.end) {
          return colorMap[pos.type] || '#FFFFFF';
        }
      }
      if (elementPositions.length === 0) return '#FFFFFF';

      const closestPos = elementPositions.reduce((closest, pos) => {
        const center = (pos.start + pos.end) / 2;
        const distance = Math.abs(logicalY - center);
        const closestCenter = (closest.start + closest.end) / 2;
        const closestDistance = Math.abs(logicalY - closestCenter);
        return distance < closestDistance ? pos : closest;
      }, elementPositions[0]);

      return colorMap[closestPos?.type] || '#FFFFFF';
    };

    const scanStep = Math.max(1, Math.round(pixelSize * this.dpr));
    const blockSize = scaleFactor;
    
    // 閾値は固定（薄いピクセルのみ除外）
    const threshold = 20;

    // 重複防止用のSet（座標をキーにする）
    const blockSet = new Set<string>();

    for (let physicalY = 0; physicalY < tempCanvas.height; physicalY += scanStep) {
      const logicalY = physicalY * dprScale;
      const color = getColorForLogicalY(logicalY);

      for (let physicalX = 0; physicalX < tempCanvas.width; physicalX += scanStep) {
        
        // scanStep範囲の中心ピクセルのみ判定（高速＆正確）
        const centerY = Math.min(physicalY + Math.floor(scanStep / 2), tempCanvas.height - 1);
        const centerX = Math.min(physicalX + Math.floor(scanStep / 2), tempCanvas.width - 1);
        const i = (centerY * tempCanvas.width + centerX) * 4;

        // 低い閾値で薄いピクセルのみ除外（アンチエイリアスを除外）
        if (pixels[i + 3] > threshold) {
          // 論理座標を整数に丸める
          const logicalX = Math.round(physicalX * dprScale);
          
          // ブロック座標を整数で確定
          const blockX = Math.round(startX + logicalX);
          const blockY = Math.round(startY + logicalY);
          
          // 重複チェック（同じ座標には1つだけ）
          const key = `${blockX},${blockY}`;
          if (blockSet.has(key)) continue;
          blockSet.add(key);

          this.blocks.push({
            x: blockX,
            y: blockY,
            width: blockSize,
            height: blockSize,
            text: '',
            isDestroyed: false,
            destroyedAt: 0,
            color,
            fontSize: 0,
            fontFamily: ''
          });
        }
      }
    }

    console.log(`Generated ${this.blocks.length} blocks`);
  }
  


  // 以下、既存のメソッド（変更なし）
  destroyBlock(index: number, currentTime: number): boolean {
    if (index >= 0 && index < this.blocks.length && !this.blocks[index].isDestroyed) {
      this.blocks[index].isDestroyed = true;
      this.blocks[index].destroyedAt = currentTime;
      return true;
    }
    return false;
  }

  getBlockRecoveryState(block: Block, currentTime: number): { isDestroyed: boolean; alpha: number } {
    if (!block.isDestroyed) {
      return { isDestroyed: false, alpha: 1 };
    }

    const timeSinceDestroyed = currentTime - block.destroyedAt;

    if (timeSinceDestroyed < this.blockRecoveryTime) {
      return { isDestroyed: true, alpha: 0 };
    }

    const fadeProgress = timeSinceDestroyed - this.blockRecoveryTime;
    if (fadeProgress < this.blockFadeInTime) {
      const alpha = fadeProgress / this.blockFadeInTime;
      return { isDestroyed: false, alpha };
    }

    return { isDestroyed: false, alpha: 1 };
  }

  updateBlockRecovery(currentTime: number): void {
    this.blocks.forEach(block => {
      if (block.isDestroyed) {
        const timeSinceDestroyed = currentTime - block.destroyedAt;
        if (timeSinceDestroyed >= this.blockRecoveryTime + this.blockFadeInTime) {
          block.isDestroyed = false;
        }
      }
    });
  }

  checkCollision(ballX: number, ballY: number, ballRadius: number): number {
    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      if (block.isDestroyed) continue;

      const closestX = Math.max(block.x, Math.min(ballX, block.x + block.width));
      const closestY = Math.max(block.y, Math.min(ballY, block.y + block.height));
      const distanceX = ballX - closestX;
      const distanceY = ballY - closestY;
      const distanceSquared = distanceX * distanceX + distanceY * distanceY;

      if (distanceSquared < ballRadius * ballRadius) {
        return i;
      }
    }
    return -1;
  }

  allBlocksDestroyed(): boolean {
    return this.blocks.every(block => block.isDestroyed);
  }

  reset(): void {
    this.blocks.forEach(block => {
      block.isDestroyed = false;
      block.destroyedAt = 0;
    });
  }

  setBlockRecoveryTime(time: number): void {
    this.blockRecoveryTime = time;
  }

  setBlockFadeInTime(time: number): void {
    this.blockFadeInTime = time;
  }
}
