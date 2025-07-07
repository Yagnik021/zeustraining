import type { Cell } from "../Cell";
import type { Command } from "./Command";

/**
 * Represents a command for editing a cell in the grid. 
   @member oldValue - The old value of the cell before editing. 
*/
export class EditCellCommand implements Command {
    private oldValue: string;
    private oldDisplayValue: string;
    /**
     * @param row Row index of the cell
     * @param col Column index of the cell
     * @param newValue New value of the cell
     * @param getCell Function to get the cell
     * @param redraw To redraw the grid
     */
    constructor(
        private row: number,
        private col: number,
        private newValue: string,
        private newDisplayValue: string,
        private getCell: (row: number, col: number) => Cell | null,
        private redraw: () => void,
    ) {
        this.oldValue = getCell(row, col)?.text || "";
        this.oldDisplayValue = getCell(row, col)?.displayValue || "";
    }

    execute(): void {
        this.getCell(this.row, this.col)?.updateText(this.newValue, this.newDisplayValue);
        this.redraw();
    }

    undo(): void {
        this.getCell(this.row, this.col)?.updateText(this.oldValue, this.oldDisplayValue);
        this.redraw();
    }
}
