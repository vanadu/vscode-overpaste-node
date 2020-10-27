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
	console.log('Congratulations, your extension "swapnodewithclipboard" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('swapnodewithclipboard.swapnode', function () {

    console.log('Running swapNodeWithClipboard');
    // The code you place here will be executed every time your command is executed
    vscode.window.showInformationMessage("Changed")
    // !VA Plan:
    // !VA Don't forget to search first for IMG, because if that's the current tag then all you have to do is replace that line.




    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage("editor does not exist");
      return;
    }

    const selection = editor.selection;
    let s, e;
    const openTags = [ '<table ', '<td ', '<a ', '<img ' ];
    const closeTags = [ '</table>', '</td>', '</a>'] 
    // !VA How to create new position objects for Range
    // s = new vscode.Position(243, 31);
    // s = new vscode.Position( 243, 41);
 

    function getCursorPosition() {
      console.log('getCursorPosition running'); 
      let curPos, s, e;
      console.log('EMPTY');
      // the Position object gives you the line and character where the cursor is
      const position = editor.selection.active;
      // vscode.window.showInformationMessage("position.line is: " + position.line );
      // vscode.window.showInformationMessage("position.character is: " + position.character );

      s = selection.start;
      e = selection.end;
      console.log(`s.line is: ${s.line}; s.character is ${s.character}`);
      console.log(`e.line is: ${e.line}; e.character is ${e.character}`);
      if ( s.line === e.line && s.character === e.character) {
        console.log('NO SELECTION: CURSOR');
        return s;
      }
    }


    // check if there is no selection
    if (editor.selection.isEmpty) {

      var curPos = getCursorPosition();
      console.log('curPos :>> ' + curPos);
      console.log(curPos);
      console.log(`curPos.line is: ${curPos.line}; curPos.character is ${curPos.character}`);
      var topLineStart =  new vscode.Position(curPos.line, 0);
      var nextLineStart = new vscode.Position(curPos.line + 1, 0);
      var topLine = new vscode.Range( topLineStart, nextLineStart);
      var topLineText = editor.document.getText(topLine);
      console.log('topLineText :>> ' + topLineText);
      for (const tag of openTags) {
        if (topLineText.includes(tag)) {
          console.log('HIT');
          var hitStart = topLineText.indexOf( tag);
          var hitEnd = hitStart + tag.length;
          console.log('hitStart :>> ' + hitStart);
          console.log('hitEnd :>> ' + hitEnd);
          console.log(`topLineText.substring( hitStart, hitEnd) :>> '${topLineText.substring( hitStart, hitEnd)}'`);




        } else {
          // console.log('NO HIT');
        }
      }


     



    } else {
      console.log('NOT empty');
      s = selection.start;
      e = selection.end;
      var foo = new vscode.Range( s , e );
      var faa = editor.document.getText(foo);
      console.log('faa :>> ' + faa);
    }






    // let hasSelection = s.line !== e.line || s.character !== e.character;



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
