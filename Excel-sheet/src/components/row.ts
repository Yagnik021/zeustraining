/**
 * Represents a row in the Excel sheet.
 * @param {number} height - The height of the row in pixels.
 */
class Row {
    height: number;
    constructor(height: number = 100) {
        this.height = height;
    }
}

export { Row };