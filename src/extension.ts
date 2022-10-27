import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

  let snippetRange: vscode.Position | null = null;
  let snippetInserted = false;
  let prevLine = -1;
  let prevLineContents = "";
  let editor: vscode.TextEditor | undefined;

  const snippet = 'border border-red-500 ';

  let enabled = false;

  const registerCommand = vscode.commands.registerCommand('wch.toggleWch', () => {
    if (!enabled) {
      enabled = true;
      editor = vscode.window.activeTextEditor;
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
      vscode.workspace.saveAll(false);
      vscode.window.showInformationMessage('WCH Disabled');
      return;
    }
  });

    const onChangeEditor = vscode.window.onDidChangeActiveTextEditor(async (e) => {
      let newEditor = vscode.window.activeTextEditor;
      let newLanguage = newEditor?.document.languageId;
      editor = newLanguage === 'typescriptreact' ? newEditor : undefined;
    });
  
    const onChangeEvent = vscode.window.onDidChangeTextEditorSelection(async (e) => {
      if (!enabled) {
        return;
      }

      if (editor) {
        const {text} = editor.document.lineAt(editor.selection.active.line);
        const endTag = text.indexOf('</');
        const startTag = text.indexOf('<');
        const beginningOfStartTag = startTag;
        const isTag = startTag > -1 && text.includes('>') && (endTag > startTag || endTag === -1);

        if (prevLine !== editor.selection.active.line) {
          if(snippetRange && prevLineContents.indexOf(snippet) !== -1) {
            const range = new vscode.Range(new vscode.Position(snippetRange.line, snippetRange.character), new vscode.Position(snippetRange.line, snippetRange.character + snippet.length));
            editor.edit(editBuilder => {
              editBuilder.replace(range, "");
            });
          }
          snippetRange = null;
          snippetInserted = false;          
        }
        if (isTag && (text.indexOf(snippet) === -1 || prevLine !== editor.selection.active.line)) {
          // TODO: if there is an intermediate greater than symbol, this can't be parsed yet: therefore it is advised to use className before any inequality logic
          const endOfStartTag = text.indexOf('>');
          const slice = text.slice(beginningOfStartTag + 1, endOfStartTag);
          const classNamePos = slice.indexOf('className');
          if (classNamePos !== -1) {
            const classNameSlice = slice.slice(classNamePos);
            let targetQuote = "";
            let classNameContents = "";
            for (let c of classNameSlice) {
              if (c === "'") {
                targetQuote = "'";
                let classNameSlice1 = classNameSlice.slice(classNameSlice.indexOf(targetQuote) + 1);
                classNameContents = classNameSlice1.slice(0, classNameSlice1.indexOf(targetQuote));
                break;
              }
              if (c === '"') {
                targetQuote = '"';
                let classNameSlice1 = classNameSlice.slice(classNameSlice.indexOf(targetQuote) + 1);
                classNameContents = classNameSlice1.slice(0, classNameSlice1.indexOf(targetQuote));
                break;
              }
            }

              const indexOfClassName = text.indexOf('className');
              const indexOfApos = classNameSlice.indexOf(targetQuote);
              const loc =  indexOfClassName + indexOfApos;
              /// get the position of the inside of quotes after className
              const localSnippetRange = new vscode.Position(editor.selection.active.line, loc + 1);
              if (!snippetInserted && targetQuote && editor.selection.isSingleLine) {
                editor.insertSnippet(new vscode.SnippetString(snippet), localSnippetRange);
                snippetRange = localSnippetRange;
                snippetInserted = true;
                vscode.workspace.saveAll(false);
              }
          // handle what happens when there's no className on the tag
          } else {
            // TODO
          }

        }
        if (snippetInserted) {
          prevLine = editor?.selection.active.line ?? -1;
          prevLineContents = text;
        }
      }

    });

    context.subscriptions.push(registerCommand, onChangeEvent, onChangeEditor);

}

export function deactivate() {}
