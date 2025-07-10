/**
 * Interface for mouse event handlers
 */
export interface MouseStrategy {
    onPointerDown(e: MouseEvent): void;
    onPointerMove(e: MouseEvent): void;
    onPointerUp(e: MouseEvent): void;
    hitTest(e: MouseEvent): boolean;
    setCursor(): void;
}
