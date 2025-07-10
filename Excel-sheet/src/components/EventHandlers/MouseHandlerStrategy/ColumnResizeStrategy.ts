import { ResizeCommand } from "../../Commands/ResizeCommand";
import type { ExcelSheet } from "../../Excellsheet";
import type { MouseStrategy } from "./MouseStrategy";

/**
 * Strategy class for handling column resizing via mouse.
 * @member originalWidth - The original width of the resized column.
 * @member resizeColIndex - The index of the column currently being resized.
 * @member resizeLine - The div element used to display the resize line.
 * 
 */
class ColumnResizeStrategy implements MouseStrategy {
    private originalWidth: number = 0;
    private resizeColIndex: number | null = null;
    private resizeLine: HTMLDivElement;

    /**
     * Constructor 
     * @param sheet The ExcelSheet instance 
     */
    constructor(private sheet: ExcelSheet) {
        this.resizeLine = document.createElement("div");
        this.resizeLine.style.position = "absolute";
        this.resizeLine.style.top = `${this.sheet.colHeaderHeight}px`;
        this.resizeLine.style.bottom = "0";
        this.resizeLine.style.borderLeft = "2px dashed #137E43";
        this.resizeLine.style.zIndex = "9999";
        this.resizeLine.style.pointerEvents = "none"; // don't interfere with mouse
        this.resizeLine.style.display = "none"; // hide initially
        this.sheet.container.appendChild(this.resizeLine);
    }

    /**
     * Processes a mouse down event for column resizing.
     * @param e MouseEvent 
     * @returns 
     */
    onPointerDown(e: MouseEvent): void {

        if (this.resizeColIndex === null) return;

        this.sheet.isResizing = true;
        this.sheet.resizeStartPos = { x: e.clientX, y: e.clientY };
        this.originalWidth = this.sheet.columns[this.resizeColIndex].width;
    }

    /**
     * Processes a mouse move event for column resizing.
     * @param e MouseEvent
     */
    onPointerMove(e: MouseEvent): void {
        if (!this.sheet.isResizing) return;
        if (this.resizeColIndex === null) return;

        const deltaX = e.clientX - this.sheet.resizeStartPos.x;
        const col = this.sheet.columns[this.resizeColIndex!];
        col.width = Math.max(50, this.originalWidth + deltaX);

        this.sheet.updateCumulativeSizes();

        const scrollLeft = this.sheet.container.scrollLeft;
        const viewportWidth = this.sheet.canvas.width;
        const startCol = this.sheet.getColIndexFromX(scrollLeft);
        const endCol = this.sheet.getColIndexFromX(scrollLeft + viewportWidth);

        const columnPosition = (this.sheet.cumulativeColWidths[this.resizeColIndex!] + this.sheet.rowHeaderWidth) * this.sheet.dpr;
        this.sheet.drawColumnHeaders(startCol, endCol, scrollLeft);
        this.resizeLine.style.top = `${(this.sheet.container.scrollTop) + this.sheet.colHeaderHeight * this.sheet.dpr }px`;
        this.resizeLine.style.height = `${this.sheet.canvas.height - this.sheet.colHeaderHeight * this.sheet.dpr}px`;
        this.resizeLine.style.left = `${columnPosition}px`;
        this.resizeLine.style.display = "block";
    }

    /**
     * Processes a mouse up event for column resizing.
     * @param e Mouse Event
     */
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
        this.resizeLine.style.display = "none";
        this.sheet.isResizing = false;
    }

    /**
     * Hit test for column resizing
     * @param e Mouse Event
     */
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

    setCursor(): void {
        this.sheet.container.style.cursor = "ew-resize";
    }

}

export { ColumnResizeStrategy };
