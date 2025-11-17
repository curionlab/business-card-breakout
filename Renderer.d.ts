import { Block, Ball, Paddle, Particle } from './types';
export declare class Renderer {
    private ctx;
    constructor(canvas: HTMLCanvasElement, dpr?: number);
    /**
     * 背景を描画
     */
    drawBackground(width: number, height: number): void;
    /**
     * ブロックを描画（視覚効果強化版）
     */
    drawBlocks(blocks: Block[], currentTime: number, blockManager: any): void;
    /**
     * ボールを描画
     */
    drawBall(ball: Ball): void;
    /**
     * パドルを描画
     */
    drawPaddle(paddle: Paddle): void;
    /**
     * パーティクルを描画
     */
    drawParticles(particles: Particle[]): void;
    /**
     * スコアテキストを描画
     */
    drawScore(score: number, x?: number, y?: number): void;
    /**
     * ゲームオーバーテキストを描画
     */
    drawGameOver(width: number, height: number): void;
    /**
     * ゲームクリアテキストを描画
     */
    drawGameClear(width: number, height: number, score: number): void;
    /**
     * キャンバスをクリア
     */
    clear(width: number, height: number): void;
}
//# sourceMappingURL=Renderer.d.ts.map