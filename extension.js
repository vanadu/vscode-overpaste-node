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
    let curPos, tagList, openTags, closeTags, imgTag, topLineText;
    let s, e, hasValidTag, curTags = [];
    tagList = [ '<table', '<td', '<a', '<img' ];
    openTags = [ '<table', '<td', '<a' ];
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


    var oldDocLength = editor.document.lineCount;
    // console.log('oldDocLength :>> ' + oldDocLength);

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
      console.log('curPos :>> ');
      console.log(curPos);
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
          // return;
        }
      }
      return hasValidTag;
    }
    
    hasValidTag = validTag(curLine);

    // !VA Paste position is the first character position, leaving leading spaces, i.e. indents
    // const overpasteStart, overpasteEnd;`
    function selectImgNode(tag, curLine) {
      console.log('selectImgNode running'); 
      console.log('tag :>> ' + tag); 
      const overpasteSelection = new vscode.Selection( 
        new vscode.Position( s.line, 0),
        new vscode.Position( s.line, curLine.length));
      editor.selection = overpasteSelection;
      return;
    }

    // !VA Create a range from 4 position parameters and return the Range text.
    function getCurText(startLine, startChar, endLine, endChar) {
      // console.log('getCurText running'); 
      let curText;
      const startPos = new vscode.Position( startLine, startChar);
      const endPos = new vscode.Position( endLine, endChar );
      curText = editor.document.getText( new vscode.Range( startPos, endPos ));
      return curText;
    }

    function selectParentNode( curTag ) {
      console.log('selectParentNode running'); 
      let startLine, startChar, endLine, endChar, openTag, closeTag;
      // !VA openTag and closeTag are the current tag in the selected line i.e. the line containing the cursor
      console.log('curTags :>> ');
      console.log(curTags);
      for (let i = 0; i < openTags.length; i++) {
        // console.log('openTags[i] is: ' +  openTags[i]);
        if ( openTags[i].includes( curTag)) {
          openTag = openTags[i];
          closeTag = closeTags[i];
        } 
      }
      // console.log('openTag :>> ' + openTag);
      // console.log('closeTag :>> ' + closeTag);
      var curEndChar, curLineText;
      var openTagCount, closeTagCount;
      // !VA Get the current document in the active editor
      const document = editor.document; 
      // !VA Counter to increment line number s.line where s.line is the line containing the cursor, i.e. the first position of the current user selection.
      var lineCounter = -1;
      // !VA Start with the line containing the cursor as the current range. At this point there is only one opening tag in the current range and no closing tags so start the loop accordingly.
      openTagCount = 1, closeTagCount = 0;
      // !VA Run the loop as long as the number of openTags does not equal the number of closeTags. Once that condition is met, exit the loop. NOTE: This will extend the 

      while ( openTagCount !== closeTagCount ) {  
        lineCounter = lineCounter + 1;
        curEndChar = document.lineAt(new vscode.Position( s.line + lineCounter, 0)).range.end.character;
        curLineText = ( '\n' + getCurText( s.line + lineCounter, 0, s.line + lineCounter, curEndChar));
        // console.log('curLineText :>> ');
        // console.log(curLineText);
        // console.log('openTag :>> ' + openTag);
        // console.log('closeTag :>> ' + closeTag);


        // console.log('curLineText.includes(closeTag) :>> ' + curLineText.includes(closeTag));
        if ( curLineText.includes(closeTag)) {
          // console.log('IF CLAUSE');
          var currentText = getCurText(s.line, 0, (s.line + lineCounter), curEndChar);
          // console.log('currentText :>> ');
          // console.log(currentText);
          // console.log('here');

          // console.log('currentText :>> ');
          // console.log(currentText);
          
          openTagCount = (currentText.match(/<table /g) || []).length;
          closeTagCount = (currentText.match(/<\/table>/g) || []).length;
          // console.log('openTagCount :>> ' + openTagCount);
          // console.log('closeTagCount :>> ' + closeTagCount);
        }

      }
      var curSelection = new vscode.Selection( s.line, 0, (s.line + lineCounter), curEndChar);
      editor.selection = curSelection;
      var curSelectionLineCount = lineCounter + 1;
      console.log('curSelectionLineCount :>> ' + curSelectionLineCount);
      overpasteSelection(curSelectionLineCount);
    }
 

    function overpasteSelection(curSelectionLineCount) {
      console.log('overpasteSelection running'); 
      var start = editor.selection.active;
      console.log('s.line :>> ');
      console.log(s.line);
      // Paste from clipboard
      vscode.commands.executeCommand('editor.action.clipboardPasteAction').then(function () {
        var end = editor.selection.active; // Get position after paste


        var newDocLength = editor.document.lineCount;
        var docLengthDelta = newDocLength - oldDocLength;
        var newSelectionLineCount = curSelectionLineCount + docLengthDelta;
        var newSelectionEndLine = s.line + newSelectionLineCount;
        console.log('newSelectionEndLine :>> ' + newSelectionEndLine);
        const document = editor.document; 
        var newSelectionEndChar = document.lineAt(newSelectionEndLine).range.end.character;
        console.log('newSelectionLineCount :>> ' + newSelectionLineCount);
        var newSelStartPos = new vscode.Position( s.line, 0);
        var newSelEndPos = new vscode.Position( (s.line + newSelectionLineCount), newSelectionEndChar );
        var newSelection = new vscode.Selection( newSelStartPos, newSelEndPos);
        editor.selection = newSelection;


        // var selection = new vscode.Selection(start.line, start.character, end.line, end.character); // Create selection
        // editor.selection = selection; // Apply selection to editor
        return;
        // !VA For l
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
          console.log('curTags :>> ');
          console.log(curTags);
        }
      }
      if ( curTags[0] === '<img ') {
        // !VA Handle the img tag
        console.log('IMG tag is the parent node');
        selectImgNode( curTags[0], curLine);
        
      } else {
        // !VA The img tag is not the parent node.
        selectParentNode( curTags[0] );
        // testMe();
        console.log('IMG tag not parent');
      }


    } else {
      console.log('ERROR: invalid tag');
      return;
    }



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
