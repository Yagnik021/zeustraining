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
    private ctrlKeyPressed: boolean = false;
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
        this.ctrlKeyPressed = e.ctrlKey;
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

        if (rowHeaderBuffer < 0 && colHeaderBuffer < 0 && Math.abs(rowHeaderBuffer) <= this.sheet.rowHeaderWidth && Math.abs(colHeaderBuffer) <= this.sheet.colHeaderHeight) {
            this.sheet.selectedRows.splice(0, this.sheet.selectedRows.length);
            this.sheet.selectedCols.splice(0, this.sheet.selectedCols.length);
            this.sheet.selectedArea = {
                startRow: 0,
                startCol: 0,
                endRow: this.sheet.rows.length - 1,
                endCol: this.sheet.columns.length - 1
            };
            this.sheet.selectedCell = { row: this.startRow, col: this.startCol };
            this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
            return;
        }

        if (rowHeaderBuffer < 0 && colHeaderBuffer > 0 && !outOfcanvas) {
            if (e.ctrlKey) {
                if (this.sheet.selectedRows.indexOf(this.startRow) === -1) {
                    this.sheet.selectedRows.push(this.startRow);
                }
            } else {
                this.sheet.selectedRows.splice(0, this.sheet.selectedRows.length); // clear
                this.sheet.selectedRows.push(this.startRow);
            }

            this.sheet.selectedCols.splice(0, this.sheet.selectedCols.length);
            this.sheet.selectedCell = { row: this.startRow, col: 0 };

            this.sheet.selectedArea = {
                startRow: this.startRow,
                startCol: 0,
                endRow: this.startRow,
                endCol: this.sheet.columns.length - 1
            };

            this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
            this.sheet.calculateAreaStatus();
            this.isRowSelection = true;

            return;
        }

        if (colHeaderBuffer < 0 && rowHeaderBuffer > 0 && !outOfcanvas) {
            if (e.ctrlKey) {
                if (!this.sheet.selectedCols.includes(this.startCol)) {
                    this.sheet.selectedCols.push(this.startCol);
                }
            } else {
                this.sheet.selectedCols.splice(0, this.sheet.selectedCols.length);
                this.sheet.selectedCols.push(this.startCol);
            }

            this.sheet.selectedRows.splice(0, this.sheet.selectedRows.length); // Clear row selections
            this.sheet.selectedCell = { row: 0, col: this.startCol };

            // Full-height column area selection
            this.sheet.selectedArea = {
                startRow: 0,
                startCol: this.startCol,
                endRow: this.sheet.rows.length - 1,
                endCol: this.startCol
            };

            this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
            this.sheet.calculateAreaStatus();
            this.isColSelection = true;

            return;
        }


        if (outOfcanvas) return;

        // this.sheet.selectedRows = { startRow: null, endRow: null };
        this.sheet.selectedRows.splice(0, this.sheet.selectedRows.length);
        this.sheet.selectedCols.splice(0, this.sheet.selectedCols.length);
        this.sheet.isSelectingArea = true;

        this.sheet.selectedArea = {
            startRow: this.startRow,
            startCol: this.startCol,
            endRow: null,
            endCol: null
        };
        this.sheet.selectedCell = { row: this.startRow, col: this.startCol };
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
            const start = Math.min(this.startRow, currentRow);
            const end = Math.max(this.startRow, currentRow);

            if (this.ctrlKeyPressed) {
                const newRows = [];
                for (let i = start; i <= end; i++) {
                    if (!this.sheet.selectedRows.includes(i)) {
                        newRows.push(i);
                    }
                }
                this.sheet.selectedRows.push(...newRows);
            } else {
                // Normal drag: select range
                this.sheet.selectedRows = [];
                for (let i = start; i <= end; i++) {
                    this.sheet.selectedRows.push(i);
                }
            }

            this.sheet.selectedArea = {
                startRow: start,
                endRow: end,
                startCol: 0,
                endCol: this.sheet.columns.length - 1
            };

            this.startAutoScroll(e);
            this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
            return;
        }


        if (this.isColSelection) {
            const fromCol = this.startCol;
            const toCol = currentCol;

            const startCol = Math.min(fromCol, toCol);
            const endCol = Math.max(fromCol, toCol);

            this.sheet.selectedArea = {
                startRow: 0,
                startCol,
                endRow: this.sheet.rows.length - 1,
                endCol
            };

            if (e.ctrlKey) {
                for (let col = startCol; col <= endCol; col++) {
                    if (!this.sheet.selectedCols.includes(col)) {
                        this.sheet.selectedCols.push(col);
                    }
                }
            } else {
                this.sheet.selectedCols = [];
                for (let col = startCol; col <= endCol; col++) {
                    this.sheet.selectedCols.push(col);
                }
            }

            this.startAutoScroll(e);
            this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
            return;
        }


        this.sheet.selectedArea = {
            startRow: this.startRow,
            startCol: this.startCol,
            endRow: currentRow,
            endCol: currentCol
        };

        const addressDiv = document.querySelector(".address") as HTMLDivElement;


        if (this.sheet.selectedArea.startRow !== null && this.sheet.selectedArea.endRow !== null && this.sheet.selectedArea.startCol !== null && this.sheet.selectedArea.endCol !== null && addressDiv !== null) {
            var startRow = Math.min(this.sheet.selectedArea.startRow, this.sheet.selectedArea.endRow);
            var endRow = Math.max(this.sheet.selectedArea.startRow, this.sheet.selectedArea.endRow);
            var startCol = Math.min(this.sheet.selectedArea.startCol, this.sheet.selectedArea.endCol);
            var endCol = Math.max(this.sheet.selectedArea.startCol, this.sheet.selectedArea.endCol);

            if (startRow !== endRow || startCol !== endCol) {
                addressDiv.innerHTML = `R${endRow - startRow + 1} X C${endCol - startCol + 1}`;
            } else {
                addressDiv.innerHTML = this.sheet.columns[currentCol].label + (currentRow + 1);
            }
        }
        this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
        this.startAutoScroll(e);
    }

    /**
     * Event handler for pointer down
     * @param e : Pointer event
     */
    onPointerUp(_e: MouseEvent): void {

        const addressDiv = document.querySelector(".address") as HTMLDivElement;
        const cell = this.sheet.selectedCell;
        if (addressDiv) {
            if (cell) {
                addressDiv.innerHTML = this.sheet.columns[cell.col].label + (cell.row + 1);
                this.sheet.formularBarInput.value = this.sheet.getOrCreateCell(cell.row, cell.col)?.text || "";
            } else {
                addressDiv.innerHTML = "";
                this.sheet.formularBarInput.value = "";
            }
        }
        if (this.sheet.isSelectingArea) {
            this.sheet.calculateAreaStatus();
        }
        this.sheet.isSelectingArea = false;
        this.stopAutoScroll();
    }

    /**
     * Function to start auto scrolling
     * @param e Mouse event
     */
    private startAutoScroll(e: MouseEvent): void {
        const container = this.sheet.container;

        this.stopAutoScroll(); // clear previous if any
        const rect = container.getBoundingClientRect();
        const dpr = this.sheet.dpr;
        const rawX = (e.clientX - rect.left) / dpr;
        const rawY = (e.clientY - rect.top) / dpr;

        const x = rawX + this.sheet.container.scrollLeft - this.sheet.rowHeaderWidth;
        const y = rawY + this.sheet.container.scrollTop - this.sheet.colHeaderHeight;

        let currentRow = this.sheet.getRowIndexFromY(y);
        let currentCol = this.sheet.getColIndexFromX(x);

        this.autoScrollInterval = window.setInterval(() => {
            const rect = container.getBoundingClientRect();
            const buffer = 20; // how far from edge to start scrolling
            const scrollStep = 24; // how fast to scroll

            let scrolled = false;

            if (e.clientY < rect.top + buffer) {
                let scrollTop = container.scrollTop -= scrollStep;
                currentRow = this.sheet.getRowIndexFromY(scrollTop);
                scrolled = true;
            } else if (e.clientY > rect.bottom - buffer) {
                let scrollTop = (container.scrollTop += scrollStep) + container.clientHeight - this.sheet.colHeaderHeight;
                currentRow = this.sheet.getRowIndexFromY(scrollTop);
                scrolled = true;
            }

            if (e.clientX < rect.left + buffer) {
                let scrollLeft = container.scrollLeft -= scrollStep;
                currentCol = this.sheet.getColIndexFromX(scrollLeft);
                scrolled = true;
            } else if (e.clientX > rect.right - buffer) {
                let scrollLeft = (container.scrollLeft += scrollStep) + container.clientWidth - this.sheet.rowHeaderWidth;
                currentCol = this.sheet.getColIndexFromX(scrollLeft);
                scrolled = true;
            }

            if (scrolled) {
                if (this.isRowSelection) {
                    const start = Math.min(this.startRow, currentRow);
                    const end = Math.max(this.startRow, currentRow);

                    if (this.ctrlKeyPressed) {
                        const newRows = [];
                        for (let i = start; i <= end; i++) {
                            if (!this.sheet.selectedRows.includes(i)) {
                                newRows.push(i);
                            }
                        }
                        this.sheet.selectedRows.push(...newRows);
                    } else {
                        // Normal drag: select range
                        this.sheet.selectedRows = [];
                        for (let i = start; i <= end; i++) {
                            this.sheet.selectedRows.push(i);
                        }
                    }

                    this.sheet.selectedArea = {
                        startRow: start,
                        endRow: end,
                        startCol: 0,
                        endCol: this.sheet.columns.length - 1
                    };
                } else if (this.isColSelection) {
                    const fromCol = this.startCol;
                    const toCol = currentCol;

                    const startCol = Math.min(fromCol, toCol);
                    const endCol = Math.max(fromCol, toCol);

                    this.sheet.selectedArea = {
                        startRow: 0,
                        startCol,
                        endRow: this.sheet.rows.length - 1,
                        endCol
                    };

                    if (e.ctrlKey) {
                        for (let col = startCol; col <= endCol; col++) {
                            if (!this.sheet.selectedCols.includes(col)) {
                                this.sheet.selectedCols.push(col);
                            }
                        }
                    } else {
                        this.sheet.selectedCols = [];
                        for (let col = startCol; col <= endCol; col++) {
                            this.sheet.selectedCols.push(col);
                        }
                    }
                } else {
                    this.sheet.selectedArea = {
                        startRow: this.startRow,
                        startCol: this.startCol,
                        endRow: currentRow,
                        endCol: currentCol
                    };
                }
                this.sheet.redrawVisible(container.scrollTop, container.scrollLeft);
            }
        }, 30); 
    }

    /**
     * Function to stop auto scrolling
     */
    private stopAutoScroll() {
        if (this.autoScrollInterval !== null) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
    }
}

export { SelectionStrategy };
