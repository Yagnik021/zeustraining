import type { Command } from "./Command";

/**
 * Represents a manager for executing and undoing commands.
 * @member Command[] undoStack - An array of commands that have been executed and can be undone.
 * @member Command[] redoStack - An array of commands that have been undone and can be redone.
 */
export class CommandManager {
    private undoStack: Command[] = [];
    private redoStack: Command[] = [];

    /**
     * Executes a command and adds it to the undo stack.
     * @param command The command to execute
     */
    executeCommand(command: Command) {        
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
    }

    /**
     * Undoes the last executed command and adds it to the redo stack.
     */
    undo() {
        const command = this.undoStack.pop();

        if (command) {
            command.undo();
            this.redoStack.push(command);
        }
    }

    /**
     * Redoes the last undone command and adds it to the undo stack.
     */
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
