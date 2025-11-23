import { Block, Ball, Paddle, Particle } from './types';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  //private canvas: HTMLCanvasElement;
  //private dpr: number;

  constructor(canvas: HTMLCanvasElement, dpr: number = 1) {
    //this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = ctx;
    //this.dpr = dpr;

    // 描画コンテキストをスケール
    this.ctx.scale(dpr, dpr);
  }

  /**
   * 背景を描画
   */
  drawBackground(width: number, height: number): void {
    // グラデーション背景
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * ブロックを描画（視覚効果強化版）
   */
  drawBlocks(blocks: Block[], currentTime: number, blockManager: any): void {
    blocks.forEach(block => {
      // BlockManagerから復活状態を取得
      const state = blockManager.getBlockRecoveryState(block, currentTime);
      
      // 完全に消えている場合は描画しない
      if (state.isDestroyed && state.alpha === 0) {
        return;
      }

      this.ctx.save();
      
      // フェードイン効果
      this.ctx.globalAlpha = state.alpha;

      // ブロック背景
      this.ctx.fillStyle = block.color;
      this.ctx.fillRect(block.x, block.y, block.width, block.height);

      // ピクセルブロック（text が空）の場合
      if (!block.text || block.text.length === 0) {
        // 微細な光沢効果（復活中は強調）
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
        
        // 微細な枠線（ブロックが大きい場合のみ）
        if (block.width > 3) {
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * state.alpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.strokeRect(block.x, block.y, block.width, block.height);
        }
      } else {
        // 通常のテキストブロック
        // ブロック枠線
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * state.alpha})`;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(block.x, block.y, block.width, block.height);

        // 光沢効果
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

        // テキスト
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `bold ${block.fontSize}px ${block.fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const textX = block.x + block.width / 2;
        const textY = block.y + block.height / 2;

        // テキストが長い場合は省略
        let displayText = block.text;
        if (block.text.length > 10) {
          displayText = block.text.substring(0, 10) + '...';
        }

        // テキストに影をつける
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
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
  drawBall(ball: Ball): void {
    this.ctx.save();
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // ボールの光沢
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.beginPath();
    this.ctx.arc(ball.x - ball.radius / 3, ball.y - ball.radius / 3, ball.radius / 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * パドルを描画
   */
  drawPaddle(paddle: Paddle): void {
    this.ctx.save();

    // グラデーション
    const gradient = this.ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    gradient.addColorStop(0, '#D4D4D4');
    gradient.addColorStop(1, '#CCCCCC');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // 枠線
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);

    this.ctx.restore();
  }

  /**
   * パーティクルを描画
   */
  drawParticles(particles: Particle[]): void {
    particles.forEach(particle => {
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
  drawScore(score: number, width: number, height: number, x: number = 20, y: number = 30): void {
    this.ctx.save();
    this.ctx.fillStyle = '#FFFFFF';
    const fontSize = height * 0.05;
    this.ctx.font = `${fontSize}px "Bitcount Prop Single"`;
    this.ctx.textAlign = 'left';
    x = width * 0.02;
    y = height * 0.05;
    this.ctx.fillText(`Score: ${score}`, x, y);
    this.ctx.restore();
  }

  /**
   * ゲームオーバーテキストを描画
   */
  drawGameOver(width: number, height: number, score: number): void {
    this.ctx.save();

    // 半透明のオーバーレイ
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, width, height);

    // 画面幅に応じたフォントサイズを計算
    const mainFontSize = Math.min(48, width * 0.12); // 画面幅の12%、最大48px
    const subFontSize = Math.min(24, width * 0.06);  // 画面幅の6%、最大24px

    // メインテキスト
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = `bold ${mainFontSize}px "Bitcount Prop Single"`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('THANKS FOR', width / 2, height / 2 - 60);
    this.ctx.fillText('CONNECTING!', width / 2, height / 2 - 60 + mainFontSize);

    this.ctx.font = `${subFontSize}px "Bitcount Prop Single"`;
    this.ctx.fillText(`Score: ${score}`, width / 2, height / 2 - 60 + mainFontSize + 2 * subFontSize);
    // サブテキスト
    this.ctx.font = `${subFontSize}px "Bitcount Prop Single"`;
    this.ctx.fillText('Tap or Press R to restart', width / 2, height / 2 + mainFontSize + 4  + mainFontSize);

    this.ctx.restore();
  }

  /**
   * ゲームクリアテキストを描画
   */
  drawGameClear(width: number, height: number, score: number): void {
    this.ctx.save();

    // 半透明のオーバーレイ
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, width, height);

    // 画面幅に応じたフォントサイズを計算
    const mainFontSize = Math.min(48, width * 0.12); // 画面幅の12%、最大48px
    const subFontSize = Math.min(24, width * 0.06);  // 画面幅の6%、最大24px
    
    // テキスト
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = `bold ${mainFontSize}px "Bitcount Prop Single"`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('PERFECT!', width / 2, height / 2 - 60);
    this.ctx.fillText("LET'S CONNECT!", width / 2, height / 2 - 60 + mainFontSize);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = `${subFontSize}px "Bitcount Prop Single"`;
    this.ctx.fillText(`Final Score: ${score}`, width / 2, height / 2 - 60 + mainFontSize + 2 * subFontSize);
    this.ctx.font = `${subFontSize}px "Bitcount Prop Single"`;
    this.ctx.fillText('Tap or Press R to restart', width / 2, height / 2 - 60 + mainFontSize + 4 * subFontSize);

    this.ctx.restore();
  }

  /**
   * キャンバスをクリア
   */
  clear(width: number, height: number): void {
    this.ctx.clearRect(0, 0, width, height);
  }
}
