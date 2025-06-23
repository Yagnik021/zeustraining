import type { Command } from './Command';
import { ExcelSheet } from "../excellsheet";

export class EditCellCommand implements Command {
    private oldValue: string;

    constructor(
        private grid: ExcelSheet, 
        private row: number,
        private col: number,
        private newValue: string 
    ) {
        this.oldValue = this.grid.getCell(row, col)?.text || "";
        console.log(this.grid.getCell(row, col) , " : EditCell");
    }

    execute(): void {
        this.grid.getCell(this.row, this.col)?.updateText(this.newValue);
        this.grid.redrawVisible(this.grid?.container?.scrollTop, this.grid.container.scrollLeft); 
    }

    undo(): void {
        this.grid.getCell(this.row, this.col)?.updateText(this.oldValue);
        this.grid.redrawVisible(this.grid.container.scrollTop, this.grid.container.scrollLeft); 
    }
}
