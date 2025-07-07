// formulas/evaluator.ts
import { a1ToIndexes } from "./a1Utils";
import { ExcelSheet } from "../Excellsheet"; // adjust path as needed
import { Cell } from "../Cell";

export function evaluateFormula(formula: string, sheet: ExcelSheet): string {
    const match = formula.match(/^=([A-Z]+)\((\w+\d+):(\w+\d+)\)$/i);
    if (!match) return formula;

    const func = match[1].toUpperCase();
    const start = match[2];
    const end = match[3];

    const cells = getCellsInRange(sheet, start, end);
    const nums = cells.map(c => parseFloat(c.text)).filter(n => !isNaN(n));

    switch (func) {
        case "SUM": return String(nums.reduce((a, b) => a + b, 0));
        case "AVG": return nums.length ? String(nums.reduce((a, b) => a + b, 0) / nums.length) : "0";
        case "MIN": return nums.length ? String(Math.min(...nums)) : "";
        case "MAX": return nums.length ? String(Math.max(...nums)) : "";
        default: return "ERROR";
    }
}

function getCellsInRange(sheet: ExcelSheet, start: string, end: string): Cell[] {
    const { row: startRow, col: startCol } = a1ToIndexes(start);
    const { row: endRow, col: endCol } = a1ToIndexes(end);

    const result: Cell[] = [];

    for (let row = Math.min(startRow, endRow); row <= Math.max(startRow, endRow); row++) {
        const rowMap = sheet.cells.get(row);
        if (!rowMap) continue;

        for (let col = Math.min(startCol, endCol); col <= Math.max(startCol, endCol); col++) {
            const cell = rowMap.get(col);
            if (cell) result.push(cell);
        }
    }

    return result;
}
