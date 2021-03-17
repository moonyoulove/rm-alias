const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    context.subscriptions.push(vscode.commands.registerTextEditorCommand("rm-alias.insert", () => {
        const editor = vscode.window.activeTextEditor;
        const { selection, document } = editor;
        const line = document.lineAt(selection.start);
        const text = document.getText(line.range);
        const regex = /(\S+\.\S+)[ ]*=[ ]*function\((.*)\)[ ]*{/;
        const found = text.match(regex);
        if (found) {
            const { 1: func, 2: args } = found;
            editor.edit(builder => {
                const alias = func.replace(/\.prototype\.|\./g, "_");
                const snippet1 = `const _${alias} = ${func};\n`;
                // @ts-ignore
                const indent = " ".repeat(editor.options.tabSize);
                const snippet2 = `\n${indent}_${alias}.call(this${args ? ", " : ""}${args});`
                builder.insert(line.range.start, snippet1);
                builder.insert(line.range.end, snippet2);
            }).then(() => {
                const start = document.lineAt(line.lineNumber + 1).range.end;
                const end = document.lineAt(line.lineNumber + 2).range.end;
                editor.selection = new vscode.Selection(start, end);
            });
        }
    }));
}
module.exports = { activate };