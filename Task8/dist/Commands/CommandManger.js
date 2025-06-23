export class CommandManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }
    executeCommand(command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
    }
    undo() {
        const command = this.undoStack.pop();
        console.log(command, " : Command Undo");
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
    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }
}
