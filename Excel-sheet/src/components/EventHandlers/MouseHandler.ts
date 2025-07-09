import type { ExcelSheet } from "../Excellsheet";
import type { MouseStrategy } from "./MouseHandlerStrategy/MouseStrategy";
import { CellSelectionStrategy } from "./MouseHandlerStrategy/CellselectionStrategy";
import { ColumnResizeStrategy } from "./MouseHandlerStrategy/ColumnResizeStrategy";
import { RowResizeStrategy } from "./MouseHandlerStrategy/RowResizeStrategy";
import { ColumnSelectionStrategy } from "./MouseHandlerStrategy/ColumnSelectionStrategy";
import { RowSelectionStrategy } from "./MouseHandlerStrategy/RowSelectionStrategy";
import { CursorStrategy } from "./MouseHandlerStrategy/CursorStrategy";
import { SheetSelectionStrategy } from "./MouseHandlerStrategy/SheetSeletionStrategy";

/**
 * Handles mouse events and delegates them to the appropriate strategy
 */
export class MouseHandler {
    private strategies: MouseStrategy[] = [];
    private activeStrategy: MouseStrategy | null = null;
    private cursorStrategy: CursorStrategy;

    /**
     * Constructor
     * @param sheet The ExcelSheet instance 
     */
    constructor(private sheet: ExcelSheet) {
        this.cursorStrategy = new CursorStrategy(sheet);
        this.strategies = [
            new ColumnResizeStrategy(sheet),
            new RowResizeStrategy(sheet),
            new ColumnSelectionStrategy(sheet),
            new RowSelectionStrategy(sheet),
            new CellSelectionStrategy(sheet),
            new SheetSelectionStrategy(sheet),
        ];
        this.attachEvents();
    }

    /**
     * Attaches event listeners
     */
    attachEvents() {
        this.sheet.container.addEventListener("pointerdown", (e) => this.pointerDown(e as PointerEvent));
        window.addEventListener("pointermove", (e) => this.pointerMove(e as PointerEvent));
        window.addEventListener("pointerup", (e) => this.pointerUp(e as PointerEvent));
    }

    /**
     * Helper method to handle pointer down
     * @param e Pointer event
     */
    pointerDown(e: PointerEvent) {
        for (const strategy of this.strategies) {
            if (strategy.hitTest(e)) {
                this.activeStrategy = strategy;
                strategy.onPointerDown(e);
                break;
            }
        }
    }

    /**
     * Helper method to handle pointer move
     * @param e Pointer event
     */
    pointerMove(e: PointerEvent) {
        this.cursorStrategy.handle(e);
        this.activeStrategy?.onPointerMove(e);
    }

    /**
     * Helper method to handle pointer up
     * @param e Pointer event
     */
    pointerUp(e: PointerEvent) {
        this.activeStrategy?.onPointerUp(e);
        this.activeStrategy = null;
    }
}
