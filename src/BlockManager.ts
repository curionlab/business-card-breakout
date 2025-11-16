import { Block, BusinessCardInfo } from './types';

export type CardLayout = 'standard' | 'professional' | 'minimal';

export class BlockManager {
  private blocks: Block[] = [];
  private blockRecoveryTime: number;
  private blockFadeInTime: number;
  private dpr: number = 1;
  private elementColors: { [key: string]: string };

  constructor(
    blockRecoveryTime: number = 5000, 
    blockFadeInTime: number = 1000, 
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
   * フォントサイズを計算(DPR反映し、CSS理論解像度→物理解像度)
   */
  private calculateFontSize(baseRatio: number, canvasHeight: number, minSize: number = 16): number {
    const size = canvasHeight * baseRatio * this.dpr;
    // ← 小数点を四捨五入して整数に
    return Math.max(Math.round(size), minSize);
  }

  /**
   * キャンバスサイズを計算(DPR反映し、CSS理論解像度→物理解像度)
   */
  private calculateCanvasSize(ratio: number, dimension: number): number {
    const size = dimension * ratio * this.dpr;
    // ← 小数点を四捨五入して整数に（色の重なり対策）
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
  ): number {
    ctx.font = `${fontSize}px ${fontFamily}`;
    const textWidth = ctx.measureText(text).width;
    
    if (textWidth <= maxWidth) {
      // 収まる場合はそのまま描画
      ctx.textAlign = align;
      ctx.fillText(text, x, y);
      return fontSize;
    }
    
    // はみ出る場合は横方向だけスケール（横長変形）
    const scaleX = maxWidth / textWidth;
    
    ctx.save();
    
    // 描画位置を調整
    const drawX = x / scaleX;
    
    // 横方向のみスケール
    ctx.scale(scaleX, 1);
    ctx.textAlign = align;
    ctx.fillText(text, drawX, y);
    
    ctx.restore();
    
    // 高さは元のまま返す
    return fontSize;
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
    const ctx = tempCanvas.getContext('2d', { 
      willReadFrequently: true
    });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    
    // DPR反映
    const padding = this.calculateCanvasSize(0.08, canvasHeight);
    const tempWidth = this.calculateCanvasSize(0.85, canvasWidth);
    const tempHeight = this.calculateCanvasSize(0.81, canvasHeight);
    
    console.log('createStandardLayout:', {
      canvasWidth, 
      canvasHeight, 
      padding,
      tempWidth, 
      tempHeight, 
      dpr: this.dpr
    });

    tempCanvas.width = tempWidth;
    tempCanvas.height = tempHeight;
    ctx.imageSmoothingEnabled = true;
    
    ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.fillStyle = '#FFFFFF';

    let currentY = padding;
    const elementPositions: Array<{start: number, end: number, type: string}> = [];

    // 名前（左寄せ・大きく）
    if (cardInfo.name) {
      const fontSize = this.calculateFontSize(0.095, canvasHeight, 16);
      console.log('fontSize:', fontSize);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.name);
      const maxWidth = tempWidth - padding * 2;
      
      ctx.textBaseline = 'top';
      const actualHeight = this.drawTextFitToWidth(
        ctx, 
        cardInfo.name, 
        padding, 
        currentY, 
        maxWidth, 
        fontSize, 
        fontFamily, 
        'left'
      );
      
      elementPositions.push({start: startY, end: startY + actualHeight, type: 'name'});
      currentY += actualHeight * 1.5;
    }

    // 肩書き（左寄せ）
    if (cardInfo.title) {
      const fontSize = this.calculateFontSize(0.055, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.title);
      const maxWidth = tempWidth - padding * 2;
      
      ctx.textBaseline = 'top';
      const actualHeight = this.drawTextFitToWidth(
        ctx,
        cardInfo.title,
        padding,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        'left'
      );
      
      elementPositions.push({start: startY, end: startY + actualHeight, type: 'title'});
      currentY += actualHeight * 1.6;
    }

    // 会社（左寄せ）
    if (cardInfo.company) {
      const fontSize = this.calculateFontSize(0.065, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.company);
      const maxWidth = tempWidth - padding * 2;
      
      ctx.textBaseline = 'top';
      const actualHeight = this.drawTextFitToWidth(
        ctx,
        cardInfo.company,
        padding,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        'left'
      );

      elementPositions.push({start: startY, end: startY + actualHeight, type: 'company'});
      currentY += actualHeight * 1.8;
    }

    // 連絡先（左寄せ）
    const contactFontSize = this.calculateFontSize(0.040, canvasHeight, 16);
    const maxWidth = tempWidth - padding * 2;
    
    ctx.textBaseline = 'top';
    
    [
      { data: cardInfo.email, type: 'email' },
      { data: cardInfo.phone, type: 'phone' },
      { data: cardInfo.sns, type: 'sns' },
      { data: cardInfo.website, type: 'website' }
    ].forEach(item => {
      if (item.data) {
        const startY = currentY;
        const fontFamily = this.getFontFamily(item.data);
        
        const actualHeight = this.drawTextFitToWidth(
          ctx,
          item.data,
          padding,
          currentY,
          maxWidth,
          contactFontSize,
          fontFamily,
          'left'
        );

        elementPositions.push({start: startY, end: startY + actualHeight, type: item.type});
        currentY += actualHeight * 1.4;
      }
    });

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
  
    ctx.imageSmoothingEnabled = true;
    
    
    //DPR反映
    const padding = this.calculateCanvasSize(0.08, canvasHeight);
    const tempWidth = this.calculateCanvasSize(0.85, canvasWidth);
    const tempHeight = this.calculateCanvasSize(0.81, canvasHeight);
    
    console.log('createProfessionalLayout:', {
      canvasWidth, 
      canvasHeight, 
      padding,
      tempWidth, 
      tempHeight, 
      dpr: this.dpr
    });


    tempCanvas.width = tempWidth;
    tempCanvas.height = tempHeight;
    ctx.imageSmoothingEnabled = true;
    
    ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.fillStyle = '#FFFFFF';
  
    let currentY = padding;
    const elementPositions: Array<{start: number, end: number, type: string}> = [];
  
    // 会社名（中央）
    if (cardInfo.company) {
      const fontSize = this.calculateFontSize(0.08, canvasHeight, 12);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.company);
      const maxWidth = tempWidth - padding * 2;
      
      ctx.textBaseline = 'top';
      const actualHeight = this.drawTextFitToWidth(
        ctx, 
        cardInfo.company, 
        tempWidth / 2, 
        currentY, 
        maxWidth, 
        fontSize, 
        fontFamily, 
        'center'
      );

      elementPositions.push({start: startY, end: startY + actualHeight, type: 'company'});
      currentY += actualHeight * 1.3;
    }
  
