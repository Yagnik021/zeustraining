import type { ExcelSheet } from "../Excellsheet";
import type { Command } from "./Command";

interface CellSnapshot {
    row: number;
    col: number;
    value: string;
}

/**
 * Represents a command for pasting data into the grid.
 */
export class PasteCommand implements Command {
    private previousValues: CellSnapshot[] = [];

    /**
     * constructor
     * @param sheet : Reference to the sheet 
     * @param startRow : Start row for the selection
     * @param startCol : Start column for the selection
     * @param dataToPaste : Data to paste
     */
    constructor(
        private sheet: ExcelSheet,
        private startRow: number,
        private startCol: number,
        private dataToPaste: string[][]
    ) {}

    /**
     * Executes the paste command
     */
    execute() {
        for (let r = 0; r < this.dataToPaste.length; r++) {
            for (let c = 0; c < this.dataToPaste[r].length; c++) {
                const row = this.startRow + r;
                const col = this.startCol + c;
                const cell = this.sheet.getOrCreateCell(row, col);
                if (cell) {
                    this.previousValues.push({ row, col, value: cell.text });
                    cell.text = this.dataToPaste[r][c];
                }
            }
        }

        this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
    }

    /**
     * Undoes the paste command
     */
    undo() {
        for (const snapshot of this.previousValues) {
            const cell = this.sheet.getOrCreateCell(snapshot.row, snapshot.col);
            if (cell) {
                cell.text = snapshot.value;
            }
        }

        this.sheet.redrawVisible(this.sheet.container.scrollTop, this.sheet.container.scrollLeft);
    }
}
