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
    private isRowSelection: boolean = false;
    private isColSelection: boolean = false;
    private autoScrollInterval: number | null = null;
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

        const outOfcanvas = physicalX > this.sheet.canvas.clientWidth || physicalY > this.sheet.canvas.clientHeight;

        this.startRow = this.sheet.getRowIndexFromY(logicalY);
        this.startCol = this.sheet.getColIndexFromX(logicalX);


        if (rowHeaderBuffer < 0 && colHeaderBuffer > 0 && !outOfcanvas) {

            this.sheet.selectedRows.startRow = this.startRow;
            this.sheet.selectedRows.endRow = this.startRow;
            this.sheet.selectedCols = { startCol: null, endCol: null };
            this.sheet.selectedCell = { row: this.startRow, col: 0 };
            this.sheet.selectedArea = { startRow: this.startRow, startCol: 0, endRow: this.startRow, endCol: this.sheet.columns.length - 1 };
            this.sheet.calculateAreaStatus();
            this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
            this.isRowSelection = true;

            return;
        }

        if (colHeaderBuffer < 0 && rowHeaderBuffer > 0 && !outOfcanvas) {

            this.sheet.selectedRows = { startRow: null, endRow: null };
            this.sheet.selectedCols.startCol = this.startCol;
            this.sheet.selectedCols.endCol = this.startCol;
            this.sheet.selectedCell = { row: 0, col: this.startCol };
            this.sheet.selectedArea = { startRow: 0, startCol: this.startCol, endRow: this.sheet.rows.length - 1, endCol: this.startCol };
            this.sheet.calculateAreaStatus();
            this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
            this.isColSelection = true;
            return;

        }

        if (outOfcanvas) return;

        this.sheet.selectedRows = { startRow: null, endRow: null };
        this.sheet.selectedCols = { startCol: null, endCol: null };
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

        if ((!this.sheet.isSelectingArea && !this.isRowSelection && !this.isColSelection) || this.sheet.isInputOn == true) return;

        const rect = this.sheet.canvas.getBoundingClientRect();
        const dpr = this.sheet.dpr;
        const rawX = (e.clientX - rect.left) / dpr;
        const rawY = (e.clientY - rect.top) / dpr;

        const x = rawX + this.sheet.container.scrollLeft - this.sheet.rowHeaderWidth;
        const y = rawY + this.sheet.container.scrollTop - this.sheet.colHeaderHeight;

        const currentRow = this.sheet.getRowIndexFromY(y);
        const currentCol = this.sheet.getColIndexFromX(x);

        if (this.isRowSelection) {
            this.sheet.selectedArea = {
                startRow: Math.min(this.startRow, currentRow),
                startCol: 0,
                endRow: Math.max(this.startRow, currentRow),
                endCol: this.sheet.columns.length - 1
            };
            this.sheet.selectedRows = { startRow: Math.min(this.startRow, currentRow), endRow: Math.max(this.startRow, currentRow) };
            this.sheet.calculateAreaStatus();
            this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
            return;
        };

        if (this.isColSelection) {
            this.sheet.selectedArea = {
                startRow: 0,
                startCol: Math.min(this.startCol, currentCol),
                endRow: this.sheet.rows.length - 1,
                endCol: Math.max(this.startCol, currentCol)
            };
            this.sheet.selectedCols = { startCol: Math.min(this.startCol, currentCol), endCol: Math.max(this.startCol, currentCol) };
            this.sheet.calculateAreaStatus();
            this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
            return;
        }

        this.sheet.selectedArea = {
            startRow: this.startRow,
            startCol: this.startCol,
            endRow: currentRow,
            endCol: currentCol
        };

        this.sheet.scrollIntoView(this.sheet.selectedArea.endRow!, this.sheet.selectedArea.endCol!);
        this.sheet.calculateAreaStatus();
        this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);

        this.startAutoScroll(e);
    }

    /**
     * Event handler for pointer down
     * @param e : Pointer event
     */
    onPointerUp(_e: MouseEvent): void {
        this.sheet.isSelectingArea = false;
        this.stopAutoScroll();
    }

    private startAutoScroll(e: MouseEvent): void {
        const container = this.sheet.container;

        this.stopAutoScroll(); // clear previous if any

        this.autoScrollInterval = window.setInterval(() => {
            const rect = container.getBoundingClientRect();
            const buffer = 20; // how far from edge to start scrolling
            const scrollStep = 30; // how fast to scroll

            let scrolled = false;

            if (e.clientY < rect.top + buffer) {
                container.scrollTop -= scrollStep;
                scrolled = true;
            } else if (e.clientY > rect.bottom - buffer) {
                container.scrollTop += scrollStep;
                scrolled = true;
            }

            if (e.clientX < rect.left + buffer) {
                container.scrollLeft -= scrollStep;
                scrolled = true;
            } else if (e.clientX > rect.right - buffer) {
                container.scrollLeft += scrollStep;
                scrolled = true;
            }

            if (scrolled) {
                // Update selection if scrolling happened
                this.sheet.redrawVisible(container.scrollTop, container.scrollLeft);
                this.sheet.calculateAreaStatus(); // optional: update highlights
            }
        }, 30); // ~33 fps
    }

    private stopAutoScroll() {
        if (this.autoScrollInterval !== null) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
    }
}

export { SelectionStrategy };
