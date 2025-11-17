import { Ball } from './types';
export declare class BallPhysics {
    private ball;
    private baseSpeed;
    constructor(x: number, y: number, radius: number, baseSpeed?: number);
    getBall(): Ball;
    update(): void;
    setVelocity(vx: number, vy: number): void;
    checkWallCollision(width: number, _height: number): void;
    reset(x: number, y: number): void;
    checkPaddleCollision(paddleX: number, paddleY: number, paddleWidth: number, paddleHeight: number): boolean;
    checkBlockCollision(blockX: number, blockY: number, blockWidth: number, blockHeight: number): {
        collided: boolean;
        normal: {
            x: number;
            y: number;
        };
    };
}
//# sourceMappingURL=Ball.d.ts.map