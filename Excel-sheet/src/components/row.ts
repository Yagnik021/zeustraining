/**
 * Represents a row in the Excel sheet.
 * @param {number} height - The height of the row in pixels.
 */
class Row {
    height: number;

    /**
     * @param height - The height of the row in pixels (defaults to 100). 
     */
    constructor(height: number = 100) {
        this.height = height;
    }
}

export { Row };