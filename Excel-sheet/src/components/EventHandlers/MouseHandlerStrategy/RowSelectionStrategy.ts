import type { ExcelSheet } from "../../Excellsheet";
import { AutoScroller } from "../../Utils/autoScroll";
import type { Area } from "../MouseHandler";
import type { MouseStrategy } from "./MouseStrategy";

/**
 * Strategy for selecting entire rows via mouse interaction.
 * @member startRow - The row index where the selection started.
 * @member autoScroller - An instance of AutoScroller for automatic scrolling.
 * @member ctrlKeyPressed - Indicates whether the Ctrl key is pressed.
 * @member areaStatusDebounceTimer - A timer for debouncing area status updates.
 * @member lastDrawnArea - The last drawn selection area.
 * @member rafId - The requestAnimationFrame ID for updating the selection area.
 */
class RowSelectionStrategy implements MouseStrategy {
    private startRow: number | null = null;
    private autoScroller: AutoScroller;
    private ctrlKeyPressed: boolean = false;
    private areaStatusDebounceTimer: number | null = null;

    private lastDrawnArea: Area | null = null;
    private rafId: number | null = null;

    /**
     * constructor
     * @param sheet reference to the sheet 
     */
    constructor(private sheet: ExcelSheet) {
        this.autoScroller = new AutoScroller(
            this.sheet.container,
            (e: MouseEvent) => {
                this.onPointerMove(e);
            },
            "vertical"
        );
    }

    /**
     * processes the pointer down event for row selection
     * @param e Mouse event
     */
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

        if (this.ctrlKeyPressed) {
            if (!this.sheet.selectedRows.includes(row)) {
                this.sheet.selectedRows.push(row);
            }
        } else {
            this.sheet.selectedRows = [row];
        }

        if (!e.ctrlKey) {
            this.sheet.selectedCols = [];
        }
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

    /**
     * Processes the pointer move event for row selection
     * @param e Mose event
     */
    onPointerMove(e: MouseEvent): void {
        if (this.sheet.isInputOn || this.startRow === null) return;

        const rect = this.sheet.canvas.getBoundingClientRect();
        const y = ((e.clientY - rect.top) / this.sheet.dpr) + this.sheet.container.scrollTop - this.sheet.colHeaderHeight;
        const currentRow = this.sheet.getRowIndexFromY(y);

        const start = Math.min(this.startRow, currentRow);
        const end = Math.max(this.startRow, currentRow);

        const newArea: Area = {
            startRow: start,
            endRow: end,
            startCol: 0,
            endCol: this.sheet.columns.length - 1
        };

        this.sheet.selectedArea = newArea;

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

        if (this.shouldRedraw(newArea)) {
            this.lastDrawnArea = { ...newArea };
            this.scheduleRedraw();
        }
        this.autoScroller.start(e);
        this.debounceAreaStatus();
    }

    /**
     * Processes the pointer up event for row selection
     */
    onPointerUp(): void {
        this.autoScroller.stop();
    }

    /**
     * Hit test for row selection
     * @param e Mouse event
     */
    hitTest(e: MouseEvent): boolean {
        const rect = this.sheet.canvas.getBoundingClientRect();
        const physicalX = (e.clientX - rect.left) / this.sheet.dpr;
        const physicalY = (e.clientY - rect.top) / this.sheet.dpr;

        const rowHeaderBuffer = physicalX - this.sheet.rowHeaderWidth;
        const colHeaderBuffer = physicalY - this.sheet.colHeaderHeight;

        const outOfCanvas =
            physicalX > this.sheet.canvas.clientWidth ||
            physicalY > this.sheet.canvas.clientHeight;

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

    setCursor(): void {
        this.sheet.container.style.cursor = "cell";
    }

    /**
     * Checks if the area should be redrawn
     * @param area Current area
     * @returns Boolean true if the area should be redrawn
     */
    private shouldRedraw(area: Area): boolean {
        const last = this.lastDrawnArea;
        if (!last) return true;

        return (
            last.startRow !== area.startRow ||
            last.endRow !== area.endRow ||
            last.startCol !== area.startCol ||
            last.endCol !== area.endCol
        );
    }

    /**
     * Draws the area in the next animation frame
     */
    private scheduleRedraw() {
        if (this.rafId !== null) return;
        this.rafId = requestAnimationFrame(() => {
            this.rafId = null;
            this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
        });
    }

    /**
     * calculates the area status after a delay
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

export { RowSelectionStrategy };
