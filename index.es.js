var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class BallPhysics {
  // 基本速度を保持
  constructor(x, y, radius, baseSpeed = 6) {
    __publicField(this, "ball");
    __publicField(this, "baseSpeed");
    this.ball = {
      x,
      y,
      vx: 0,
      vy: 0,
      radius
    };
    this.baseSpeed = baseSpeed;
  }
  getBall() {
    return this.ball;
  }
  update() {
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;
    const currentSpeed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
    if (currentSpeed < this.baseSpeed && currentSpeed > 0) {
      const ratio = this.baseSpeed / currentSpeed;
      this.ball.vx *= ratio;
      this.ball.vy *= ratio;
    }
  }
  setVelocity(vx, vy) {
    this.ball.vx = vx;
    this.ball.vy = vy;
  }
  // 壁との衝突判定と反射
  checkWallCollision(width, _height) {
    if (this.ball.x - this.ball.radius < 0) {
      this.ball.x = this.ball.radius;
      this.ball.vx = Math.abs(this.ball.vx);
    }
    if (this.ball.x + this.ball.radius > width) {
      this.ball.x = width - this.ball.radius;
      this.ball.vx = -Math.abs(this.ball.vx);
    }
    if (this.ball.y - this.ball.radius < 0) {
      this.ball.y = this.ball.radius;
      this.ball.vy = Math.abs(this.ball.vy);
    }
  }
  reset(x, y) {
    this.ball.x = x;
    this.ball.y = y;
    this.ball.vx = 0;
    this.ball.vy = 0;
  }
  // パドルとの衝突判定
  checkPaddleCollision(paddleX, paddleY, paddleWidth, paddleHeight) {
    if (this.ball.y + this.ball.radius >= paddleY && this.ball.y - this.ball.radius <= paddleY + paddleHeight && this.ball.x + this.ball.radius >= paddleX && this.ball.x - this.ball.radius <= paddleX + paddleWidth) {
      const hitPos = (this.ball.x - paddleX) / paddleWidth;
      const angle = (hitPos - 0.5) * Math.PI * 0.7;
      this.ball.vx = Math.sin(angle) * this.baseSpeed;
      this.ball.vy = -Math.abs(Math.cos(angle) * this.baseSpeed);
      this.ball.y = paddleY - this.ball.radius;
      return true;
    }
    return false;
  }
  // ブロックとの衝突判定
  checkBlockCollision(blockX, blockY, blockWidth, blockHeight) {
    const closestX = Math.max(blockX, Math.min(this.ball.x, blockX + blockWidth));
    const closestY = Math.max(blockY, Math.min(this.ball.y, blockY + blockHeight));
    const distanceX = this.ball.x - closestX;
    const distanceY = this.ball.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    if (distanceSquared < this.ball.radius * this.ball.radius) {
      const distance = Math.sqrt(distanceSquared);
      const normalX = distance > 0 ? distanceX / distance : 0;
      const normalY = distance > 0 ? distanceY / distance : 0;
      const overlap = this.ball.radius - distance;
      this.ball.x += normalX * overlap;
      this.ball.y += normalY * overlap;
      const dotProduct = this.ball.vx * normalX + this.ball.vy * normalY;
      this.ball.vx = this.ball.vx - 2 * dotProduct * normalX;
      this.ball.vy = this.ball.vy - 2 * dotProduct * normalY;
      return { collided: true, normal: { x: normalX, y: normalY } };
    }
    return { collided: false, normal: { x: 0, y: 0 } };
  }
}
class PaddleController {
  constructor(x, y, width, height, _speed = 8) {
    __publicField(this, "paddle");
    __publicField(this, "keysPressed", /* @__PURE__ */ new Map());
    __publicField(this, "lastKeyPressTime", 0);
    this.paddle = {
      x,
      y,
      width,
      height,
      vx: 0
    };
    this.setupKeyListeners();
  }
  getPaddle() {
    return this.paddle;
  }
  getWidth() {
    return this.paddle.width;
  }
  setupKeyListeners() {
    if (typeof window === "undefined") return;
    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      this.keysPressed.set(key, true);
      if (key === "arrowleft" || key === "arrowright" || key === "a" || key === "d") {
        this.lastKeyPressTime = performance.now();
      }
    });
    window.addEventListener("keyup", (e) => {
      this.keysPressed.set(e.key.toLowerCase(), false);
    });
  }
  /**
   * キーボードが最近使われたかチェック（500ms以内）
   */
  isKeyboardActive() {
    return performance.now() - this.lastKeyPressTime < 500;
  }
  update(canvasWidth, paddleSpeed) {
    this.paddle.vx = 0;
    if (this.keysPressed.get("arrowleft") || this.keysPressed.get("a")) {
      this.paddle.vx = -paddleSpeed;
      this.lastKeyPressTime = performance.now();
    }
    if (this.keysPressed.get("arrowright") || this.keysPressed.get("d")) {
      this.paddle.vx = paddleSpeed;
      this.lastKeyPressTime = performance.now();
    }
    this.paddle.x += this.paddle.vx;
    if (this.paddle.x < 0) {
      this.paddle.x = 0;
    }
    if (this.paddle.x + this.paddle.width > canvasWidth) {
      this.paddle.x = canvasWidth - this.paddle.width;
    }
  }
  // マウス/タッチ位置に基づいてパドルを移動
  updateFromPointer(pointerX, canvasWidth) {
    const centerX = pointerX - this.paddle.width / 2;
    this.paddle.x = Math.max(0, Math.min(centerX, canvasWidth - this.paddle.width));
  }
  reset(x, y) {
    this.paddle.x = x;
    this.paddle.y = y;
    this.paddle.vx = 0;
  }
}
class BlockManager {
  constructor(blockRecoveryTime = 5e3, blockFadeInTime = 1e3, dpr = 1, elementColors = {}) {
    __publicField(this, "blocks", []);
    __publicField(this, "blockRecoveryTime");
    __publicField(this, "blockFadeInTime");
    __publicField(this, "dpr", 1);
    __publicField(this, "elementColors");
    this.blockRecoveryTime = blockRecoveryTime;
    this.blockFadeInTime = blockFadeInTime;
    this.dpr = dpr;
    this.elementColors = elementColors;
  }
  getBlocks() {
    return this.blocks;
  }
  /**
   * フォントサイズを計算(DPR反映し、CSS理論解像度→物理解像度)
   */
  calculateFontSize(baseRatio, canvasHeight, minSize = 16) {
    const size = canvasHeight * baseRatio * this.dpr;
    return Math.max(Math.round(size), minSize);
  }
  /**
   * キャンバスサイズを計算(DPR反映し、CSS理論解像度→物理解像度)
   */
  calculateCanvasSize(ratio, dimension) {
    const size = dimension * ratio * this.dpr;
    return Math.round(size);
  }
  /**
   * テキストを描画し、横幅に収める（高さは維持）
   */
  drawTextFitToWidth(ctx, text, x, y, maxWidth, fontSize, fontFamily, align = "left") {
    ctx.font = `${fontSize}px ${fontFamily}`;
    const textWidth = ctx.measureText(text).width;
    if (textWidth <= maxWidth) {
      ctx.textAlign = align;
      ctx.fillText(text, x, y);
      return fontSize;
    }
    const scaleX = maxWidth / textWidth;
    ctx.save();
    const drawX = x / scaleX;
    ctx.scale(scaleX, 1);
    ctx.textAlign = align;
    ctx.fillText(text, drawX, y);
    ctx.restore();
    return fontSize;
  }
  /**
   * テキストに応じたフォントファミリーを取得
   */
  getFontFamily(text) {
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
  createStandardLayout(cardInfo, canvasWidth, canvasHeight, pixelSize) {
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d", {
      willReadFrequently: true
    });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    const padding = this.calculateCanvasSize(0.08, canvasHeight);
    const tempWidth = this.calculateCanvasSize(0.85, canvasWidth);
    const tempHeight = this.calculateCanvasSize(0.81, canvasHeight);
    console.log("createStandardLayout:", {
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
    ctx.fillStyle = "#FFFFFF";
    let currentY = padding;
    const elementPositions = [];
    if (cardInfo.name) {
      const fontSize = this.calculateFontSize(0.095, canvasHeight, 16);
      console.log("fontSize:", fontSize);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.name);
      const maxWidth2 = tempWidth - padding * 2;
      ctx.textBaseline = "top";
      const actualHeight = this.drawTextFitToWidth(
        ctx,
        cardInfo.name,
        padding,
        currentY,
        maxWidth2,
        fontSize,
        fontFamily,
        "left"
      );
      elementPositions.push({ start: startY, end: startY + actualHeight, type: "name" });
      currentY += actualHeight * 1.5;
    }
    if (cardInfo.title) {
      const fontSize = this.calculateFontSize(0.055, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.title);
      const maxWidth2 = tempWidth - padding * 2;
      ctx.textBaseline = "top";
      const actualHeight = this.drawTextFitToWidth(
        ctx,
        cardInfo.title,
        padding,
        currentY,
        maxWidth2,
        fontSize,
        fontFamily,
        "left"
      );
      elementPositions.push({ start: startY, end: startY + actualHeight, type: "title" });
      currentY += actualHeight * 1.6;
    }
    if (cardInfo.company) {
      const fontSize = this.calculateFontSize(0.065, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.company);
      const maxWidth2 = tempWidth - padding * 2;
      ctx.textBaseline = "top";
      const actualHeight = this.drawTextFitToWidth(
        ctx,
        cardInfo.company,
        padding,
        currentY,
        maxWidth2,
        fontSize,
        fontFamily,
        "left"
      );
      elementPositions.push({ start: startY, end: startY + actualHeight, type: "company" });
      currentY += actualHeight * 1.8;
    }
    const contactFontSize = this.calculateFontSize(0.04, canvasHeight, 16);
    const maxWidth = tempWidth - padding * 2;
    ctx.textBaseline = "top";
    [
      { data: cardInfo.email, type: "email" },
      { data: cardInfo.phone, type: "phone" },
      { data: cardInfo.sns, type: "sns" },
      { data: cardInfo.website, type: "website" }
    ].forEach((item) => {
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
          "left"
        );
        elementPositions.push({ start: startY, end: startY + actualHeight, type: item.type });
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
        company: this.elementColors.company || "#60A5FA",
        name: this.elementColors.name || "#FF6B8A",
        title: this.elementColors.titleEn || "#A78BFA",
        email: this.elementColors.email || "#34D399",
        phone: this.elementColors.phone || "#FB923C",
        sns: this.elementColors.sns || "#F472B6",
        website: this.elementColors.website || "#FBBF24"
      },
      1
    );
  }
  /**
   * Professionalレイアウト（言語別フォント対応）
   */
  createProfessionalLayout(cardInfo, canvasWidth, canvasHeight, pixelSize) {
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d", {
      willReadFrequently: true
    });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    const padding = this.calculateCanvasSize(0.08, canvasHeight);
    const tempWidth = this.calculateCanvasSize(0.85, canvasWidth);
    const tempHeight = this.calculateCanvasSize(0.81, canvasHeight);
    console.log("createProfessionalLayout:", {
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
    ctx.fillStyle = "#FFFFFF";
    let currentY = padding;
    const elementPositions = [];
    if (cardInfo.company) {
      const fontSize = this.calculateFontSize(0.08, canvasHeight, 12);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.company);
      const maxWidth = tempWidth - padding * 2;
      ctx.textBaseline = "top";
      const actualHeight = this.drawTextFitToWidth(
        ctx,
        cardInfo.company,
        tempWidth / 2,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        "center"
      );
      elementPositions.push({ start: startY, end: startY + actualHeight, type: "company" });
      currentY += actualHeight * 1.3;
    }
    if (cardInfo.tagline) {
      const fontSize = this.calculateFontSize(0.035, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.tagline);
      const maxWidth = tempWidth - padding * 2;
      ctx.textBaseline = "top";
      const actualHeight = this.drawTextFitToWidth(
        ctx,
        cardInfo.tagline,
        tempWidth / 2,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        "center"
      );
      elementPositions.push({ start: startY, end: startY + actualHeight, type: "tagline" });
      currentY += actualHeight * 2;
    }
    if (cardInfo.name) {
      const fontSize = this.calculateFontSize(0.11, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.name);
      const maxWidth = tempWidth - padding * 2;
      ctx.textBaseline = "top";
      const actualHeight = this.drawTextFitToWidth(
        ctx,
        cardInfo.name,
        padding,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        "left"
      );
      elementPositions.push({ start: startY, end: startY + actualHeight, type: "name" });
      currentY += actualHeight * 1.4;
    }
    if (cardInfo.nameEn) {
      const fontSize = this.calculateFontSize(0.05, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.nameEn);
      const maxWidth = tempWidth - padding * 2;
      ctx.textBaseline = "top";
      const actualHeight = this.drawTextFitToWidth(
        ctx,
        cardInfo.nameEn,
        padding,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        "left"
      );
      elementPositions.push({ start: startY, end: startY + actualHeight, type: "nameEn" });
      currentY += actualHeight * 1.5;
    }
    if (cardInfo.title) {
      const fontSize = this.calculateFontSize(0.048, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.title);
      const maxWidth = tempWidth - padding * 2;
      ctx.textBaseline = "top";
      const actualHeight = this.drawTextFitToWidth(
        ctx,
        cardInfo.title,
        padding,
        currentY,
        maxWidth,
        fontSize,
        fontFamily,
        "left"
      );
      elementPositions.push({ start: startY, end: startY + actualHeight, type: "title" });
      currentY += actualHeight * 2;
    }
    const contactFontSize = this.calculateFontSize(0.038, canvasHeight, 16);
    const labelWidthRatio = 0.15;
    const gapRatio = 0.02;
    [
      { label: "Email", data: cardInfo.email, type: "email" },
      { label: "Phone", data: cardInfo.phone, type: "phone" },
      { label: "SNS", data: cardInfo.sns, type: "sns" },
      { label: "Website", data: cardInfo.website, type: "website" }
    ].forEach((item) => {
      if (item.data) {
        const startY = currentY;
        const labelFontFamily = this.getFontFamily(item.label);
        const dataFontFamily = this.getFontFamily(item.data);
        ctx.textBaseline = "top";
        const availableWidth = tempWidth - padding * 2;
        const labelMaxWidth = availableWidth * labelWidthRatio;
        const gap = availableWidth * gapRatio;
        const dataMaxWidth = availableWidth - labelMaxWidth - gap;
        const labelHeight = this.drawTextFitToWidth(
          ctx,
          item.label,
          padding,
          currentY,
          labelMaxWidth,
          contactFontSize,
          labelFontFamily,
          "left"
        );
        const dataStartX = padding + labelMaxWidth + gap;
        const dataHeight = this.drawTextFitToWidth(
          ctx,
          item.data,
          dataStartX,
          currentY,
          dataMaxWidth,
          contactFontSize,
          dataFontFamily,
          "left"
        );
        const actualHeight = Math.max(labelHeight, dataHeight);
        elementPositions.push({ start: startY, end: startY + actualHeight, type: item.type });
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
        company: this.elementColors.company || "#60A5FA",
        tagline: this.elementColors.tagline || "#A78BFA",
        name: this.elementColors.name || "#FF6B8A",
        nameEn: this.elementColors.nameEn || "#4ECDC4",
        title: this.elementColors.titleEn || "#A78BFA",
        email: this.elementColors.email || "#34D399",
        phone: this.elementColors.phone || "#FB923C",
        sns: this.elementColors.sns || "#F472B6",
        website: this.elementColors.website || "#FBBF24"
      },
      1
      // ←scaleFactorを1に固定
    );
  }
  /**
   * ミニマルレイアウト（横幅フィット対応）
   */
  createMinimalLayout(cardInfo, canvasWidth, canvasHeight, pixelSize) {
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d", {
      willReadFrequently: true
    });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    const padding = this.calculateCanvasSize(0.08, canvasHeight);
    const tempWidth = this.calculateCanvasSize(0.8, canvasWidth);
    const tempHeight = this.calculateCanvasSize(0.81, canvasHeight);
    console.log("createMinimalLayout:", {
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
    ctx.fillStyle = "#FFFFFF";
    let currentY = padding;
    const elementPositions = [];
    if (cardInfo.name) {
      const fontSize = this.calculateFontSize(0.12, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(cardInfo.name);
      const maxWidth2 = tempWidth - padding * 2;
      ctx.textBaseline = "top";
      const actualHeight = this.drawTextFitToWidth(
        ctx,
        cardInfo.name,
        tempWidth / 2,
        currentY,
        maxWidth2,
        fontSize,
        fontFamily,
        "center"
      );
      elementPositions.push({ start: startY, end: startY + actualHeight, type: "name" });
      currentY += actualHeight * 1.6;
    }
    const titleText = [cardInfo.title, cardInfo.company].filter(Boolean).join(" | ");
    if (titleText) {
      const fontSize = this.calculateFontSize(0.045, canvasHeight, 16);
      const startY = currentY;
      const fontFamily = this.getFontFamily(titleText);
      const maxWidth2 = tempWidth - padding * 2;
      ctx.textBaseline = "top";
      const actualHeight = this.drawTextFitToWidth(
        ctx,
        titleText,
        tempWidth / 2,
        currentY,
        maxWidth2,
        fontSize,
        fontFamily,
        "center"
      );
      elementPositions.push({ start: startY, end: startY + actualHeight, type: "title" });
      currentY += actualHeight * 2.5;
    }
    const contactFontSize = this.calculateFontSize(0.035, canvasHeight, 16);
    const maxWidth = tempWidth - padding * 2;
    ctx.textBaseline = "top";
    [
      { data: cardInfo.email, type: "email" },
      { data: cardInfo.phone, type: "phone" },
      { data: cardInfo.sns, type: "sns" },
      { data: cardInfo.website, type: "website" }
    ].forEach((item) => {
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
          "center"
        );
        elementPositions.push({ start: startY, end: startY + actualHeight, type: item.type });
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
        name: this.elementColors.name || "#FF6B8A",
        title: this.elementColors.titleEn || "#A78BFA",
        email: this.elementColors.email || "#34D399",
        phone: this.elementColors.phone || "#FB923C",
        sns: this.elementColors.sns || "#F472B6",
        website: this.elementColors.website || "#FBBF24"
      },
      1
      // scaleFactor = 1
    );
  }
  /**
   * 名刺情報からピクセル単位のブロックを生成（レイアウト選択可能）
   */
  createBlocksFromBusinessCard(cardInfo, canvasWidth, canvasHeight, pixelSize = 1, layout = "standard") {
    this.blocks = [];
    switch (layout) {
      case "standard":
        this.createStandardLayout(cardInfo, canvasWidth, canvasHeight, pixelSize);
        break;
      case "professional":
        this.createProfessionalLayout(cardInfo, canvasWidth, canvasHeight, pixelSize);
        break;
      case "minimal":
        this.createMinimalLayout(cardInfo, canvasWidth, canvasHeight, pixelSize);
        break;
    }
  }
  /**
   * キャンバスからブロックを生成
   */
  generateBlocksFromCanvas(tempCanvas, canvasWidth, canvasHeight, pixelSize, elementPositions, colorMap, scaleFactor = 1) {
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;
    const dprScale = 1 / this.dpr;
    console.log("generateBlocksFromCanvas:", {
      tempCanvasSize: `${tempCanvas.width}x${tempCanvas.height}`,
      gameCanvasSize: `${canvasWidth}x${canvasHeight}`,
      dpr: this.dpr,
      dprScale
    });
    const logicalTempWidth = tempCanvas.width * dprScale;
    const logicalTempHeight = tempCanvas.height * dprScale;
    const startX = (canvasWidth - logicalTempWidth) / 2;
    const startY = (canvasHeight - logicalTempHeight) / 2;
    const getColorForY = (physicalY) => {
      for (const pos of elementPositions) {
        if (physicalY >= pos.start && physicalY <= pos.end) {
          return colorMap[pos.type] || "#FFFFFF";
        }
      }
      const closestPos = elementPositions.reduce((closest, pos) => {
        const center = (pos.start + pos.end) / 2;
        const distance = Math.abs(physicalY - center);
        const closestCenter = (closest.start + closest.end) / 2;
        const closestDistance = Math.abs(physicalY - closestCenter);
        return distance < closestDistance ? pos : closest;
      }, elementPositions[0]);
      return colorMap[closestPos == null ? void 0 : closestPos.type] || "#FFFFFF";
    };
    const scanStep = pixelSize;
    const blockSize = scaleFactor;
    for (let physicalY = 0; physicalY < tempCanvas.height; physicalY += scanStep) {
      for (let physicalX = 0; physicalX < tempCanvas.width; physicalX += scanStep) {
        const i = (physicalY * tempCanvas.width + physicalX) * 4;
        if (pixels[i + 3] > 80) {
          const logicalX = physicalX * dprScale;
          const logicalY = physicalY * dprScale;
          this.blocks.push({
            x: Math.round(startX + logicalX),
            // ← 整数化
            y: Math.round(startY + logicalY),
            // ← 整数化
            width: blockSize,
            // 論理座標系のサイズ（0.33）
            height: blockSize,
            text: "",
            isDestroyed: false,
            destroyedAt: 0,
            color: getColorForY(physicalY),
            fontSize: 0,
            fontFamily: ""
          });
        }
      }
    }
    console.log(`Generated ${this.blocks.length} blocks`);
  }
  // 以下、既存のメソッド（変更なし）
  destroyBlock(index, currentTime) {
    if (index >= 0 && index < this.blocks.length && !this.blocks[index].isDestroyed) {
      this.blocks[index].isDestroyed = true;
      this.blocks[index].destroyedAt = currentTime;
      return true;
    }
    return false;
  }
  getBlockRecoveryState(block, currentTime) {
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
  updateBlockRecovery(currentTime) {
    this.blocks.forEach((block) => {
      if (block.isDestroyed) {
        const timeSinceDestroyed = currentTime - block.destroyedAt;
        if (timeSinceDestroyed >= this.blockRecoveryTime + this.blockFadeInTime) {
          block.isDestroyed = false;
        }
      }
    });
  }
  checkCollision(ballX, ballY, ballRadius) {
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
  allBlocksDestroyed() {
    return this.blocks.every((block) => block.isDestroyed);
  }
  reset() {
    this.blocks.forEach((block) => {
      block.isDestroyed = false;
      block.destroyedAt = 0;
    });
  }
  setBlockRecoveryTime(time) {
    this.blockRecoveryTime = time;
  }
  setBlockFadeInTime(time) {
    this.blockFadeInTime = time;
  }
}
class ParticleSystem {
  constructor() {
    __publicField(this, "particles", []);
  }
  getParticles() {
    return this.particles;
  }
  /**
   * ブロック破壊時のパーティクルを生成
   */
  createBlockDestructionEffect(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = i / count * Math.PI * 2;
      const speed = 3 + Math.random() * 4;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      this.particles.push({
        x,
        y,
        vx,
        vy,
        life: 1,
        maxLife: 1,
        color,
        size: 4 + Math.random() * 4
      });
    }
  }
  /**
   * 衝撃波エフェクトを生成
   */
  createImpactEffect(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = i / count * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 3;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      this.particles.push({
        x,
        y,
        vx,
        vy,
        life: 1,
        maxLife: 1,
        color,
        size: 2 + Math.random() * 3
      });
    }
  }
  /**
   * パーティクルを更新
   */
  update() {
    this.particles = this.particles.filter((particle) => {
      particle.life -= 0.05;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2;
      particle.vx *= 0.98;
      return particle.life > 0;
    });
  }
  /**
   * パーティクルをクリア
   */
  clear() {
    this.particles = [];
  }
}
class Renderer {
  //private canvas: HTMLCanvasElement;
  //private dpr: number;
  constructor(canvas, dpr = 1) {
    __publicField(this, "ctx");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context from canvas");
    }
    this.ctx = ctx;
    this.ctx.scale(dpr, dpr);
  }
  /**
   * 背景を描画
   */
  drawBackground(width, height) {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#16213e");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }
  /**
   * ブロックを描画（視覚効果強化版）
   */
  drawBlocks(blocks, currentTime, blockManager) {
    blocks.forEach((block) => {
      const state = blockManager.getBlockRecoveryState(block, currentTime);
      if (state.isDestroyed && state.alpha === 0) {
        return;
      }
      this.ctx.save();
      this.ctx.globalAlpha = state.alpha;
      this.ctx.fillStyle = block.color;
      this.ctx.fillRect(block.x, block.y, block.width, block.height);
      if (!block.text || block.text.length === 0) {
        if (state.alpha < 1) {
          const gradient = this.ctx.createLinearGradient(
            block.x,
            block.y,
            block.x,
            block.y + block.height
          );
          gradient.addColorStop(0, `rgba(255, 255, 255, ${0.3 * state.alpha})`);
          gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
          this.ctx.fillStyle = gradient;
          this.ctx.fillRect(block.x, block.y, block.width, block.height);
        }
        if (block.width > 3) {
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * state.alpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.strokeRect(block.x, block.y, block.width, block.height);
        }
      } else {
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * state.alpha})`;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(block.x, block.y, block.width, block.height);
        const gradient = this.ctx.createLinearGradient(
          block.x,
          block.y,
          block.x,
          block.y + block.height
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.2 * state.alpha})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(1, `rgba(0, 0, 0, ${0.1 * state.alpha})`);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(block.x, block.y, block.width, block.height);
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = `bold ${block.fontSize}px ${block.fontFamily}`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        const textX = block.x + block.width / 2;
        const textY = block.y + block.height / 2;
        let displayText = block.text;
        if (block.text.length > 10) {
          displayText = block.text.substring(0, 10) + "...";
        }
        this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.fillText(displayText, textX, textY);
      }
      this.ctx.restore();
    });
  }
  /**
   * ボールを描画
   */
  drawBall(ball) {
    this.ctx.save();
    this.ctx.fillStyle = "#FFD700";
    this.ctx.beginPath();
    this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    this.ctx.beginPath();
    this.ctx.arc(ball.x - ball.radius / 3, ball.y - ball.radius / 3, ball.radius / 3, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }
  /**
   * パドルを描画
   */
  drawPaddle(paddle) {
    this.ctx.save();
    const gradient = this.ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    gradient.addColorStop(0, "#D4D4D4");
    gradient.addColorStop(1, "#CCCCCC");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    this.ctx.strokeStyle = "#FFFFFF";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
    this.ctx.restore();
  }
  /**
   * パーティクルを描画
   */
  drawParticles(particles) {
    particles.forEach((particle) => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }
  /**
   * スコアテキストを描画
   */
  drawScore(score, x = 20, y = 30) {
    this.ctx.save();
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "bold 20px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Score: ${score}`, x, y);
    this.ctx.restore();
  }
  /**
   * ゲームオーバーテキストを描画
   */
  drawGameOver(width, height) {
    this.ctx.save();
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, width, height);
    const mainFontSize = Math.min(48, width * 0.12);
    const subFontSize = Math.min(24, width * 0.06);
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = `bold ${mainFontSize}px "Bitcount Prop Single"`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("THANKS FOR", width / 2, height / 2 - 60);
    this.ctx.fillText("CONNECTING!", width / 2, height / 2 - 60 + mainFontSize);
    this.ctx.font = `${subFontSize}px "Bitcount Prop Single"`;
    this.ctx.fillText("Tap or Press R to restart", width / 2, height / 2 + 20 + mainFontSize);
    this.ctx.restore();
  }
  /**
   * ゲームクリアテキストを描画
   */
  drawGameClear(width, height, score) {
    this.ctx.save();
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, width, height);
    const mainFontSize = Math.min(48, width * 0.12);
    const subFontSize = Math.min(24, width * 0.06);
    this.ctx.fillStyle = "#FFD700";
    this.ctx.font = `bold ${mainFontSize}px "Bitcount Prop Single"`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("PERFECT!", width / 2, height / 2 - 60);
    this.ctx.fillText("LET'S CONNECT!", width / 2, height / 2 - 60 + mainFontSize);
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = `${subFontSize}px "Bitcount Prop Single"`;
    this.ctx.fillText(`Final Score: ${score}`, width / 2, height / 2 - 60 + mainFontSize + 2 * subFontSize);
    this.ctx.font = `${subFontSize}px "Bitcount Prop Single"`;
    this.ctx.fillText("Tap or Press R to restart", width / 2, height / 2 - 60 + mainFontSize + 4 * subFontSize);
    this.ctx.restore();
  }
  /**
   * キャンバスをクリア
   */
  clear(width, height) {
    this.ctx.clearRect(0, 0, width, height);
  }
}
const DEFAULT_BUSINESS_CARD = {
  name: "山田　太郎",
  // 日本語
  // name: 'Müller Schmidt',   // ドイツ語
  // name: 'Владимир Петров',  // ロシア語（キリル文字）
  // name: '王小明',           // 中国語
  // name: '김민수',           // 韓国語
  // name: 'สมชาย วงศ์สุวรรณ', // タイ語
  // name: 'أحمد محمد',        // アラビア語  
  nameEn: "Taro Yamada",
  title: "Senior Software Engineer",
  tagline: "Building the future, one line at a time.",
  company: "Tech Solutions Inc.",
  email: "taro.yamada@example.com",
  phone: "+81-90-0000-0000",
  sns: "https://example.com/taroy",
  website: "https://www.example.com/"
};
const DEFAULT_GAME_CONFIG = {
  ballSpeed: 10,
  ballRadius: 12,
  paddleSpeed: 12,
  paddleWidthRatio: 0.4,
  paddleHeight: 4,
  gravity: 0,
  friction: 1,
  blockRecoveryTime: 1e4,
  effectDuration: 5e3,
  destructionRadius: 30
};
const DEFAULT_LAYOUT = "standard";
const ELEMENT_COLORS = {
  company: "#60A5FA",
  // 青（会社名）
  tagline: "#C084FC",
  // 紫（タグライン）
  name: "#F16584",
  // ピンク（氏名）- より鮮やかに
  nameEn: "#34D399",
  // 緑（英語名）- 青緑から緑に変更
  title: "#A78BFA",
  // 薄紫（役職）
  email: "#4ECDC4",
  // ターコイズ（メール）- 緑から移動
  phone: "#FB923C",
  // オレンジ（電話）
  sns: "#EC4899",
  // マゼンタ（SNS）- ピンクから差別化
  website: "#FBBF24"
  // 黄色（ウェブサイト）
};
class GameEngine {
  constructor(canvasElement, config) {
    __publicField(this, "canvas");
    __publicField(this, "config");
    __publicField(this, "ball");
    __publicField(this, "paddle");
    __publicField(this, "blockManager");
    __publicField(this, "particleSystem");
    __publicField(this, "renderer");
    __publicField(this, "gameRunning", false);
    __publicField(this, "gamePaused", false);
    __publicField(this, "gameOver", false);
    __publicField(this, "gameCleared", false);
    __publicField(this, "score", 0);
    __publicField(this, "animationFrameId", null);
    __publicField(this, "lastTime", 0);
    __publicField(this, "frameCount", 0);
    // フレームカウンター
    __publicField(this, "lastFpsUpdate", 0);
    // FPS更新時刻
    __publicField(this, "currentFps", 0);
    // 現在のFPS
    __publicField(this, "pointerX", 0);
    __publicField(this, "lastPointerMoveTime", 0);
    /**
     * メインゲームループ
     */
    __publicField(this, "gameLoop", () => {
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
      this.frameCount++;
      if (currentTime - this.lastFpsUpdate >= 1e3) {
        this.currentFps = Math.round(this.frameCount * 1e3 / (currentTime - this.lastFpsUpdate));
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
    });
    this.canvas = canvasElement;
    const logicalWidth = (config == null ? void 0 : config.width) || canvasElement.width;
    const logicalHeight = (config == null ? void 0 : config.height) || canvasElement.height;
    const paddleWidthRatio = (config == null ? void 0 : config.paddleWidthRatio) || 0.4;
    const calculatedPaddleWidth = Math.floor(logicalWidth * paddleWidthRatio);
    this.config = {
      width: logicalWidth,
      height: logicalHeight,
      paddleSpeed: 12,
      ballSpeed: 10,
      ballRadius: 12,
      paddleHeight: 4,
      paddleWidthRatio,
      paddleWidth: calculatedPaddleWidth,
      // ← 相対値（自動調整）,
      gravity: 0,
      friction: 1,
      blockRecoveryTime: 1e4,
      effectDuration: 5e3,
      destructionRadius: 30,
      dpr: 1,
      ...config
    };
    const dpr = this.config.dpr || 1;
    console.log("GameEngine.tsのdpr:", dpr);
    this.ball = new BallPhysics(
      this.config.width / 2,
      this.config.height / 2,
      this.config.ballRadius,
      this.config.ballSpeed
      // gravityではなくbaseSpeedを渡す
    );
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
  setupEventListeners() {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointerX = e.clientX - rect.left;
      this.lastPointerMoveTime = performance.now();
    });
    this.canvas.addEventListener("touchmove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointerX = e.touches[0].clientX - rect.left;
      this.lastPointerMoveTime = performance.now();
    });
    this.canvas.addEventListener("click", () => {
      if (!this.gameRunning && !this.gameOver && !this.gameCleared) {
        this.start();
      } else if (this.gameOver || this.gameCleared) {
        this.restart();
      }
    });
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      if (!this.gameRunning && !this.gameOver && !this.gameCleared) {
        this.start();
      } else if (this.gameOver || this.gameCleared) {
        this.restart();
      }
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "r" || e.key === "R") {
        if (this.gameOver || this.gameCleared) {
          this.restart();
        }
      }
      if (e.key === " ") {
        if (!this.gameRunning && !this.gameOver && !this.gameCleared) {
          this.start();
        } else if (this.gameRunning) {
          this.togglePause();
        }
      }
    });
    this.canvas.addEventListener("click", () => {
      if (!this.gameRunning && !this.gameOver && !this.gameCleared) {
        this.start();
      }
    });
  }
  /**
   * ポインター（マウス/タッチ）が最近動いたかチェック
   */
  isPointerActive() {
    return performance.now() - this.lastPointerMoveTime < 500;
  }
  /**
   * 名刺情報からゲームを初期化（レイアウト指定可能）
   */
  initializeWithBusinessCard(cardInfo, layout = "standard") {
    console.log("initializeWithBusinessCard called:", {
      layout,
      stackTrace: new Error().stack
      // ← 呼び出し元を確認
    });
    this.blockManager.createBlocksFromBusinessCard(
      cardInfo,
      this.config.width,
      this.config.height,
      1,
      //PixelSize
      layout
    );
    this.resetGameState();
  }
  /**
   * ゲームを開始
   */
  start() {
    if (this.gameRunning) return;
    this.gameRunning = true;
    this.gamePaused = false;
    const angle = (Math.random() - 0.5) * Math.PI / 2;
    this.ball.setVelocity(
      Math.cos(angle) * this.config.ballSpeed,
      -Math.abs(Math.sin(angle) * this.config.ballSpeed)
    );
    this.lastTime = performance.now();
    this.lastFpsUpdate = this.lastTime;
    this.frameCount = 0;
    this.gameLoop();
  }
  /**
   * ゲームを一時停止/再開
   */
  togglePause() {
    this.gamePaused = !this.gamePaused;
  }
  /**
   * ゲームをリスタート
   */
  restart() {
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
  resetGameState() {
    const ballX = this.config.width - 50;
    const ballY = 50;
    this.ball.reset(ballX, ballY);
    this.paddle.reset(
      this.config.width / 2 - this.config.paddleWidth / 2,
      this.config.height - this.config.paddleHeight - 1
    );
  }
  /**
  * ゲーム状態を更新（周辺ブロック破壊機能付き）
  */
  update(currentTime) {
    this.paddle.update(this.config.width, this.config.paddleSpeed);
    if (this.isPointerActive() && !this.paddle.isKeyboardActive()) {
      this.paddle.updateFromPointer(this.pointerX, this.config.width);
    }
    this.ball.update();
    this.ball.checkWallCollision(this.config.width, this.config.height);
    this.ball.checkPaddleCollision(
      this.paddle.getPaddle().x,
      this.paddle.getPaddle().y,
      this.paddle.getPaddle().width,
      this.paddle.getPaddle().height
    );
    this.blockManager.updateBlockRecovery(currentTime);
    const blockIndex = this.blockManager.checkCollision(
      this.ball.getBall().x,
      this.ball.getBall().y,
      this.ball.getBall().radius
    );
    if (blockIndex !== -1) {
      const block = this.blockManager.getBlocks()[blockIndex];
      if (!block.isDestroyed) {
        this.blockManager.destroyBlock(blockIndex, currentTime);
        this.particleSystem.createBlockDestructionEffect(
          block.x + block.width / 2,
          block.y + block.height / 2,
          block.color,
          15
        );
        this.score += 10;
        this.destroyNearbyBlocks(
          this.ball.getBall().x,
          this.ball.getBall().y,
          this.ball.getBall().radius * 0.5,
          // ボール半径の2.5倍の範囲
          currentTime
        );
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
    this.particleSystem.update();
    if (this.ball.getBall().y > this.config.height + 50) {
      this.gameOver = true;
      this.gameRunning = false;
    }
    if (this.blockManager.allBlocksDestroyed()) {
      this.gameCleared = true;
      this.gameRunning = false;
    }
  }
  /**
   * 指定位置の周辺ブロックを破壊
   */
  destroyNearbyBlocks(centerX, centerY, radius, currentTime) {
    const blocks = this.blockManager.getBlocks();
    blocks.forEach((block, index) => {
      if (block.isDestroyed) return;
      const blockCenterX = block.x + block.width / 2;
      const blockCenterY = block.y + block.height / 2;
      const dx = blockCenterX - centerX;
      const dy = blockCenterY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < radius * 2) {
        this.blockManager.destroyBlock(index, currentTime);
        if (Math.random() < 0.3) {
          this.particleSystem.createBlockDestructionEffect(
            blockCenterX,
            blockCenterY,
            block.color,
            3
          );
        }
        this.score += 5;
      }
    });
  }
  /**
   * ゲームを描画
   */
  render() {
    this.renderer.clear(this.config.width, this.config.height);
    this.renderer.drawBackground(this.config.width, this.config.height);
    const currentTime = performance.now();
    this.renderer.drawBlocks(
      this.blockManager.getBlocks(),
      currentTime,
      this.blockManager
    );
    this.renderer.drawBall(this.ball.getBall());
    this.renderer.drawPaddle(this.paddle.getPaddle());
    this.renderer.drawParticles(this.particleSystem.getParticles());
    this.renderer.drawScore(this.score);
    if (this.gameOver) {
      this.renderer.drawGameOver(this.config.width, this.config.height);
    } else if (this.gameCleared) {
      this.renderer.drawGameClear(this.config.width, this.config.height, this.score);
    }
  }
  /**
   * ゲームを停止
   */
  stop() {
    this.gameRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
  /**
   * スコアを取得
   */
  getScore() {
    return this.score;
  }
  /**
   * ゲーム状態を取得
   */
  getGameState() {
    return {
      running: this.gameRunning,
      paused: this.gamePaused,
      gameOver: this.gameOver,
      cleared: this.gameCleared
    };
  }
}
function initializeGame(containerId, businessCard, gameConfig, layout = "standard", autoStart = false) {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container with ID "${containerId}" not found`);
  }
  const businessCardRatio = 91 / 55;
  const minWidth = 320;
  const maxWidth = 910;
  let containerWidth = container.clientWidth || 600;
  containerWidth = Math.max(minWidth, Math.min(maxWidth, containerWidth));
  let cssWidth = containerWidth;
  let cssHeight = containerWidth / businessCardRatio;
  if (!container.style.height || container.style.height === "0px") {
    container.style.height = `${cssHeight}px`;
  }
  cssWidth = Math.floor(cssWidth / 8) * 8;
  cssHeight = Math.floor(cssHeight / 8) * 8;
  const dpr = window.devicePixelRatio || 1;
  const physicalWidth = Math.floor(cssWidth * dpr / 8) * 8;
  const physicalHeight = Math.floor(cssHeight * dpr / 8) * 8;
  const canvas = document.createElement("canvas");
  canvas.width = physicalWidth;
  canvas.height = physicalHeight;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.style.display = "block";
  canvas.style.backgroundColor = "#1a1a2e";
  canvas.style.borderRadius = "8px";
  canvas.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.3)";
  canvas.style.margin = "0 auto";
  container.appendChild(canvas);
  const mergedConfig = {
    ...DEFAULT_GAME_CONFIG,
    ...gameConfig,
    width: cssWidth,
    // ← 論理ピクセル（ゲームロジック用）
    height: cssHeight,
    // ← 論理ピクセル（ゲームロジック用）
    dpr
    // ← レンダラーで使用
  };
  console.log("index.tsのdpr:", dpr);
  const gameEngine = new GameEngine(canvas, mergedConfig);
  const cardInfo = {
    ...DEFAULT_BUSINESS_CARD,
    ...businessCard
  };
  gameEngine.initializeWithBusinessCard(cardInfo, layout);
  if (autoStart) {
    gameEngine.start();
  }
  return gameEngine;
}
function initializeGameWithCanvas(canvas, businessCardInfo, config) {
  const gameEngine = new GameEngine(canvas, config);
  gameEngine.initializeWithBusinessCard(businessCardInfo);
  return gameEngine;
}
export {
  BallPhysics,
  BlockManager,
  DEFAULT_BUSINESS_CARD,
  DEFAULT_GAME_CONFIG,
  DEFAULT_LAYOUT,
  GameEngine,
  PaddleController,
  ParticleSystem,
  Renderer,
  initializeGame,
  initializeGameWithCanvas
};
