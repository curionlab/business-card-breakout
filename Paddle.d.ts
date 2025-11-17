import { Paddle } from './types';
export declare class PaddleController {
    private paddle;
    private keysPressed;
    private lastKeyPressTime;
    constructor(x: number, y: number, width: number, height: number, _speed?: number);
    getPaddle(): Paddle;
    getWidth(): number;
    private setupKeyListeners;
    /**
     * キーボードが最近使われたかチェック（500ms以内）
     */
    isKeyboardActive(): boolean;
    update(canvasWidth: number, paddleSpeed: number): void;
    updateFromPointer(pointerX: number, canvasWidth: number): void;
    reset(x: number, y: number): void;
}
//# sourceMappingURL=Paddle.d.ts.map