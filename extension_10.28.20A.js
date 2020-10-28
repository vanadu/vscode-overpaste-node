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
    let s, e, hasValidTag, curTags = [];
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
    // !VA Detect cursor or selection
    // if (editor.selection.isEmpty) { 
    //   console.log('ERROR: No selection, just cursor');
    // } else {
    //   console.log('Selection');
    // }

    // !VA Get the cursor position if there is no selection and return it as
    function currentLine() {
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
      const lineStart = new vscode.Position( curPos.line, 0);
      const lineEnd = new vscode.Position(curPos.line, endChar);
      const curLine = editor.document.getText(new vscode.Range( lineStart, lineEnd ));
      return curLine;
    }
    const curLine = currentLine();

    // !VA If current line does not include a tag in tagList, return out
    function validTag(curLine) {
      // !VA Test if the current line 
      for (const tag of tagList) {
        if (curLine.includes(tag)) {
          hasValidTag = true;
          break;
        } else {
          hasValidTag = false;
        }
      }
      return hasValidTag;
    }
    
    hasValidTag = validTag(curLine);



    // !VA Paste position is the first character position, leaving leading spaces, i.e. indents
    // const overpasteStart, overpasteEnd;
    function overpasteSelection(tag, curLine) {
      console.log('overpasteSelection running');  
      const position = editor.selection.active;
      s = selection.start;
      e = selection.end;
      // console.log('tag :>> ' + tag);
      // console.log('curLine :>> ' + curLine);
      const overpasteStart = 0;
      const overpasteEnd = curLine.length;
      console.log('overpasteStart :>> ' + overpasteStart);
      console.log('overpasteEnd :>> ' + overpasteEnd);
      const overpasteStartPosition = new vscode.Position( s.line, overpasteStart);
      const overpasteEndPosition = new vscode.Position( s.line, overpasteEnd);
      const overpasteRange = new vscode.Selection( overpasteStartPosition, overpasteEndPosition);
      editor.selection = overpasteRange;


      console.log('overpasteRange :>> ');
      console.log(overpasteRange);
      console.log('HERE');
      // vscode.commands.executeCommand('editor.action.clipboardPasteAction');

      // const clip = vscode.env.clipboard.readText();
      // console.log('clip :>> ' + clip);
      var start = editor.selection.active;
      // Paste from clipboard
      vscode.commands.executeCommand('editor.action.clipboardPasteAction').then(function () {

        var end = editor.selection.active; // Get position after paste
        var selection = new vscode.Selection(start.line, start.character, end.line, end.character); // Create selection




        editor.selection = selection; // Apply selection to editor
        return;
        
        // Format selection, when text is selected, that text is the only thing that will be formatted
        vscode.commands.executeCommand('editor.action.format').then(function () {
            // This is where I really would like the deselection to happen but it runs before
            // formatting is done, I've tried window.onDidChangeTextEditorSelection, but that doesn't
            // seem to work how I would like it to eighther.
            // Until issue #1775 is solved I just use a timeout. 

            setTimeout(function () {
                // Hopefully the format command is done when this happens
                var line = editor.selection.end.line;
                var character = editor.selection.end.character;
                // Set both start and end of selection to the same point so that nothing is selected
                var newSelection = new vscode.Selection(line, character, line, character); // Create selection
                editor.selection = newSelection; // Apply selection to editor
            }, 100);

        });

          });   


      // editor.edit(function (editBuilder) {
      //   editBuilder.replace(overpasteRange, 'asdfasdfasdfasdfasdfasdfasdfd');
      // });
    // !VA Ugh



    }

    if (hasValidTag) {
      // !VA Get which tags are in the current line
      for (const tag of tagList) {
        if (curLine.includes( tag )) {
          curTags.push(tag);
        }
      }
      if ( curTags[0] === '<img ') {
        // !VA Handle the img tag
        console.log('IMG tag is the parent node');
        overpasteSelection( curTags[0], curLine);




        
      } else {
        // !VA The img tag is not the parent node.
        console.log('IMG tag not parent');
      }


    } else {
      console.log('ERROR: invalid tag');
      return;
    }








    // pastePosition(curLine);





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
