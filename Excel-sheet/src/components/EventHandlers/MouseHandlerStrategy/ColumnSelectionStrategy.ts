import type { ExcelSheet } from "../../Excellsheet";
import { AutoScroller } from "../../Utils/autoScroll";
import type { MouseStrategy } from "./MouseStrategy";

/**
 * Strategy for selecting entire columns via mouse interaction.
 */
class ColumnSelectionStrategy implements MouseStrategy {
    private startCol: number | null = null;
    private autoScroller: AutoScroller;
    private ctrlKeyPressed: boolean = false;

    constructor(private sheet: ExcelSheet) {
        this.autoScroller = new AutoScroller(
            this.sheet.container,
            (e: MouseEvent) => {
                this.onPointerMove(e);
            },
            "horizontal"
        );
    }

    onPointerDown(e: MouseEvent): void {
        this.ctrlKeyPressed = e.ctrlKey;

        const rect = this.sheet.canvas.getBoundingClientRect();
        const physicalX = (e.clientX - rect.left) / this.sheet.dpr;
        const scrollLeft = this.sheet.container.scrollLeft;
        const x = physicalX + scrollLeft - this.sheet.rowHeaderWidth;

        // Calculate column index
        let col = 0;
        while (
            col < this.sheet.columns.length &&
            this.sheet.cumulativeColWidths[col] < x
        ) {
            col++;
        }

        this.startCol = col;
        this.sheet.isSelectingArea = true;

        if (this.ctrlKeyPressed) {
            if (!this.sheet.selectedCols.includes(col)) {
                this.sheet.selectedCols.push(col);
            }
        } else {
            this.sheet.selectedCols = [col];
        }

        if(!e.ctrlKey){
            this.sheet.selectedRows = [];
        }
        this.sheet.selectedCell = { row: 0, col };

        this.sheet.selectedArea = {
            startRow: 0,
            endRow: this.sheet.rows.length - 1,
            startCol: col,
            endCol: col
        };

        this.sheet.calculateAreaStatus();
        this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
    }

    onPointerMove(e: MouseEvent): void {
        if (!this.sheet.isSelectingArea || this.sheet.isInputOn || this.startCol === null) return;

        const rect = this.sheet.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / this.sheet.dpr) + this.sheet.container.scrollLeft - this.sheet.rowHeaderWidth;
        const currentCol = this.sheet.getColIndexFromX(x);

        const start = Math.min(this.startCol, currentCol);
        const end = Math.max(this.startCol, currentCol);

        this.sheet.selectedArea = {
            startRow: 0,
            endRow: this.sheet.rows.length - 1,
            startCol: start,
            endCol: end
        };

        if (this.ctrlKeyPressed) {
            for (let col = start; col <= end; col++) {
                if (!this.sheet.selectedCols.includes(col)) {
                    this.sheet.selectedCols.push(col);
                }
            }
        } else {
            this.sheet.selectedCols = [];
            for (let col = start; col <= end; col++) {
                this.sheet.selectedCols.push(col);
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

        return colHeaderBuffer < 0 && rowHeaderBuffer > 0 && !outOfCanvas;
    }
}

export { ColumnSelectionStrategy };
