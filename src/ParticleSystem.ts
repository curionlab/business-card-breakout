import { Particle } from './types';

export class ParticleSystem {
  private particles: Particle[] = [];

  getParticles(): Particle[] {
    return this.particles;
  }

  /**
   * ブロック破壊時のパーティクルを生成
   */
  createBlockDestructionEffect(x: number, y: number, color: string, count: number = 12): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
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
  createImpactEffect(x: number, y: number, color: string, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
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
  update(): void {
    this.particles = this.particles.filter(particle => {
      particle.life -= 0.05;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2; // 重力
      particle.vx *= 0.98; // 摩擦

      return particle.life > 0;
    });
  }

  /**
   * パーティクルをクリア
   */
  clear(): void {
    this.particles = [];
  }
}
