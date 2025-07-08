import { ResizeCommand } from "../../Commands/ResizeCommand";
import type { ExcelSheet } from "../../Excellsheet";
import type { MouseStrategy } from "./MouseStrategy";

class ColumnResizeStrategy implements MouseStrategy {
    private originalWidth: number = 0;
    private resizeColIndex: number | null = null;
    private animationFrameId: number | null = null;
    constructor(private sheet: ExcelSheet) { }

    onPointerDown(e: MouseEvent): void {

        if (this.resizeColIndex === null) return;

        this.sheet.isResizing = true;
        this.sheet.resizeStartPos = { x: e.clientX, y: e.clientY };
        this.originalWidth = this.sheet.columns[this.resizeColIndex].width;
    }

    onPointerMove(e: MouseEvent): void {
        if (!this.sheet.isResizing) return;

        
        if (this.resizeColIndex === null) return;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

        this.animationFrameId = requestAnimationFrame(() => {
            const deltaX = e.clientX - this.sheet.resizeStartPos.x;
            const col = this.sheet.columns[this.resizeColIndex!];
            col.width = Math.max(50, this.originalWidth + deltaX);

            this.sheet.updateCumulativeSizes();

            const scrollLeft = this.sheet.container.scrollLeft;
            const viewportWidth = this.sheet.canvas.width;
            const startCol = this.sheet.getColIndexFromX(scrollLeft);
            const endCol = this.sheet.getColIndexFromX(scrollLeft + viewportWidth);
            const columnPosition = this.sheet.cumulativeColWidths[this.resizeColIndex!] - scrollLeft + this.sheet.rowHeaderWidth;

            this.sheet.drawColumnHeaders(startCol, endCol, scrollLeft);                         

            this.sheet.ctx.beginPath();
            this.sheet.ctx.strokeStyle = "#137E43";
            this.sheet.ctx.moveTo(columnPosition, this.sheet.colHeaderHeight);
            this.sheet.ctx.lineTo(columnPosition, this.sheet.canvas.height);
            this.sheet.ctx.stroke();
        });
    }

    onPointerUp(e: MouseEvent): void {
        if (!this.sheet.isResizing) return;

        const finalWidth = this.sheet.columns[this.resizeColIndex!].width;
        if (finalWidth !== this.originalWidth) {
            const resizeCommand = new ResizeCommand(
                this.sheet,
                "column",
                this.resizeColIndex!,
                finalWidth,
                this.originalWidth
            );
            this.sheet.commandManager.executeCommand(resizeCommand);
        }

        this.sheet.isResizing = false;
        this.sheet.resizeTarget = null;
    }

    hitTest(e: PointerEvent): boolean {
        const rect = this.sheet.canvas.getBoundingClientRect();
        const rawX = (e.clientX - rect.left) / this.sheet.dpr;
        const x = rawX + this.sheet.container.scrollLeft - this.sheet.rowHeaderWidth;

        let cumulativeWidth = 0;

        for (let colIndex = 0; colIndex < this.sheet.columns.length; colIndex++) {
            cumulativeWidth += this.sheet.columns[colIndex].width;
            const scaledClientY = (e.clientY - rect.top) / this.sheet.dpr;
            if (Math.abs(cumulativeWidth - x) <= 4 && scaledClientY < this.sheet.colHeaderHeight) {
                this.resizeColIndex = colIndex;
                return true;
            }
        }

        return false;
    }
}

export { ColumnResizeStrategy };
