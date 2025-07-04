// KeyDownHandler.ts

import { copySelectionToClipboardBuffer } from "../Commands/CopyCommad";
import { CutCommand } from "../Commands/CutCommand";
import { PasteCommand } from "../Commands/PastCommand";
import type { ExcelSheet } from "../Excellsheet";

export class KeyDownHandler {
    private sheet: ExcelSheet;

    constructor(sheet: ExcelSheet) {
        this.sheet = sheet;
        document.addEventListener("keydown", this.onKeyDown.bind(this));
    }

    private onKeyDown(e: KeyboardEvent) {
        const sheet = this.sheet;

        // Handle Ctrl shortcuts
        if (e.ctrlKey) {
            switch (e.key) {
                case "z": sheet.commandManager.undo(); return;
                case "y": sheet.commandManager.redo(); return;
                case "c": copySelectionToClipboardBuffer(sheet); return;
                case "x": sheet.commandManager.executeCommand(new CutCommand(sheet)); return;
                case "v":
                    if (sheet.clipboardBuffer && sheet.selectedCell) {
                        const { row, col } = sheet.selectedCell;
                        sheet.commandManager.executeCommand(new PasteCommand(sheet, row, col, sheet.clipboardBuffer));
                    }
                    return;
            }
        }

        if (sheet.isInputOn) return;

        if (!e.ctrlKey && !e.shiftKey) {
            sheet.selectedRows.length = 0;
            sheet.selectedCols.length = 0;
        }

        if (!sheet.selectedCell) {
            sheet.selectedCell = { row: 0, col: 0 };
        }

        const { row, col } = sheet.selectedCell;
        let newRow = row;
        let newCol = col;
        const isShift = e.shiftKey;
        const area = sheet.selectedArea;

        if (isShift) {
            this.handleShiftSelection(e, row, col, newRow, newCol);
            return;
        }

        this.handleNavigation(e, row, col, area);

        // Printable character
        const isPrintable = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
        if (isPrintable) {
            sheet.showInputOverCell(sheet.getOrCreateCell(newRow, newCol), newRow, newCol, e.key);
        }
    }

    private handleShiftSelection(e: KeyboardEvent, row: number, col: number, newRow: number, newCol: number) {
        const s = this.sheet;

        if (s.selectedArea.startRow === null || s.selectedArea.startCol === null) {
            s.selectedArea = { startRow: row, startCol: col, endRow: row, endCol: col };
        }

        switch (e.key) {
            case "ArrowRight":
                newCol = Math.min(s.selectedArea.endCol! + 1, s.columns.length - 1);
                s.selectedArea.endCol = newCol;
                break;
            case "ArrowLeft":
                newCol = Math.max(s.selectedArea.endCol! - 1, 0);
                s.selectedArea.endCol = newCol;
                break;
            case "ArrowDown":
                newRow = Math.min(s.selectedArea.endRow! + 1, s.rows.length - 1);
                s.selectedArea.endRow = newRow;
                break;
            case "ArrowUp":
                newRow = Math.max(s.selectedArea.endRow! - 1, 0);
                s.selectedArea.endRow = newRow;
                break;
            default: return;
        }

        s.scrollIntoView(newRow, newCol);
        s.calculateAreaStatus?.();
        s.redrawVisible(s.container.scrollTop, s.container.scrollLeft);
    }

    private handleNavigation(e: KeyboardEvent, row: number, col: number, area: { startRow: number | null, endRow: number | null, startCol: number | null, endCol: number | null }) {
        const s = this.sheet;
        let newRow = row, newCol = col;
        const clearArea = () => s.selectedArea = { startRow: null, endRow: null, startCol: null, endCol: null };
        const areaExists = area.startRow !== null;

        switch (e.key) {
            case "ArrowRight":
                if (areaExists) clearArea();
                newCol = Math.min(col + 1, s.columns.length - 1);
                break;
            case "ArrowLeft":
                if (areaExists) clearArea();
                newCol = Math.max(col - 1, 0);
                break;
            case "ArrowDown":
                if (areaExists) clearArea();
                newRow = Math.min(row + 1, s.rows.length - 1);
                break;
            case "ArrowUp":
                if (areaExists) clearArea();
                newRow = Math.max(row - 1, 0);
                break;
            case "Enter":
                if (areaExists) {
                    const start = area.startRow!, end = area.endRow!;
                    if (e.shiftKey) newRow = row > start ? row - 1 : end;
                    else {
                        newRow = row < end ? row + 1 : start;
                        if (row === end) newCol = col + 1 <= area.endCol! ? col + 1 : area.startCol!;
                    }
                } else {
                    newRow++;
                    if (newRow >= s.rows.length) {
                        newRow = 0;
                        newCol++;
                    }
                    newCol = Math.min(newCol, s.columns.length - 1);
                }
                break;
            case "Tab":
                e.preventDefault();
                if (areaExists) {
                    const start = area.startCol!, end = area.endCol!;
                    newCol = col < end ? col + 1 : start;
                    if (col === end) newRow = row + 1 <= area.endRow! ? row + 1 : area.startRow!;
                } else {
                    newCol++;
                    if (newCol >= s.columns.length) {
                        newCol = 0;
                        newRow++;
                    }
                    newRow = Math.min(newRow, s.rows.length - 1);
                }
                break;
            default:
                return;
        }

        s.selectedCell = { row: newRow, col: newCol };
        s.scrollIntoView(newRow, newCol);
        s.redrawVisible(s.container.scrollTop, s.container.scrollLeft);
    }
}
