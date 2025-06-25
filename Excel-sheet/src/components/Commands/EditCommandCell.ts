import type { Cell } from "../cell";
import type { ExcelSheet } from "../excellsheet";
import type { Command } from "./Command";

export class EditCellCommand implements Command {
    private oldValue: string;

    constructor(
        private shit: ExcelSheet,
        private row: number,
        private col: number,
        private newValue: string,
        private getCell: (row: number, col: number) => Cell | null,
        private redraw: () => void,
    ) {
        this.oldValue = getCell(row, col)?.text || "";
    }

    execute(): void {
        this.shit.suppressCommand = true;
        this.getCell(this.row, this.col)?.updateText(this.newValue);
        this.redraw();
        this.shit.suppressCommand = false;
    }

    undo(): void {
        this.shit.suppressCommand = true;
        this.getCell(this.row, this.col)?.updateText(this.oldValue);
        this.redraw();
        this.shit.suppressCommand = false;
    }
}
