import type { ExcelSheet } from "../../Excellsheet";

/**
 * Mouse handler strategy for cursor
 * @exports CursorStrategy
 */
export class CursorStrategy {
    constructor(private sheet: ExcelSheet) { }

    /**
     * Handle mouse event
     * @param e Mouse event
     */
    handle(e: MouseEvent) {
        const rect = this.sheet.canvas.getBoundingClientRect();
        const dpr = this.sheet.dpr;
        const rawX = (e.clientX - rect.left) / dpr;
        const rawY = (e.clientY - rect.top) / dpr;

        const x = rawX + this.sheet.container.scrollLeft - this.sheet.rowHeaderWidth;
        const y = rawY + this.sheet.container.scrollTop - this.sheet.colHeaderHeight;

        const hoverCol = this.sheet.getColIndexFromX(x);
        const hoverRow = this.sheet.getRowIndexFromY(y);

        const colRightEdge = this.sheet.cumulativeColWidths[hoverCol] ?? 0;
        const rowBottomEdge = this.sheet.cumulativeRowHeights[hoverRow] ?? 0;

        const withinColResizeZone = Math.abs(x - colRightEdge) < 5;
        const withinRowResizeZone = Math.abs(y - rowBottomEdge) < 5;

        if (rawX < 0 || rawY < 0) {
            this.sheet.container.style.cursor = "default";
            this.sheet.resizeTarget = null;
            return;
        }

        if (!this.sheet.isResizing) {
            if (withinColResizeZone && rawY <= this.sheet.colHeaderHeight) {
                if(this.sheet.container.style.cursor !== "ew-resize") this.sheet.container.style.cursor = "ew-resize";
                this.sheet.resizeTarget = { type: "column", index: hoverCol };
            } else if (withinRowResizeZone && rawX <= this.sheet.rowHeaderWidth) {
                if(this.sheet.container.style.cursor !== "ns-resize") this.sheet.container.style.cursor = "ns-resize";
                this.sheet.resizeTarget = { type: "row", index: hoverRow };
            } else {
                if(this.sheet.container.style.cursor !== "cell") this.sheet.container.style.cursor = "cell";
                this.sheet.resizeTarget = null;
            }
        }
    }
}

