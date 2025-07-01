import type { ExcelSheet } from "../Excellsheet";
import type { MouseStrategy } from "./MouseHandlerStrategy/MouseStrategy";
import { ResizeStrategy } from "./MouseHandlerStrategy/ResizeStrategy";
import { SelectionStrategy } from "./MouseHandlerStrategy/SelectionStrategy";
import { CursorStrategy } from "./MouseHandlerStrategy/CursorStrategy";

/**
 * Class for handling mouse events
 * @member activeStrategy - The currently active mouse strategy.
 * @member cursorStrategy - The strategy for handling cursor interactions.
 */
export class MouseHandler {
    private activeStrategy: MouseStrategy | null = null;
    private cursorStrategy: CursorStrategy;

    /**
     * Constructor
     * @param sheet Reference to the sheet 
     */
    constructor(private sheet: ExcelSheet) {
        this.cursorStrategy = new CursorStrategy(sheet);
        this.attachEvents();
    }

    /**
     * To set the strategy
     * @param strategy Strategy to set
     */
    private setStrategy(strategy: MouseStrategy) {
        this.activeStrategy = strategy;
    }

    /**
     * To attach events to the container
     */
    private attachEvents() {
        const container = this.sheet.container;

        container.addEventListener("pointerdown", (e) => {
            const strategy = this.detectStrategy(e);
            this.setStrategy(strategy);
            strategy.onPointerDown(e);
        });

        window.addEventListener("pointermove", (e) => {
            e.preventDefault();
            this.cursorStrategy.handle(e); 
            if(this.activeStrategy !== null) this.activeStrategy.onPointerMove(e); 
        });

        window.addEventListener("pointerup", (e) => {
            if(this.activeStrategy !== null) this.activeStrategy?.onPointerUp(e);
            this.activeStrategy = null;
        });
    }

    /**
     * Detect the strategy based on the mouse position 
     * @param e Mouse event
     * @returns Strategy to use
     */
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