    // キャッチフレーズ
    if (cardInfo.tagline) {
      const fontSize = this.calculateFontSize(0.035, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.tagline);
      const maxWidth = tempWidth - padding * 2;
      
      ctx.textBaseline = 'top';
      const actualHeight = this.drawTextFitToWidth(
        ctx, 
        cardInfo.tagline, 
        tempWidth / 2, 
        currentY, 
        maxWidth, 
        fontSize, 
        fontFamily, 
        'center'
      );
      
      elementPositions.push({start: startY, end: startY + actualHeight, type: 'tagline'});
      currentY += actualHeight * 2;
    }
  
    // 名前（自国語）
    if (cardInfo.name) {
      const fontSize = this.calculateFontSize(0.110, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.name);
      const maxWidth = tempWidth - padding * 2;
      
      ctx.textBaseline = 'top';
      const actualHeight = this.drawTextFitToWidth(
        ctx, 
        cardInfo.name, 
        padding, 
        currentY, 
        maxWidth, 
        fontSize, 
        fontFamily, 
        'left'
      );
      
      elementPositions.push({start: startY, end: startY + actualHeight, type: 'name'});
      currentY += actualHeight * 1.4;
    }
  
    // 英語名
    if (cardInfo.nameEn) {
      const fontSize = this.calculateFontSize(0.05, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.nameEn);
      const maxWidth = tempWidth - padding * 2;
      
      ctx.textBaseline = 'top';
      const actualHeight = this.drawTextFitToWidth(
        ctx, 
        cardInfo.nameEn, 
        padding, 
        currentY, 
        maxWidth, 
        fontSize, 
        fontFamily, 
        'left'
      );
      
      elementPositions.push({start: startY, end: startY + actualHeight, type: 'nameEn'});
      currentY += actualHeight * 1.5;
    }
  
