import { Block, BusinessCardInfo } from './types';
export type CardLayout = 'standard' | 'professional' | 'minimal';
export declare class BlockManager {
    private blocks;
    private blockRecoveryTime;
    private blockFadeInTime;
    private dpr;
    private elementColors;
    constructor(blockRecoveryTime?: number, blockFadeInTime?: number, dpr?: number, elementColors?: {
        [key: string]: string;
    });
    getBlocks(): Block[];
    /**
     * フォントサイズを計算(DPR反映し、CSS理論解像度→物理解像度)
     */
    private calculateFontSize;
    /**
     * キャンバスサイズを計算(DPR反映し、CSS理論解像度→物理解像度)
     */
    private calculateCanvasSize;
    /**
     * テキストを描画し、横幅に収める（高さは維持）
     */
    private drawTextFitToWidth;
    /**
     * テキストに応じたフォントファミリーを取得
     */
    private getFontFamily;
    /**
     * 標準レイアウト（横幅フィット対応）
     */
    private createStandardLayout;
    /**
     * Professionalレイアウト（言語別フォント対応）
     */
    private createProfessionalLayout;
    /**
     * ミニマルレイアウト（横幅フィット対応）
     */
    private createMinimalLayout;
    /**
     * 名刺情報からピクセル単位のブロックを生成（レイアウト選択可能）
     */
    createBlocksFromBusinessCard(cardInfo: BusinessCardInfo, canvasWidth: number, // CSS論理ピクセル
    canvasHeight: number, // CSS論理ピクセル
    pixelSize?: number, layout?: CardLayout): void;
    /**
     * キャンバスからブロックを生成
     */
    private generateBlocksFromCanvas;
    destroyBlock(index: number, currentTime: number): boolean;
    getBlockRecoveryState(block: Block, currentTime: number): {
        isDestroyed: boolean;
        alpha: number;
    };
    updateBlockRecovery(currentTime: number): void;
    checkCollision(ballX: number, ballY: number, ballRadius: number): number;
    allBlocksDestroyed(): boolean;
    reset(): void;
    setBlockRecoveryTime(time: number): void;
    setBlockFadeInTime(time: number): void;
}
//# sourceMappingURL=BlockManager.d.ts.map