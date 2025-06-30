import type { ExcelSheet } from "../Excellsheet";

export function copySelectionToClipboardBuffer(sheet: ExcelSheet) {
    let area = sheet.selectedArea;
    let cell = sheet.selectedCell;
    if (!area) {
        if (!cell) return;
        area = {
            startRow: cell.row,
            endRow: cell.row,
            startCol: cell.col,
            endCol: cell.col,
        };
    }


    if (area.startCol === null || area.endCol === null || area.startRow === null || area.endRow === null) return;

    const buffer: string[][] = [];

    area = {
        startRow: Math.min(area.startRow, area.endRow),
        endRow: Math.max(area.startRow, area.endRow),
        startCol: Math.min(area.startCol, area.endCol),
        endCol: Math.max(area.startCol, area.endCol),
    }

    if (area.startCol === null || area.endCol === null || area.startRow === null || area.endRow === null) return;

    for (let r = area.startRow; r <= area.endRow; r++) {
        const row: string[] = [];
        for (let c = area.startCol; c <= area.endCol; c++) {
            const cell = sheet.getOrCreateCell(r, c);
            row.push(cell?.text ?? "");
        }
        buffer.push(row);
    }

    sheet.clipboardBuffer = buffer;
}