    // 肩書き
    if (cardInfo.title) {
      const fontSize = this.calculateFontSize(0.048, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.title);
      const maxWidth = tempWidth - padding * 2;
      
      ctx.textBaseline = 'top';
      const actualHeight = this.drawTextFitToWidth(
        ctx, 
        cardInfo.title, 
        padding, 
        currentY, 
        maxWidth, 
        fontSize, 
        fontFamily, 
        'left'
      );
      
      elementPositions.push({start: startY, end: startY + actualHeight, type: 'title'});
      currentY += actualHeight * 2;
    }
  

    // 連絡先
    const contactFontSize = this.calculateFontSize(0.038, canvasHeight, 16);
    const labelWidthRatio = 0.15;  // ラベル幅の比率（15%）
    const gapRatio = 0.02;         // ラベルとデータの間隔（2%）

    [
      { label: 'Email', data: cardInfo.email, type: 'email' },
      { label: 'Phone', data: cardInfo.phone, type: 'phone' }, 
      { label: 'SNS', data: cardInfo.sns, type: 'sns' },
      { label: 'Website', data: cardInfo.website, type: 'website' }
    ].forEach(item => {
      if (item.data) {
        const startY = currentY;
        
        const labelFontFamily = this.getFontFamily(item.label);
        const dataFontFamily = this.getFontFamily(item.data);
        
        ctx.textBaseline = 'top';
        
        // 利用可能な幅を計算
        const availableWidth = tempWidth - padding * 2;
        const labelMaxWidth = availableWidth * labelWidthRatio;
        const gap = availableWidth * gapRatio;
        const dataMaxWidth = availableWidth - labelMaxWidth - gap;
        
        // ラベルをdrawTextFitToWidthで描画（縮小可能）
        const labelHeight = this.drawTextFitToWidth(
          ctx,
          item.label,
          padding,
          currentY,
          labelMaxWidth,
          contactFontSize,
          labelFontFamily,
          'left'
        );
        
        // データをdrawTextFitToWidthで描画（開始位置を揃える）
        const dataStartX = padding + labelMaxWidth + gap;
        const dataHeight = this.drawTextFitToWidth(
          ctx,
          item.data,
          dataStartX,
          currentY,
          dataMaxWidth,
          contactFontSize,
          dataFontFamily,
          'left'
        );
        
        // 高い方の高さを使用
        const actualHeight = Math.max(labelHeight, dataHeight);
        
        elementPositions.push({start: startY, end: startY + actualHeight, type: item.type});
        currentY += actualHeight * 1.4;

      }
    });

  
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
      1  // ←scaleFactorを1に固定
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

    ctx.imageSmoothingEnabled = true;
    

    const padding = this.calculateCanvasSize(0.08, canvasHeight);
    const tempWidth = this.calculateCanvasSize(0.8, canvasWidth);
    const tempHeight = this.calculateCanvasSize(0.81, canvasHeight);
    
        
    console.log('createMinimalLayout:', {
      canvasWidth, 
      canvasHeight, 
      padding,
      tempWidth, 
      tempHeight, 
      dpr: this.dpr
    });

    tempCanvas.width = tempWidth;
    tempCanvas.height = tempHeight;
    ctx.imageSmoothingEnabled = true;
    
    ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.fillStyle = '#FFFFFF';

    let currentY = padding;
    const elementPositions: Array<{start: number, end: number, type: string}> = [];

    // 名前（中央・大きく）
    if (cardInfo.name) {
      const fontSize = this.calculateFontSize(0.120, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.name);
      const maxWidth = tempWidth - padding * 2;
      
      ctx.textBaseline = 'top';
      const actualHeight = this.drawTextFitToWidth(
        ctx,
        cardInfo.name,
        tempWidth / 2,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        'center'
      );
      
      elementPositions.push({start: startY, end: startY + actualHeight, type: 'name'});
      currentY += actualHeight * 1.6;
    }

