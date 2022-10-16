// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  let snippetRange: vscode.Position | null = null;
  let snippetInserted = false;
  let prevLine = -1;
  let prevLineContents = "";
  const snippet = 'border border-red-500 ';
  const editor = vscode.window.activeTextEditor;

  let enabled = false;
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "wch" is now active!');
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

  vscode.commands.registerCommand('wch.toggleWch', () => {
    if (!enabled) {
      enabled = true;
      vscode.window.showInformationMessage('WCH Enabled');
      return;
    }
    if (enabled) {
      if (editor) {
        if(snippetRange && prevLineContents.indexOf(snippet) !== -1) {
          const range = new vscode.Range(new vscode.Position(snippetRange.line, snippetRange.character), new vscode.Position(snippetRange.line, snippetRange.character + snippet.length));
          editor.edit(editBuilder => {
            editBuilder.replace(range, "");
          });
        }
      }
      snippetRange = null;
      snippetInserted = false;
      prevLine = -1;
      prevLineContents = "";

      enabled = false;
      vscode.window.showInformationMessage('WCH Disabled');
      return;
    }
  });

  
    const onChangeEvent = vscode.window.onDidChangeTextEditorSelection(async (e) => {
      if (!enabled) {
        return;
      }
      // console.log(e);
      // vscode.window.showInformationMessage('Selection');

      // console.log('editor is ', editor);
      if (editor) {
        const {text} = editor.document.lineAt(editor.selection.active.line);
        const endTag = text.indexOf('</');
        const startTag = text.indexOf('<');
        const isTag = startTag > -1 && text.includes('>') && (endTag > startTag || endTag === -1);

        // console.log('istag is ', isTag);
        // console.log('prevline is ', prevLine);

        if (prevLine !== editor.selection.active.line) {
          console.log(editor.selection.start.line, '-', editor.selection.end.line);
          if(snippetRange && prevLineContents.indexOf(snippet) !== -1) {
            const range = new vscode.Range(new vscode.Position(snippetRange.line, snippetRange.character), new vscode.Position(snippetRange.line, snippetRange.character + snippet.length));
            editor.edit(editBuilder => {
              editBuilder.replace(range, "");
            });
          }
          snippetRange = null;
          snippetInserted = false;          
        }
        // console.log(editor.selection.active.line);
        if (isTag && (text.indexOf(snippet) === -1 || prevLine !== editor.selection.active.line)) {
          // console.log('in here');
          const slice = text.slice(text.indexOf('<') + 1, text.indexOf('>'));
          const classNamePos = slice.indexOf('className');
          if (classNamePos !== -1) {
            let targetQuote = "";
            let classNameContents = "";
            for (let c of slice) {
              if (c === "'") {
                targetQuote = "'";
                let classNameSlice1 = slice.slice(slice.indexOf(targetQuote) + 1);
                // console.log('class name slice 1 is ', classNameSlice1);
                classNameContents = classNameSlice1.slice(0, classNameSlice1.indexOf(targetQuote));
                break;
              }
              if (c === '"') {
                targetQuote = '"';
                let classNameSlice1 = slice.slice(slice.indexOf(targetQuote) + 1);
                classNameContents = classNameSlice1.slice(0, classNameSlice1.indexOf(targetQuote));
                break;
              }
            }
            // if (classNameContents) {
              const indexOfClassName = text.indexOf('className');
              const classNameOnwards = text.slice(indexOfClassName);
              const indexOfApos = classNameOnwards.indexOf(targetQuote);
              const loc =  indexOfClassName + indexOfApos;
              /// get the position of the inside of quotes after className
              const localSnippetRange = new vscode.Position(editor.selection.active.line, loc + 1);
              if (!snippetInserted && targetQuote && editor.selection.isSingleLine) {
                editor.insertSnippet(new vscode.SnippetString(snippet), localSnippetRange);
                snippetRange = localSnippetRange;
                snippetInserted = true;
                vscode.workspace.saveAll(false);
              }
            // }
          } else {

          }

        }
        if (snippetInserted) {
          prevLine = editor?.selection.active.line ?? -1;
          prevLineContents = text;
        }
      }

    });

    context.subscriptions.push(onChangeEvent);

}

// This method is called when your extension is deactivated
export function deactivate() {}
