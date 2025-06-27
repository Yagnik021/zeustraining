import type { Command } from './Command';
import type { ExcelSheet } from "../Excellsheet";

export class ResizeCommand implements Command {
    private previousSize: number;
    private newSize: number;

    constructor(
        private grid: ExcelSheet,
        private type: 'row' | 'column',
        private index: number,
        newSize: number,
        oldValue : number 
    ) {
        this.newSize = newSize;
        this.previousSize = oldValue;
       
    }

    execute(): void {
        if (this.type === 'row') {
            this.grid.rows[this.index].height = this.newSize;
        } else {
            this.grid.columns[this.index].width = this.newSize;
        }

        this.grid.redrawVisible(
            this.grid.container.scrollTop,
            this.grid.container.scrollLeft
        );
    }

    undo(): void {
        if (this.type === 'row') {
            this.grid.rows[this.index].height = this.previousSize;
        } else {
            this.grid.columns[this.index].width = this.previousSize;
        }

        this.grid.redrawVisible(
            this.grid.container.scrollTop,
            this.grid.container.scrollLeft
        );
    }
}
