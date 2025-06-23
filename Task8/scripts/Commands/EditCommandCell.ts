import { Command } from "./Commands";

export class EditCellCommand implements Command {
    private oldValue: string;

    constructor(
        private grid: any, 
        private row: number,
        private col: number,
        private newValue: string
    ) {
        this.oldValue = this.grid.getCell(row, col)?.value || "";
    }

    execute(): void {
        this.grid.getCell(this.row, this.col).value = this.newValue;
        this.grid.redrawVisible(this.grid.container.scrollTop, this.grid.container.scrollLeft); 
    }

    undo(): void {
        this.grid.getCell(this.row, this.col).value = this.oldValue;
        this.grid.redrawVisible(this.grid.container.scrollTop, this.grid.container.scrollLeft); 
    }
}
