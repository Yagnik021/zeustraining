import type { Cell } from "../cell";
import type { Command } from "./Command";

export class EditCellCommand implements Command {
    private oldValue: string;

    constructor(
        private row: number,
        private col: number,
        private newValue: string,
        private getCell: (row: number, col: number) => Cell | null,
        private redraw: () => void
    ) {
        this.oldValue = getCell(row, col)?.text || "";
    }

    execute(): void {
        this.getCell(this.row, this.col)?.updateText(this.newValue);
        this.redraw();
    }

    undo(): void {
        this.getCell(this.row, this.col)?.updateText(this.oldValue);
        this.redraw();
    }
}
