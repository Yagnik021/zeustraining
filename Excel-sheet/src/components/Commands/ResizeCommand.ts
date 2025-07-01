import type { Command } from './Command';
import type { ExcelSheet } from "../Excellsheet";

/**
 * Represents a command for resizing a row or column in the grid.
 * @member newSize - The new size of the row or column.
 * @member previousSize - The previous size of the row or column before resizing.
 */
export class ResizeCommand implements Command {
    private previousSize: number;
    private newSize: number;

    /**
     * Constructor
     * @param grid : Reference to the grid 
     * @param type : Type of the row or column
     * @param index : Index of the row or column
     * @param newSize : New size of the row or column
     * @param oldValue : Previous size of the row or column
     */
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

    /**
     * Executes the resize command
     */
    execute(): void {
        if (this.type === 'row') {
            this.grid.rows[this.index].height = this.newSize;
        } else {
            this.grid.columns[this.index].width = this.newSize;
        }

        this.grid.updateCumulativeSizes();
        this.grid.redrawVisible(
            this.grid.container.scrollTop,
            this.grid.container.scrollLeft
        );
    }

    /**
     * Executes the undo command
     */
    undo(): void {
        if (this.type === 'row') {
            this.grid.rows[this.index].height = this.previousSize;
        } else {
            this.grid.columns[this.index].width = this.previousSize;
        }
        
        this.grid.updateCumulativeSizes();
        this.grid.redrawVisible(
            this.grid.container.scrollTop,
            this.grid.container.scrollLeft
        );
    }
}
