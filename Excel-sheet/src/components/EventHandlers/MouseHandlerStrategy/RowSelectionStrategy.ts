import type { ExcelSheet } from "../../Excellsheet";
import { AutoScroller } from "../../Utils/autoScroll";
import type { MouseStrategy } from "./MouseStrategy";

/**
 * Strategy for selecting entire rows via mouse interaction.
 */
class RowSelectionStrategy implements MouseStrategy {
    private startRow: number | null = null;
    private autoScroller: AutoScroller;
    private ctrlKeyPressed: boolean = false;

    constructor(private sheet: ExcelSheet) {
        this.autoScroller = new AutoScroller(
            this.sheet.container,
            (e: MouseEvent) => {
                this.onPointerMove(e);
            },
            "vertical"
        );
    }

    onPointerDown(e: MouseEvent): void {
        this.ctrlKeyPressed = e.ctrlKey;

        const rect = this.sheet.canvas.getBoundingClientRect();
        const physicalY = (e.clientY - rect.top) / this.sheet.dpr;
        const scrollTop = this.sheet.container.scrollTop;
        const y = physicalY + scrollTop - this.sheet.colHeaderHeight;

        // Calculate row index
        let row = 0;
        while (
            row < this.sheet.rows.length &&
            this.sheet.cumulativeRowHeights[row] < y
        ) {
            row++;
        }

        this.startRow = row;
        this.sheet.isSelectingArea = true;

        if (this.ctrlKeyPressed) {
            if (!this.sheet.selectedRows.includes(row)) {
                this.sheet.selectedRows.push(row);
            }
        } else {
            this.sheet.selectedRows = [row];
        }

        this.sheet.selectedCols = [];
        this.sheet.selectedCell = { row, col: 0 };

        this.sheet.selectedArea = {
            startRow: row,
            endRow: row,
            startCol: 0,
            endCol: this.sheet.columns.length - 1,
        };

        this.sheet.calculateAreaStatus();
        this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
    }

    onPointerMove(e: MouseEvent): void {
        if (!this.sheet.isSelectingArea || this.sheet.isInputOn || this.startRow === null) return;

        const rect = this.sheet.canvas.getBoundingClientRect();
        const y = ((e.clientY - rect.top) / this.sheet.dpr) + this.sheet.container.scrollTop - this.sheet.colHeaderHeight;
        const currentRow = this.sheet.getRowIndexFromY(y);

        const start = Math.min(this.startRow, currentRow);
        const end = Math.max(this.startRow, currentRow);

        this.sheet.selectedArea = {
            startRow: start,
            endRow: end,
            startCol: 0,
            endCol: this.sheet.columns.length - 1
        };

        if (this.ctrlKeyPressed) {
            for (let i = start; i <= end; i++) {
                if (!this.sheet.selectedRows.includes(i)) {
                    this.sheet.selectedRows.push(i);
                }
            }
        } else {
            this.sheet.selectedRows = [];
            for (let i = start; i <= end; i++) {
                this.sheet.selectedRows.push(i);
            }
        }

        this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
        this.autoScroller.start(e);
    }

    onPointerUp(): void {
        this.sheet.calculateAreaStatus();
        this.sheet.isSelectingArea = false;
        this.autoScroller.stop();
    }

    hitTest(e: MouseEvent): boolean {
        const rect = this.sheet.canvas.getBoundingClientRect();
        const physicalX = (e.clientX - rect.left) / this.sheet.dpr;
        const physicalY = (e.clientY - rect.top) / this.sheet.dpr;

        const rowHeaderBuffer = physicalX - this.sheet.rowHeaderWidth;
        const colHeaderBuffer = physicalY - this.sheet.colHeaderHeight;

        const outOfCanvas =
            physicalX > this.sheet.canvas.clientWidth ||
            physicalY > this.sheet.canvas.clientHeight;

        // Row header region (ignore column headers and corner cell)
        if (rowHeaderBuffer < 0 && colHeaderBuffer > 0 && !outOfCanvas) {
            const scrollTop = this.sheet.container.scrollTop;
            const y = physicalY + scrollTop - this.sheet.colHeaderHeight;

            let row = 0;
            while (
                row < this.sheet.rows.length &&
                this.sheet.cumulativeRowHeights[row + 1] < y
            ) {
                row++;
            }

            this.startRow = row;
            return true;
        }

        return false;
    }
}

export { RowSelectionStrategy };
