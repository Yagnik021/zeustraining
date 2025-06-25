import type { Command } from "./Command";

export class CommandManager {
    private undoStack: Command[] = [];
    private redoStack: Command[] = [];

    executeCommand(command: Command) {
        console.log("Change this floa");
        
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
        console.log(this.redoStack);

    }

    redo() {
        const command = this.redoStack.pop();
        console.log(command);

        console.log(this.redoStack);
        if (command) {
            command.execute();
            this.undoStack.push(command);
        }
        console.log(this.undoStack);

    }

    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }
}
