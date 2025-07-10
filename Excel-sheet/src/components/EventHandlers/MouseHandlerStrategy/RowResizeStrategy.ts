import { ResizeCommand } from "../../Commands/ResizeCommand";
import type { ExcelSheet } from "../../Excellsheet";
import type { MouseStrategy } from "./MouseStrategy";

/**
 * Strategy class for handling row resizing via mouse.
 * @member originalHeight - The original height of the resized row.
 * @member resizeRowIndex - The index of the row currently being resized.
 * @member resizeLine - The div element used to display the resize line.
 */
class RowResizeStrategy implements MouseStrategy {
    private originalHeight: number = 0;
    private resizeRowIndex: number | null = null;
    private resizeLine: HTMLDivElement;

    /**
     * Constructor for the RowResizeStrategy class.
     * @param sheet Refrence to the sheet
     */
    constructor(private sheet: ExcelSheet) {

        this.resizeLine = document.createElement("div");
        this.resizeLine.style.position = "absolute";
        this.resizeLine.style.left = `${this.sheet.rowHeaderWidth}px`;
        this.resizeLine.style.bottom = "0";
        this.resizeLine.style.borderTop = "2px dashed #137E43";
        this.resizeLine.style.zIndex = "9999";
        this.resizeLine.style.pointerEvents = "none"; // don't interfere with mouse
        this.resizeLine.style.display = "none"; // hide initially
        this.sheet.container.appendChild(this.resizeLine);
    }

    /**
     * Processes the pointer down event for row resizing.
     * @param e Mouse event
     */
    onPointerDown(e: MouseEvent): void {
        if (this.resizeRowIndex === null) return;

        this.sheet.isResizing = true;
        this.sheet.resizeStartPos = { x: e.clientX, y: e.clientY };
        this.originalHeight = this.sheet.rows[this.resizeRowIndex].height;
    }

    /**
     * processes the pointer move event for row resizing
     * @param e Mouse event
     */
    onPointerMove(e: MouseEvent): void {
        if (!this.sheet.isResizing || this.resizeRowIndex === null) return;
        const deltaY = e.clientY - this.sheet.resizeStartPos.y;
        const row = this.sheet.rows[this.resizeRowIndex];
        row.height = Math.max(30, this.originalHeight + deltaY);

        this.sheet.updateCumulativeSizes();

        const scrollTop = this.sheet.container.scrollTop;
        const viewportHeight = this.sheet.canvas.height;
        const startRow = this.sheet.getRowIndexFromY(scrollTop);
        const endRow = this.sheet.getRowIndexFromY(scrollTop + viewportHeight);

        const rowPosition = (this.sheet.cumulativeRowHeights[this.resizeRowIndex!] + this.sheet.colHeaderHeight) * this.sheet.dpr;
        this.sheet.drawRowHeaders(startRow, endRow, scrollTop);
        this.resizeLine.style.display = "block";
        this.resizeLine.style.width = `${this.sheet.canvas.width - this.sheet.rowHeaderWidth * this.sheet.dpr}px`;
        this.resizeLine.style.top = `${rowPosition}px`;
        this.resizeLine.style.left = `${this.sheet.rowHeaderWidth * this.sheet.dpr + this.sheet.container.scrollLeft}px`;
    }


    /**
     * processes the pointer up event for row resizing
     */
    onPointerUp(): void {
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
        this.resizeLine.style.display = "none";
        this.sheet.isResizing = false;
    }

    /**
     * Hit test for row resizing
     * @param e Mouse event
     */
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

    setCursor(): void {
        this.sheet.container.style.cursor = "ns-resize";
    }
}

export { RowResizeStrategy };
