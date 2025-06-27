import { ResizeCommand } from "../../Commands/ResizeCommand";
import type { ExcelSheet } from "../../Excellsheet";
import type { MouseStrategy } from "./MouseStrategy";

class ResizeStrategy implements MouseStrategy {
    private originalSize: number = 0;

    constructor(private sheet: ExcelSheet, private type: "row" | "column", private index: number) { }

    onPointerDown(e: MouseEvent): void {
        const rect = this.sheet.canvas.getBoundingClientRect();
        const dpr = this.sheet.dpr;
        const rawX = (e.clientX - rect.left) / dpr;
        const rawY = (e.clientY - rect.top) / dpr;

        const x = rawX + this.sheet.container.scrollLeft - this.sheet.rowHeaderWidth;
        const y = rawY + this.sheet.container.scrollTop - this.sheet.colHeaderHeight;

        this.sheet.isResizing = true;
        this.sheet.resizeStartPos = { x: e.clientX, y: e.clientY };

        if (this.type === "column") {
            this.originalSize = this.sheet.columns[this.index].width;
        } else {
            this.originalSize = this.sheet.rows[this.index].height;
        }
    }

    onPointerMove(e: MouseEvent): void {
        if (!this.sheet.isResizing) return;

        const deltaX = e.clientX - this.sheet.resizeStartPos.x;
        const deltaY = e.clientY - this.sheet.resizeStartPos.y;

        if (this.type === "column") {
            const col = this.sheet.columns[this.index];
            col.width = Math.max(50, col.width + deltaX);
        } else if (this.type === "row") {
            const row = this.sheet.rows[this.index];
            row.height = Math.max(30, row.height + deltaY);
        }

        this.sheet.resizeStartPos = { x: e.clientX, y: e.clientY };
        this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
    }

    onPointerUp(e: MouseEvent): void {
        if (!this.sheet.isResizing) return;

        const finalSize =
            this.type === "column"
                ? this.sheet.columns[this.index].width
                : this.sheet.rows[this.index].height;

        if (finalSize !== this.originalSize) {
            const resizeCommand = new ResizeCommand(
                this.sheet,
                this.type,
                this.index,
                finalSize,
                this.originalSize
            );
            this.sheet.commandManager.executeCommand(resizeCommand);
        }

        this.sheet.isResizing = false;
        this.sheet.resizeTarget = null;
    }
}

export { ResizeStrategy };
