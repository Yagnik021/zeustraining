/**
 * Represents a column in the Excel sheet.
 */
class Column {
    index: number;
    width: number;
    label: string;

    /**
     * @param index Index of the column in the Excel sheet (0-indexed)
     * @param width Width of the column in pixels (default: 100)
     */
    constructor(index: number, width: number = 100) {
        this.index = index;
        this.width = width;
        this.label = Column.generateLabel(index);
    }

    /**
     * Generates the column label (e.g., A, B, ..., Z, AA, AB, etc.)
     * @param index Column index
     * @returns Column label
     */
    private static generateLabel(index: number): string {
        let label = "";
        let i = index;
        while (i >= 0) {
            label = String.fromCharCode((i % 26) + 65) + label;
            i = Math.floor(i / 26) - 1;
        }
        return label;
    }

    /**
     * Updates the column index and its label accordingly.
     * Useful after inserting/deleting columns.
     * @param newIndex Updated column index
     */
    updateIndex(newIndex: number) {
        this.index = newIndex;
        this.label = Column.generateLabel(newIndex);
    }
}

export { Column };
