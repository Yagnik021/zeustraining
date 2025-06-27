import type { ExcelSheet } from "../Excellsheet";
import type { Command } from "./Command";

interface CellSnapshot {
    row: number;
    col: number;
    value: string;
}

export class CutCommand implements Command {
    private previousValues: CellSnapshot[] = [];

    constructor(private sheet: ExcelSheet) { }

    execute() {
        let area = this.sheet.selectedArea;
        let cell = this.sheet.selectedCell;
        if (!area) {
            console.log("inside");
            
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
                const cell = this.sheet.getCell(r, c);
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

    undo() {
        for (const snap of this.previousValues) {
            const cell = this.sheet.getCell(snap.row, snap.col);
            if (cell) cell.text = snap.value;
        }

        this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
    }
}
