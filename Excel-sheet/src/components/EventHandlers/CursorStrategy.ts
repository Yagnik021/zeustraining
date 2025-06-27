import type { ExcelSheet } from "../Excellsheet";

export class CursorStrategy {
    constructor(private sheet: ExcelSheet) { }

    handle(e: MouseEvent) {
        const rect = this.sheet.canvas.getBoundingClientRect();
        const dpr = this.sheet.dpr;
        const rawX = (e.clientX - rect.left) / dpr;
        const rawY = (e.clientY - rect.top) / dpr;

        const x = rawX + this.sheet.container.scrollLeft - this.sheet.rowHeaderWidth;
        const y = rawY + this.sheet.container.scrollTop - this.sheet.colHeaderHeight;

        const hoverCol = this.sheet.getColIndexFromX(x);
        const hoverRow = this.sheet.getRowIndexFromY(y);

        const colRightEdge = this.sheet.columns
            .slice(0, hoverCol + 1)
            .reduce((sum, col) => sum + col.width, 0);
        const rowBottomEdge = this.sheet.rows
            .slice(0, hoverRow + 1)
            .reduce((sum, row) => sum + row.height, 0);

        const withinColResizeZone = Math.abs(x - colRightEdge) < 5;
        const withinRowResizeZone = Math.abs(y - rowBottomEdge) < 5;

        const scaledClientX = (e.clientX - rect.left) / dpr;
        const scaledClientY = (e.clientY - rect.top) / dpr;

        if (scaledClientX < 0 || scaledClientY < 0) {
            this.sheet.container.style.cursor = "default";
            this.sheet.resizeTarget = null;
            return;
        }

        if (!this.sheet.isResizing) {
            if (withinColResizeZone && scaledClientY <= this.sheet.colHeaderHeight) {
                this.sheet.container.style.cursor = "ew-resize";
                this.sheet.resizeTarget = { type: "column", index: hoverCol };
            } else if (withinRowResizeZone && scaledClientX <= this.sheet.rowHeaderWidth) {
                this.sheet.container.style.cursor = "ns-resize";
                this.sheet.resizeTarget = { type: "row", index: hoverRow };
            } else {
                this.sheet.container.style.cursor = "cell";
                this.sheet.resizeTarget = null;
            }
        }
    }
}

