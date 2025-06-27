export interface MouseStrategy {
    onPointerDown(e: MouseEvent): void;
    onPointerMove(e: MouseEvent): void;
    onPointerUp(e: MouseEvent): void;
}
