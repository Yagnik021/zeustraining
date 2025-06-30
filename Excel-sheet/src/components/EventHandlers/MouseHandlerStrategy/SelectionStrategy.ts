import type { ExcelSheet } from "../../Excellsheet";
import type { MouseStrategy } from "./MouseStrategy";

/**
 * Mouse handler strategy for selection
 * @implements MouseStrategy
 * @exports SelectionStrategy
 * @private startRow : start row index of the selection area
 * @private startCol : start column index of the selection area
 */
class SelectionStrategy implements MouseStrategy {
    private startRow: number;
    private startCol: number;

    /**
     * Constructor
     * @param sheet Reference to the sheet 
     * @param row Start row for the selection
     * @param col Start column for the selection
     */
    constructor(private sheet: ExcelSheet, row: number, col: number) {
        this.startRow = row;
        this.startCol = col;
    }

    /**
     * Event handler for pointer down
     * @param e : Pointer event
     */
    onPointerDown(e: MouseEvent): void {
        const rect = this.sheet.canvas.getBoundingClientRect();

        const physicalX = (e.clientX - rect.left) / this.sheet.dpr;
        const physicalY = (e.clientY - rect.top) / this.sheet.dpr;

        const logicalX = (physicalX + this.sheet.container.scrollLeft - this.sheet.rowHeaderWidth);
        const logicalY = (physicalY + this.sheet.container.scrollTop - this.sheet.colHeaderHeight);

        // Use these for area calculations
        const rowHeaderBuffer = physicalX - this.sheet.rowHeaderWidth;
        const colHeaderBuffer = physicalY - this.sheet.colHeaderHeight;

        // Check if pointer is outside visible canvas bounds in logical units
        const outOfcanvas = physicalX > this.sheet.canvas.clientWidth || physicalY > this.sheet.canvas.clientHeight;

        this.startRow = this.sheet.getRowIndexFromY(logicalY);
        this.startCol = this.sheet.getColIndexFromX(logicalX);


        if (rowHeaderBuffer < 0 && colHeaderBuffer > 0 && !outOfcanvas) {

            this.sheet.selectedRow = this.startRow;
            this.sheet.selectedCol = null;
            this.sheet.selectedCell = null;
            this.sheet.selectedArea = { startRow: this.startRow, startCol: 0, endRow: this.startRow, endCol: this.sheet.columns.length - 1 };
            this.sheet.calculateAreaStatus();
            this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
            return;
        }

        if (colHeaderBuffer < 0 && rowHeaderBuffer > 0 && !outOfcanvas) {
            const col = this.sheet.getColIndexFromX(logicalX);
            this.sheet.selectedRow = null;
            this.sheet.selectedCol = col;
            this.sheet.selectedCell = null;
            this.sheet.selectedArea = { startRow: 0, startCol: col, endRow: this.sheet.rows.length - 1, endCol: col };
            this.sheet.calculateAreaStatus();
            this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
            return;

        }

        this.sheet.selectedRow = null;
        this.sheet.selectedCol = null;
        this.sheet.isSelectingArea = true;

        this.sheet.selectedArea = {
            startRow: this.startRow,
            startCol: this.startCol,
            endRow: null,
            endCol: null
        };
        this.sheet.selectedCell = { row: this.startRow, col: this.startCol };
        this.sheet.calculateAreaStatus();
        this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
    }


    /**
     * Event handler for pointer down
     * @param e : Pointer event
     */
    onPointerMove(e: MouseEvent): void {
        if (!this.sheet.isSelectingArea) return;

        const rect = this.sheet.canvas.getBoundingClientRect();
        const dpr = this.sheet.dpr;
        const rawX = (e.clientX - rect.left) / dpr;
        const rawY = (e.clientY - rect.top) / dpr;

        const x = rawX + this.sheet.container.scrollLeft - this.sheet.rowHeaderWidth;
        const y = rawY + this.sheet.container.scrollTop - this.sheet.colHeaderHeight;

        const currentRow = this.sheet.getRowIndexFromY(y);
        const currentCol = this.sheet.getColIndexFromX(x);

        this.sheet.selectedArea = {
            startRow: this.startRow,
            startCol: this.startCol,
            endRow: currentRow,
            endCol: currentCol
        };

        if (this.startRow === currentRow && this.startCol === currentCol) {

            this.sheet.selectedCell = { row: this.startRow, col: this.startCol };
            this.sheet.selectedArea = { startRow: null, startCol: null, endRow: null, endCol: null };
        } else {
            this.sheet.selectedCell = null;
        }

        this.sheet.calculateAreaStatus();
        this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
    }

    /**
     * Event handler for pointer down
     * @param e : Pointer event
     */
    onPointerUp(_e: MouseEvent): void {
        this.sheet.isSelectingArea = false;
    }
}

export { SelectionStrategy };
