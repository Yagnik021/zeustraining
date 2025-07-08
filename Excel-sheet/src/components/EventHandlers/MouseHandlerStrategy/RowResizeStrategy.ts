import { ResizeCommand } from "../../Commands/ResizeCommand";
import type { ExcelSheet } from "../../Excellsheet";
import type { MouseStrategy } from "./MouseStrategy";

/**
 * Strategy class for handling row resizing via mouse.
 */
class RowResizeStrategy implements MouseStrategy {
    private originalHeight: number = 0;
    private resizeRowIndex: number | null = null;

    constructor(private sheet: ExcelSheet) { }

    onPointerDown(e: MouseEvent): void {
        if (this.resizeRowIndex === null) return;

        this.sheet.isResizing = true;
        this.sheet.resizeStartPos = { x: e.clientX, y: e.clientY };
        this.originalHeight = this.sheet.rows[this.resizeRowIndex].height;
    }

    onPointerMove(e: MouseEvent): void {
        if (!this.sheet.isResizing || this.resizeRowIndex === null) return;
        const deltaY = e.clientY - this.sheet.resizeStartPos.y;
        const row = this.sheet.rows[this.resizeRowIndex];
        row.height = Math.max(30, this.originalHeight + deltaY);

        this.sheet.updateCumulativeSizes();
        this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
    }


    onPointerUp(e: MouseEvent): void {
        if (!this.sheet.isResizing) return;

        const finalHeight = this.sheet.rows[this.resizeRowIndex!].height;
        if (finalHeight !== this.originalHeight) {
            const resizeCommand = new ResizeCommand(
                this.sheet,
                "row",
                this.resizeRowIndex!,
                finalHeight,
                this.originalHeight
            );
            this.sheet.commandManager.executeCommand(resizeCommand);
        }

        this.sheet.isResizing = false;
        this.sheet.resizeTarget = null;
    }

    hitTest(e: MouseEvent): boolean {
        const rect = this.sheet.canvas.getBoundingClientRect();
        const rawY = (e.clientY - rect.top) / this.sheet.dpr;
        const y = rawY + this.sheet.container.scrollTop - this.sheet.colHeaderHeight;

        for (let i = 0; i < this.sheet.rows.length; i++) {
            const bottom = this.sheet.cumulativeRowHeights[i];
            const scaledClientX = (e.clientX - rect.left) / this.sheet.dpr;
            if (Math.abs(bottom - y) <= 4 && scaledClientX < this.sheet.rowHeaderWidth) {
                this.resizeRowIndex = i;
                return true;
            }
        }

        return false;
    }
}

export { RowResizeStrategy };
