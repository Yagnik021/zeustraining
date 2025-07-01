import type { ExcelSheet } from "../Excellsheet";
import type { Command } from "./Command";

interface CellSnapshot {
    row: number;
    col: number;
    value: string;
}

/**
 * Represents a command for cutting a selected area from the grid.
 * @member previousValues - An array of cell snapshots before the cut operation.
 */
export class CutCommand implements Command {
    private previousValues: CellSnapshot[] = [];

    /**
     * Constructor
     * @param sheet Reference to the sheet
     */
    constructor(private sheet: ExcelSheet) { }

    /**
     * Executes the cut command.
     */
    execute() {
        let area = this.sheet.selectedArea;
        let cell = this.sheet.selectedCell;
        if (!area) {          
            if (!cell) return;
            area = {
                startRow: cell.row,
                endRow: cell.row,
                startCol: cell.col,
                endCol: cell.col,
            };
        }


        if (area.startCol === null || area.endCol === null || area.startRow === null || area.endRow === null) return;

        const buffer: string[][] = [];

        area = {
            startRow: Math.min(area.startRow, area.endRow),
            endRow: Math.max(area.startRow, area.endRow),
            startCol: Math.min(area.startCol, area.endCol),
            endCol: Math.max(area.startCol, area.endCol),
        }

        if (area.startCol === null || area.endCol === null || area.startRow === null || area.endRow === null) return;

        

        for (let r = area.startRow; r <= area.endRow; r++) {
            const row: string[] = [];
            for (let c = area.startCol; c <= area.endCol; c++) {
                const cell = this.sheet.getOrCreateCell(r, c);
                if (cell) {
                    this.previousValues.push({ row: r, col: c, value: cell.text });
                    row.push(cell.text);
                    cell.text = "";
                }
            }
            buffer.push(row);
        }

        this.sheet.clipboardBuffer = buffer;
        this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
    }

    /**
     * Undoes the cut command.
     */
    undo() {
        for (const snap of this.previousValues) {
            const cell = this.sheet.getOrCreateCell(snap.row, snap.col);
            if (cell) cell.text = snap.value;
        }

        this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
    }
}
