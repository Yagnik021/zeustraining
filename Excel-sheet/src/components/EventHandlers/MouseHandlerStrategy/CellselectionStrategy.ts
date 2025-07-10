import type { ExcelSheet } from "../../Excellsheet";
import { AutoScroller } from "../../Utils/autoScroll";
import type { Area } from "../MouseHandler";
import type { MouseStrategy } from "./MouseStrategy";


/**
 * Strategy class for handling cell selection via mouse.
 * @member startRow - The row index where the selection started.
 * @member startCol - The column index where the selection started.
 * @member autoScroller - An instance of AutoScroller for automatic scrolling.
 * @member areaStatusDebounceTimer - A timer for debouncing area status updates.
 * @member rafId - The ID of the requestAnimationFrame for redrawing the area status.
 * @member lastDrawnArea - The last drawn area of the selection.
 */
class CellSelectionStrategy implements MouseStrategy {
    private startRow: number | null = null;
    private startCol: number | null = null;
    private autoScroller: AutoScroller;
    private areaStatusDebounceTimer: number | null = null;

    private rafId: number | null = null;
    private lastDrawnArea: Area | null = null;

    constructor(private sheet: ExcelSheet) {
        this.autoScroller = new AutoScroller(
            this.sheet.container,
            (e: MouseEvent) => {
                this.onPointerMove(e);
            },
            "both"
        );
    }

    /**
     * Processes the pointer down event for cell selection.
     * @param e Mouse event
     */
    onPointerDown(e: MouseEvent): void {
        if (this.startRow === null || this.startCol === null) return;
        this.sheet.selectedRows = [];
        this.sheet.selectedCols = [];

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
     * Processes the pointer move event for cell selection.
     * @param e Mouse event
     */
    onPointerMove(e: MouseEvent): void {
        if (this.sheet.isInputOn) return;

        const rect = this.sheet.canvas.getBoundingClientRect();
        const rawX = (e.clientX - rect.left) / this.sheet.dpr;
        const rawY = (e.clientY - rect.top) / this.sheet.dpr;

        const x = rawX + this.sheet.container.scrollLeft - this.sheet.rowHeaderWidth;
        const y = rawY + this.sheet.container.scrollTop - this.sheet.colHeaderHeight;

        const currentRow = this.sheet.getRowIndexFromY(y);
        const currentCol = this.sheet.getColIndexFromX(x);

        const selectedArea: Area = {
            startRow: this.startRow,
            startCol: this.startCol,
            endRow: currentRow,
            endCol: currentCol
        };

        this.sheet.selectedArea = selectedArea;

        const addressDiv = document.querySelector(".address") as HTMLDivElement;

        if (
            this.sheet.selectedArea.startRow !== null &&
            this.sheet.selectedArea.endRow !== null &&
            this.sheet.selectedArea.startCol !== null &&
            this.sheet.selectedArea.endCol !== null &&
            addressDiv
        ) {
            const startRow = Math.min(this.sheet.selectedArea.startRow, this.sheet.selectedArea.endRow);
            const endRow = Math.max(this.sheet.selectedArea.startRow, this.sheet.selectedArea.endRow);
            const startCol = Math.min(this.sheet.selectedArea.startCol, this.sheet.selectedArea.endCol);
            const endCol = Math.max(this.sheet.selectedArea.startCol, this.sheet.selectedArea.endCol);

            if (startRow !== endRow || startCol !== endCol) {
                addressDiv.innerHTML = `R${endRow - startRow + 1} X C${endCol - startCol + 1}`;
            } else {
                addressDiv.innerHTML = this.sheet.columns[currentCol].label + (currentRow + 1);
            }
        }


        if (this.shouldRedraw(selectedArea)) {
            this.lastDrawnArea = { ...selectedArea };
            this.scheduleRedraw();
        }
        this.autoScroller.start(e);
        this.debounceAreaStatus();

    }

    /**
     * Processes the pointer up event for cell selection.
     */
    onPointerUp(): void {
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

        this.autoScroller.stop();

    }

    /**
     * Hits test for cell selection
     * @param e Mouse event
     */
    hitTest(e: MouseEvent): boolean {
        const rect = this.sheet.canvas.getBoundingClientRect();
        const physicalX = (e.clientX - rect.left) / this.sheet.dpr;
        const physicalY = (e.clientY - rect.top) / this.sheet.dpr;

        const logicalX = physicalX + this.sheet.container.scrollLeft - this.sheet.rowHeaderWidth;
        const logicalY = physicalY + this.sheet.container.scrollTop - this.sheet.colHeaderHeight;

        const rowHeaderBuffer = physicalX - this.sheet.rowHeaderWidth;
        const colHeaderBuffer = physicalY - this.sheet.colHeaderHeight;

        const outOfCanvas =
            physicalX > this.sheet.canvas.clientWidth ||
            physicalY > this.sheet.canvas.clientHeight;

        if (
            !outOfCanvas &&
            rowHeaderBuffer >= 0 &&
            colHeaderBuffer >= 0
        ) {
            this.startRow = this.sheet.getRowIndexFromY(logicalY);
            this.startCol = this.sheet.getColIndexFromX(logicalX);
            return true;
        }
        return false;
    }

    setCursor(): void {
        this.sheet.container.style.cursor = "cell";
    }

    /**
     * Check if the area should be redrawn
     * @param newArea New area
     * @returns Boolean True if the area should be redrawn
     */
    private shouldRedraw(newArea: Area): boolean {
        const last = this.lastDrawnArea;
        if (!last) return true;

        return (
            last.startRow !== newArea.startRow ||
            last.endRow !== newArea.endRow ||
            last.startCol !== newArea.startCol ||
            last.endCol !== newArea.endCol
        );
    }

    /**
     * Draw the area using requestAnimationFrame
     */
    private scheduleRedraw() {
        if (this.rafId !== null) return;

        this.rafId = requestAnimationFrame(() => {
            this.rafId = null;
            this.sheet.redrawVisible(
                this.sheet.container.scrollTop,
                this.sheet.container.scrollLeft
            );
        });
    }

    /**
     * Delay the calculation of the area status
     * @param delay Delay in milliseconds
     */
    private debounceAreaStatus(delay = 100): void {
        if (this.areaStatusDebounceTimer !== null) {
            clearTimeout(this.areaStatusDebounceTimer);
        }

        this.areaStatusDebounceTimer = window.setTimeout(() => {
            this.sheet.calculateAreaStatus();
        }, delay);
    }
}

export { CellSelectionStrategy };
