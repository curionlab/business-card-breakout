import { Particle } from './types';
export declare class ParticleSystem {
    private particles;
    getParticles(): Particle[];
    /**
     * ブロック破壊時のパーティクルを生成
     */
    createBlockDestructionEffect(x: number, y: number, color: string, count?: number): void;
    /**
     * 衝撃波エフェクトを生成
     */
    createImpactEffect(x: number, y: number, color: string, count?: number): void;
    /**
     * パーティクルを更新
     */
    update(): void;
    /**
     * パーティクルをクリア
     */
    clear(): void;
}
//# sourceMappingURL=ParticleSystem.d.ts.map