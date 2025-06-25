import type { Command } from "./Command";

export class CommandManager {
    private undoStack: Command[] = [];
    private redoStack: Command[] = [];

    executeCommand(command: Command) {        
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
    }

    undo() {
        const command = this.undoStack.pop();

        if (command) {
            command.undo();
            this.redoStack.push(command);
        }
    }

    redo() {
        const command = this.redoStack.pop();
        if (command) {
            command.execute();
            this.undoStack.push(command);
        }
    }

    // clear() {
    //     this.undoStack = [];
    //     this.redoStack = [];
    // }
}
