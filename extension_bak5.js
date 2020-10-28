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
    
    // !VA Declare the selection and assign it. 
    const selection = editor.selection;
    const position = editor.selection.active;
    s = selection.start;
    e = selection.end;
    // !VA Detect cursor or selection
    // if (editor.selection.isEmpty) { 
    //   console.log('ERROR: No selection, just cursor');
    // } else {
    //   console.log('Selection');
    // }

    // !VA Get the cursor position if there is no selection and return it as
    function currentLine() {
      // const position = editor.selection.active;
      // s = selection.start;
      // e = selection.end;
      if (!editor.selection.isEmpty) {
        // !VA Branch: 102820A
        // !VA This has no function, probably. Selection start is always the cursor position, so it doesn't matter what the user selects, it will always return the first character of the selection. This can go away, starting with isEmpty.

          if ( selection.start.line !== selection.end.line ) {
            console.log('ERROR: MULTILINE SELECTION');
          }
      } else {
        // !VA Branch: 102820A
        // !VA Not multiline 
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
    function selectImgNode(tag, curLine) {
      console.log('overpasteSelection running');  
      const overpasteSelection = new vscode.Selection( 
        new vscode.Position( s.line, 0),
        new vscode.Position( s.line, curLine.length));
      editor.selection = overpasteSelection;
      return;

    }

    function getText(startLine, startChar, endLine, endChar) {
      // console.log('getText running'); 
      let curText;


      const startPos = new vscode.Position( startLine, startChar);
      const endPos = new vscode.Position( endLine, endChar )

      curText = editor.document.getText( new vscode.Range( startPos, endPos ))




      return curText;
    }

    function selectParentNode( curTags ) {
      console.log('selectParentNode running'); 
      console.log('curTags :>> ');
      console.log(curTags);

      
      
      let curText, startLine, startChar, endLine, endChar, openTag, closeTag, allText; 
      openTag = openTags[0];
      closeTag = closeTags[0];
      startLine = s.line;
      startChar = 0;
      endLine = s.line;
      const document = editor.document; 
      for (let i = 0; i < 7; i++) {
        endLine = endLine + 1;

        endChar = document.lineAt(new vscode.Position( endLine, startChar)).range.end.character;
        curText = getText( startLine, startChar, endLine, endChar);


        if (curText.includes( closeTag )) {
          console.log('curText :>> ' + curText);
          console.log('HIT');
          break;

        }
      }
      console.log('curText :>> ');
      console.log(curText);

      // while (condition) {
        // code block to be executed
      // }
      // var count = (temp.match(/is/g) || []).length;
      
      // sel = new vscode.Selection( startPos, endPos);
      // editor.selection = sel;




    }
 

    function overpasteSelection(params) {
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
        selectImgNode( curTags[0], curLine);
        
      } else {
        // !VA The img tag is not the parent node.
        selectParentNode( curTags );
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