    // 肩書き・会社
    const titleText = [cardInfo.title, cardInfo.company].filter(Boolean).join(' | ');
    if (titleText) {
      const fontSize = this.calculateFontSize(0.045, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(titleText);
      const maxWidth = tempWidth - padding * 2;
      
      ctx.textBaseline = 'top';
      const actualHeight = this.drawTextFitToWidth(
        ctx,
        titleText,
        tempWidth / 2,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        'center'
      );
      
      elementPositions.push({start: startY, end: startY + actualHeight, type: 'title'});
      currentY += actualHeight * 2.5;
    }

    // 連絡先（中央・細い線）
    const contactFontSize = this.calculateFontSize(0.035, canvasHeight, 16);
    const maxWidth = tempWidth - padding * 2;
    
    ctx.textBaseline = 'top';
    
    [
      { data: cardInfo.email, type: 'email' },
      { data: cardInfo.phone, type: 'phone' },
      { data: cardInfo.sns, type: 'sns' },
      { data: cardInfo.website, type: 'website' }
    ].forEach(item => {
      if (item.data) {
        const startY = currentY;
        const fontFamily = this.getFontFamily(item.data);
        
        const actualHeight = this.drawTextFitToWidth(
          ctx,
          item.data,
          tempWidth / 2,
          currentY,
          maxWidth,
          contactFontSize,
          fontFamily,
          'center'
        );
        
        elementPositions.push({start: startY, end: startY + actualHeight, type: item.type});
        currentY += actualHeight * 1.6;
      }
    });

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
      1 // scaleFactor = 1
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
   */
  private generateBlocksFromCanvas(
    tempCanvas: HTMLCanvasElement,  // 832×456（物理ピクセル、DPR=3倍）
    canvasWidth: number,      // CSS論理ピクセル 328
    canvasHeight: number,     // CSS論理ピクセル 192
    pixelSize: number,        // スキャン間隔
    elementPositions: Array<{start: number, end: number, type: string}>,
    colorMap: { [key: string]: string },
    scaleFactor: number = 1 // ブロックサイズ
  ): void {
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
  
    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ステップ1: DPRで割り戻すスケールファクター
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const dprScale = 1 / this.dpr;
  
    console.log('generateBlocksFromCanvas:', {
      tempCanvasSize: `${tempCanvas.width}x${tempCanvas.height}`,
      gameCanvasSize: `${canvasWidth}x${canvasHeight}`,
      dpr: this.dpr,
      dprScale: dprScale
    });
  
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ステップ2: 論理座標系でのtempCanvasサイズ
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const logicalTempWidth = tempCanvas.width * dprScale;   // 832 / 3 = 277
    const logicalTempHeight = tempCanvas.height * dprScale; // 456 / 3 = 152
  
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ステップ3: 中央配置の計算（論理座標系）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const startX = (canvasWidth - logicalTempWidth) / 2;   // (328 - 277) / 2 = 25.5
    const startY = (canvasHeight - logicalTempHeight) / 2; // (192 - 152) / 2 = 20
  
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ステップ4: 色の取得関数（物理座標系で動作）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const getColorForY = (physicalY: number): string => {
      // elementPositionsも物理ピクセルで保存されているため、そのまま使える
      for (const pos of elementPositions) {
        if (physicalY >= pos.start && physicalY <= pos.end) {
          return colorMap[pos.type] || '#FFFFFF';
        }
      }
      
      // 最も近い要素の色を返す
      const closestPos = elementPositions.reduce((closest, pos) => {
        const center = (pos.start + pos.end) / 2;
        const distance = Math.abs(physicalY - center);
        const closestCenter = (closest.start + closest.end) / 2;
        const closestDistance = Math.abs(physicalY - closestCenter);
        return distance < closestDistance ? pos : closest;
      }, elementPositions[0]);
      
      return colorMap[closestPos?.type] || '#FFFFFF';
    };


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ステップ5: ピクセルスキャン（物理ピクセル座標）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const scanStep = pixelSize; // 基本は1ピクセルずつスキャン（高精細）
    //const blockSize = scaleFactor * dprScale;  // 論理座標系でのブロックサイズ（1/3 ≈ 0.33）
    const blockSize = scaleFactor //常に1

    for (let physicalY = 0; physicalY < tempCanvas.height; physicalY += scanStep) {
      for (let physicalX = 0; physicalX < tempCanvas.width; physicalX += scanStep) {
        const i = (physicalY * tempCanvas.width + physicalX) * 4;
        
        // アルファ値が200以上なら描画されているピクセル
        if (pixels[i + 3] > 80) {
          // ← 重要：物理座標を論理座標に変換
          const logicalX = physicalX * dprScale;
          const logicalY = physicalY * dprScale;
          
          this.blocks.push({
            x: Math.round(startX + logicalX),  // ← 整数化
            y: Math.round(startY + logicalY),  // ← 整数化
            width: blockSize,      // 論理座標系のサイズ（0.33）
            height: blockSize,
            text: '',
            isDestroyed: false,
            destroyedAt: 0,
            color: getColorForY(physicalY),
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
