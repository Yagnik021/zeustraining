import type { ExcelSheet } from "../../Excellsheet";
import type { MouseStrategy } from "./MouseStrategy";

/**
 * Strategy class for handling sheet selection via mouse.
 */
class SheetSelectionStrategy implements MouseStrategy {

    constructor(private sheet: ExcelSheet) { }

    /**
     * Processes pointer down event for sheet selection
     * @param e Mouse event
     */
    onPointerDown(e: MouseEvent): void {
        this.sheet.selectedRows.splice(0, this.sheet.selectedRows.length);
        this.sheet.selectedCols.splice(0, this.sheet.selectedCols.length);
        this.sheet.selectedArea = {
            startRow: 0,
            startCol: 0,
            endRow: this.sheet.rows.length - 1,
            endCol: this.sheet.columns.length - 1
        };
        this.sheet.selectedCell = { row: 0, col: 0 };
        this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
        return;
    }
    onPointerMove(e: MouseEvent): void { }
    onPointerUp(e: MouseEvent): void { }

    /**
     * Hit test for sheet selection
     * @param e Mouse event
     */
    hitTest(e: MouseEvent): boolean {

        const rect = this.sheet.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.sheet.dpr;
        const y = (e.clientY - rect.top) / this.sheet.dpr;

        if (x < this.sheet.rowHeaderWidth && y < this.sheet.colHeaderHeight && Math.abs(x) < this.sheet.rowHeaderWidth && Math.abs(y) < this.sheet.colHeaderHeight) {
            return true;
        }
        return false;
    }

    setCursor(): void {
        this.sheet.container.style.cursor = "cell";
    }
}

export { SheetSelectionStrategy };