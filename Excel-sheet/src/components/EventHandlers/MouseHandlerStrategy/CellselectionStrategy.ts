import type { ExcelSheet } from "../../Excellsheet";
import { AutoScroller } from "../../Utils/autoScroll";
import type { MouseStrategy } from "./MouseStrategy";

class CellSelectionStrategy implements MouseStrategy {
    private startRow: number | null = null;
    private startCol: number | null = null;
    private autoScroller: AutoScroller;

    constructor(private sheet: ExcelSheet) {
        this.autoScroller = new AutoScroller(
            this.sheet.container,
            (e : MouseEvent) => {
                this.onPointerMove(e);
            },
            "both"
        );
    }

    onPointerDown(e: MouseEvent): void {

        if (this.startRow === null || this.startCol === null) return;

        this.sheet.selectedRows = [];
        this.sheet.selectedCols = [];
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

    onPointerMove(e: MouseEvent): void {
        if (!this.sheet.isSelectingArea || this.sheet.isInputOn) return;

        const rect = this.sheet.canvas.getBoundingClientRect();
        const rawX = (e.clientX - rect.left) / this.sheet.dpr;
        const rawY = (e.clientY - rect.top) / this.sheet.dpr;

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

        this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
        this.autoScroller.start(e);
    }

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

        if (this.sheet.isSelectingArea) {
            this.sheet.calculateAreaStatus();
        }

        this.sheet.isSelectingArea = false;
        this.autoScroller.stop();

    }

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
}

export { CellSelectionStrategy };
