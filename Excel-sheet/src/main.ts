import { ExcelSheet } from "./components/Excellsheet";
import { Row } from "./components/Row";
const container = document.querySelector(".container") as HTMLElement;
const canvas = document.createElement("canvas");
container.appendChild(canvas);
canvas.id = "canvas";

if (canvas === null) throw new Error("Canvas not found");

const formularBarInput = document.querySelector(".formular-bar-input") as HTMLInputElement;
const sheet = new ExcelSheet(canvas, container, formularBarInput);

function setupActionButtons() {
    const addRowBtn = document.getElementById("add-row");
    const addColBtn = document.getElementById("add-column");

    addRowBtn?.addEventListener("click", () => {
        let min = sheet.rows.length;
        for (var i = 0; i < sheet.selectedRows.length; i++) {
            if (sheet.selectedRows[i] < min) {
                min = sheet.selectedRows[i];
            };
        }
        let selectedRow = Math.min(sheet.selectedArea.startRow ?? sheet.rows.length - 1, sheet.selectedArea.endRow ?? sheet.rows.length - 1); 
        if (selectedRow < min)
            min = selectedRow;
        if (min != null) {
            sheet.addRow(min);
            sheet.redrawVisible(sheet.container.scrollTop, sheet.container.scrollLeft);
        }
    });

    addColBtn?.addEventListener("click", () => {
        let min = sheet.columns.length;
        for (var i = 0; i < sheet.selectedCols.length; i++) {
            if (sheet.selectedCols[i] < min) {
                min = sheet.selectedCols[i];
            };
        }
        let selectedCol = Math.min(sheet.selectedArea.startCol ?? sheet.columns.length - 1, sheet.selectedArea.endCol ?? sheet.columns.length - 1);
        if (selectedCol < min)
            min = selectedCol;
        if (min != null) {
            sheet.addColumn(min);
            sheet.redrawVisible(sheet.container.scrollTop, sheet.container.scrollLeft);
        }
    });
}

setupActionButtons();