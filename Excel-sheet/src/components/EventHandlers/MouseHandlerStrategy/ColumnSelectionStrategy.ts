import type { ExcelSheet } from "../../Excellsheet";
import { AutoScroller } from "../../Utils/autoScroll";
import type { Area } from "../MouseHandler";
import type { MouseStrategy } from "./MouseStrategy";

/**
 * Strategy for selecting entire columns via mouse interaction.
 * @member startCol - The column index where the selection started.
 * @member autoScroller - An instance of AutoScroller for automatic scrolling.  
 * @member ctrlKeyPressed - Indicates whether the Ctrl key is pressed.
 * @member areaStatusDebounceTimer - A timer for debouncing area status updates.
 */
class ColumnSelectionStrategy implements MouseStrategy {
    private startCol: number | null = null;
    private autoScroller: AutoScroller;
    private ctrlKeyPressed: boolean = false;
    private areaStatusDebounceTimer: number | null = null;

    private lastDrawnArea: Area | null = null;
    private rafId: number | null = null;

    /**
     * Constructor for the ColumnSelectionStrategy class.
     * @param sheet Reference to the ExcelSheet instance.
     */
    constructor(private sheet: ExcelSheet) {
        this.autoScroller = new AutoScroller(
            this.sheet.container,
            (e: MouseEvent) => {
                this.onPointerMove(e);
            },
            "horizontal"
        );
    }

    /**
     * Process a pointer down event for column selection.
     * @param e Mouse event
     */
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

        if (this.ctrlKeyPressed) {
            if (!this.sheet.selectedCols.includes(col)) {
                this.sheet.selectedCols.push(col);
            }
        } else {
            this.sheet.selectedCols = [col];
        }

        if (!e.ctrlKey) {
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

    /**
     * Process a pointer move event for column selection.
     * @param e Mouse event
     */
    onPointerMove(e: MouseEvent): void {
        if (this.sheet.isInputOn || this.startCol === null) return;

        const rect = this.sheet.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / this.sheet.dpr) + this.sheet.container.scrollLeft - this.sheet.rowHeaderWidth;
        const currentCol = this.sheet.getColIndexFromX(x);

        const start = Math.min(this.startCol, currentCol);
        const end = Math.max(this.startCol, currentCol);
        const newArea: Area = {
            startRow: 0,
            endRow: this.sheet.rows.length - 1,
            startCol: start,
            endCol: end
        };

        this.sheet.selectedArea = newArea;

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

        if (this.shouldRedraw(newArea)) {
            this.lastDrawnArea = { ...newArea };
            this.scheduleRedraw();
        }
        this.autoScroller.start(e);
        this.debounceAreaStatus();
    }

    /**
     * Process a pointer up event for column selection.
     */
    onPointerUp(): void {
        this.autoScroller.stop();
    }

    /**
     * Hits test for column selection
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
        return colHeaderBuffer < 0 && rowHeaderBuffer > 0 && !outOfCanvas;
    }

    setCursor(): void {
        this.sheet.container.style.cursor = "cell";
    }

    /**
     * To check if the area should be redrawn
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
     * Draws the selected area using requestAnimationFrame
     */
    private scheduleRedraw() {
        if (this.rafId !== null) return;
        this.rafId = requestAnimationFrame(() => {
            this.rafId = null;
            this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
        });
    }


    /**
     * Debounces the area status update
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

export { ColumnSelectionStrategy };
