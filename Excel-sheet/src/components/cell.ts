import { evaluateFormula } from "./Utils/evaluator";

/**
 * Represents a cell in the Excel sheet.
 * @param {string} text - The text content of the cell.
 * @param {number} rowIndex - The row index of the cell.
 * @param {number} colIndex - The column index of the cell.
 */
class Cell {
    text: string;
    displayValue: string;
    /**
     * Constructs a new instance of the Cell class.
     * @param {string} text - The text content of the cell.
     * @param {number} rowIndex - The row index of the cell.
     * @param {number} colIndex - The column index of the cell.
     */
    constructor(text: string = "") {
        this.text = text;
        this.displayValue = text;
    }

    /**
     * This method updates the text content of the cell.
     * @param newText New text to update the cell with.
     */
    updateText(newText?: string | null, newDisplayValue?: string | null) {
        this.text = newText ?? "";
        if(newText?.startsWith("=")){
            this.displayValue = newDisplayValue ?? newText ?? "";
        }else{
            this.displayValue = this.text; 
        }
    }
}

export { Cell };