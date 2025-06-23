import { ExcelSheet } from "./excellsheet.js";
const canvas = document.getElementById("canvas");
const container = document.querySelector(".container");
if (canvas === null)
    throw new Error("Canvas not found");
const ctx = canvas.getContext("2d");
const sheet = new ExcelSheet(ctx, canvas, container);
