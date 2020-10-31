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
    // The code you place here will be executed every time your command is executed
    vscode.window.showInformationMessage("overpasteNode updated...")
    // !VA overPasteNode code
    // !VA --------------------------
    let endChar, curRange, curSelection, tagList, openTags, closeTags, imgTag, topLineText;
    let s, e, hasValidTag, curTags = [];
    let startDocLineCount;
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

    // !VA Declare the current cursor position/selection and assign it. 
    const selection = editor.selection;
    // !VA Branch: 103120A I don't know why position is not accessed below
    const position = editor.selection.active;
    s = selection.start;
    e = selection.end;
    // !VA Branch: 103120A
    // !VA docLineCount: line count before overpasting content. Used to select the new content after overpasting.
    startDocLineCount = editor.document.lineCount;
    
    // !VA Get the line at the cursor/start of current selection
    function currentLine() {
      // !VA Branch: 103120A This is where position would be accessed if it were needed
      // const position = editor.selection.active;
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
      const document = editor.document; 
      // !VA Get the end character of the line containing the cursor i.e. the first line of the current selection.
      endChar = getEndChar( s.line );
      // !VA Get the range from the start to the end of the current line
      curRange = getRange( new vscode.Position( s.line, 0), new vscode.Position(s.line, endChar) )
      // !VA Get the text of the current line and return it
      const curLine = editor.document.getText( curRange );
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
    // !VA Bool indicating whether the current line has a valid tag
    hasValidTag = validTag(curLine);

    // !VA Create a range from 4 position parameters and return the Range text.
    function getCurText(startLine, startChar, endLine, endChar) {
      // console.log('getCurText running'); 
      let curText;
      const startPos = new vscode.Position( startLine, startChar);
      const endPos = new vscode.Position( endLine, endChar );
      curText = editor.document.getText( new vscode.Range( startPos, endPos ));
      return curText;
    }

    // !VA Get the end position from the line number
    function getEndChar(lineNumber) {
      // console.log('getEndChar running'); 
      let endChar;
      endChar = editor.document.lineAt(new vscode.Position( lineNumber, 0)).range.end.character;
      return endChar
    }

    // !VA Get a range from a start and end vscode Position object
    function getRange(start, end) {
      const r = new vscode.Range( start, end);
      return r;
    }

    // !VA Get a selection from a start and end vscode Position object
    function getSelection(start, end) {
      const sel = new vscode.Selection( start, end);
      return sel;
    }

    // !VA Paste position is the very start of the line, i.e. char 0. VS Code then handles the indents properly, otherwise the first line of the pasted content would be indented, the remaining lines not.
    // !VA Branch: 103120A
    // !VA Review this and compare to selectParentNode re: whether the selection or range is overpasted and how the result is handled in overpasteSelection
    function selectImgNode(  ) {
      console.log('selectImgNode running'); 
      endChar = getEndChar( s.line );
      editor.selection = getSelection( new vscode.Position(s.line, 0), new vscode.Position( s.line, endChar));
      overpasteSelection(1)
      return;
    }

    function selectParentNode( curTag ) {
      console.log('selectParentNode running'); 
      let openTag, closeTag;
      // !VA openTag and closeTag are the current tag in the selected line i.e. the line containing the cursor
      // console.log('curTags :>> ');
      // console.log(curTags);
      for (let i = 0; i < openTags.length; i++) {
        // console.log('openTags[i] is: ' +  openTags[i]);
        if ( openTags[i].includes( curTag)) {
          openTag = openTags[i];
          closeTag = closeTags[i];
        } 
      }
      console.log('openTag :>> ' + openTag);
      console.log('closeTag :>> ' + closeTag);
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
        curEndChar = getEndChar( s.line + lineCounter);
        // curEndChar = document.lineAt(new vscode.Position( s.line + lineCounter, 0)).range.end.character;
        curLineText = ( '\n' + getCurText( s.line + lineCounter, 0, s.line + lineCounter, curEndChar));
        if ( curLineText.includes(closeTag)) {
          var currentText = getCurText(s.line, 0, (s.line + lineCounter), curEndChar);

          var oMatch = new RegExp(openTag, 'g');
          var cMatch = new RegExp(closeTag, 'g');
          openTagCount = ((currentText.match(oMatch)) || []).length;
          console.log('openTagCount :>> ' + openTagCount);
          closeTagCount = ((currentText.match(cMatch)) || []).length;
          console.log('closeTagCount :>> ' + closeTagCount);
          
          // openTagCount = (currentText.match(/<table /g) || []).length;
          // closeTagCount = (currentText.match(/<\/table>/g) || []).length;
          // console.log('closeTagCount :>> ' + closeTagCount);
        }

      }
      var curSelection = new vscode.Selection( s.line, 0, (s.line + lineCounter), curEndChar);
      editor.selection = curSelection;
      var curSelectionLineCount = lineCounter + 1;
      overpasteSelection(curSelectionLineCount);
    }
 

    function overpasteSelection(curSelectionLineCount) {
      console.log('overpasteSelection running'); 
      // !VA Branch: 103120A Deprecate below, it's from the scavenged extension.
      // var start = editor.selection.active;
      // Paste from clipboard at the cursor/start of selection
      vscode.commands.executeCommand('editor.action.clipboardPasteAction').then(function () {
        // !VA The lineCount of the new selection is the lineCount of the pre-paste selection (i.e. the replaced node) plus the difference between the current document lineCount and the pre-paste lineCount. Add 1 to the startDocLineCount because the current line is counted twice (once in each document.lineCount call)
        var newSelectionLineCount = curSelectionLineCount + (editor.document.lineCount - (startDocLineCount + 1));
        // !VA The post-paste selection is from the original start position to the end character of the last line of the pasted content
        editor.selection = getSelection( new vscode.Position( s.line, 0), new vscode.Position((s.line + newSelectionLineCount), getEndChar(s.line + newSelectionLineCount)));
        return;
        // !VA Branch: 103120A
        // !VA The following was included in the scavenged spoeken.pasteandformat extension but the extra formatting yields unexpected results. To deprecate.
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
          // console.log('curTags :>> ');
          // console.log(curTags);
        }
      }

      if ( curTags[0] === '<img') {
        // !VA Handle the img tag
        console.log('IMG tag is the parent node');
        selectImgNode( );
        
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
