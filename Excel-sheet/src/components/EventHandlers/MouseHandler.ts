import type { ExcelSheet } from "../Excellsheet";
import type { MouseStrategy } from "./MouseHandlerStrategy/MouseStrategy";
import { ResizeStrategy } from "./MouseHandlerStrategy/ResizeStrategy";
import { SelectionStrategy } from "./MouseHandlerStrategy/SelectionStrategy";
import { CursorStrategy } from "./MouseHandlerStrategy/CursorStrategy";

export class MouseHandler {
    private activeStrategy: MouseStrategy | null = null;
    private cursorStrategy: CursorStrategy;

    constructor(private sheet: ExcelSheet) {
        this.cursorStrategy = new CursorStrategy(sheet);
        this.attachEvents();
    }

    private setStrategy(strategy: MouseStrategy) {
        this.activeStrategy = strategy;
    }

    private attachEvents() {
        const container = this.sheet.container;

        container.addEventListener("pointerdown", (e) => {
            const strategy = this.detectStrategy(e);
            this.setStrategy(strategy);
            strategy.onPointerDown(e);
        });

        container.addEventListener("pointermove", (e) => {
            this.cursorStrategy.handle(e); 
            this.activeStrategy?.onPointerMove(e); 
        });

        window.addEventListener("pointerup", (e) => {
            this.activeStrategy?.onPointerUp(e);
            this.activeStrategy = null;
        });
    }

    private detectStrategy(e: MouseEvent): MouseStrategy {
        const rect = this.sheet.canvas.getBoundingClientRect();
        const dpr = this.sheet.dpr;

        const rawX = (e.clientX - rect.left) / dpr;
        const rawY = (e.clientY - rect.top) / dpr;

        const x = rawX + this.sheet.container.scrollLeft - this.sheet.rowHeaderWidth;
        const y = rawY + this.sheet.container.scrollTop - this.sheet.colHeaderHeight;

        const col = this.sheet.getColIndexFromX(x);
        const row = this.sheet.getRowIndexFromY(y);

        const colRightEdge = this.sheet.cumulativeColWidths[col] ?? 0;
        const rowBottomEdge = this.sheet.cumulativeRowHeights[row] ?? 0;

        const withinColResizeZone = Math.abs(x - colRightEdge) < 5;
        const withinRowResizeZone = Math.abs(y - rowBottomEdge) < 5;

        const scaledClientX = (e.clientX - rect.left) / dpr;
        const scaledClientY = (e.clientY - rect.top) / dpr;

        if (withinColResizeZone && scaledClientY <= this.sheet.colHeaderHeight) {
            return new ResizeStrategy(this.sheet, "column", col);
        }

        if (withinRowResizeZone && scaledClientX <= this.sheet.rowHeaderWidth) {
            return new ResizeStrategy(this.sheet, "row", row);
        }

        return new SelectionStrategy(this.sheet, row, col);
    }
}
