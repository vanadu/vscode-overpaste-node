// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "vscode-overpaste-node" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('overpasteNode.overpaste-node', function () {

    console.log('Running overpasteNode');
    // The code you place here will be executed every time your command is executed
    vscode.window.showInformationMessage("overpasteNode updated...")
    // !VA overPasteNode code
    // !VA --------------------------
    let pastePos, activeTag, curPos, tagList, openTags, closeTags, imgTag, topLineText;
    let s, e, isMultiLine, isNoTag;
    tagList = [ '<table ', '<td ', '<a ', '<img ' ];
    openTags = [ '<table ', '<td ', '<a ' ];
    closeTags = [ '</table>', '</td>', '</a>'] 

    // !VA Declare the editor and assign it
    const editor = vscode.window.activeTextEditor;
    // !VA If there is no editor or it is undefined, error message and return out
    if (!editor) {
      vscode.window.showInformationMessage("editor does not exist");
      return;
    }
    
    // !VA Declare the selection and assign it
    const selection = editor.selection;
    console.log('selection :>> ');
    console.log(selection);
    
    if (editor.selection.isEmpty) { 
      console.log('ERROR: No selection, just cursor');
    } else {
      console.log('Selection');
    }


    // !VA Get the cursor position if there is no selection and return it as
    function getCurrentLine() {
      const position = editor.selection.active;
      s = selection.start;
      e = selection.end;
        if (!editor.selection.isEmpty) {
          // !VA Determine if the selection is multiline. If it is, return out and show an error. If it's multiline, we don't know which line reflected the user's intention. For later...
          if ( selection.start.line !== selection.end.line ) {
            console.log('ERROR: MULTILINE SELECTION');
          }
        } else {
      }
      curPos = s;

      const document = editor.document; 
      var endChar = document.lineAt(curPos).range.end.character;
      console.log('endChar :>> ' + endChar);
      const lineStartPos = new vscode.Position( curPos.line, 0);
      const lineEndPos = new vscode.Position(curPos.line, endChar);
      const curLineRange = new vscode.Range( lineStartPos, lineEndPos );
      const curLine = editor.document.getText(new vscode.Range( lineStartPos, lineEndPos ));
      console.log('curLine :>> ' + curLine);


    }
    curPos = getCurrentLine();






    // var endPos = curLineStart.with({ line: 1, character: 15 });

    // console.log('endPos :>> ');
    // console.log(endPos);


    // console.log('curPos :>> ' + curPos);
    // console.log(curPos);
    // console.log(`curPos.line is: ${curPos.line}; curPos.character is ${curPos.character}`);

    // !VA Now determine if the current line has a tag in tagList





    



		// Display a message box to the user 


	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
