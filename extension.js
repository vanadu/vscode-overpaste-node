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
    let endChar, curRange, curLine, curText, tagList, openTags, closeTags, openTagCount, closeTagCount;
    let s, e, hasValidTag, curTags = [];
    let startDocLineCount;
    tagList = [ '<table', '<td', '<div', '<a', '<img' ];
    openTags = [ '<table', '<td', '<div', '<a' ];
    closeTags = [ '</table>', '</td>', '</div>', '</a>'] 

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
    function getCurLine() {
      const document = editor.document; 
      // !VA Get the end character of the line containing the cursor i.e. the first line of the current selection.
      endChar = getEndChar( s.line );
      // !VA Get the range from the start to the end of the current line
      curRange = getRange( new vscode.Position( s.line, 0), new vscode.Position(s.line, endChar) )
      // !VA Get the text of the current line and return it
      curLine = editor.document.getText( curRange );
      return curLine;
    }
    curLine = getCurLine();
    
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

      // !VA Get the current document in the active editor
      const document = editor.document; 
      // !VA Counter to increment line number s.line where s.line is the line containing the cursor, i.e. the first position of the current user selection.
      var lineCounter = -1;
      // !VA Start with the line containing the cursor as the current range. At this point there is only one opening tag in the current range and no closing tags so start the loop accordingly.
      openTagCount = 1, closeTagCount = 0;
      // !VA Run the loop as long as the number of openTags does not equal the number of closeTags. 
      while ( openTagCount !== closeTagCount ) {  
        lineCounter = lineCounter + 1;
        endChar = getEndChar( s.line + lineCounter);
        curLine = ( '\n' + getCurText( s.line + lineCounter, 0, s.line + lineCounter, endChar));
        if ( curLine.includes(closeTag)) {
          curText = getCurText(s.line, 0, (s.line + lineCounter), endChar);
          openTagCount = ((curText.match(new RegExp(openTag, 'g'))) || []).length;
          closeTagCount = ((curText.match(new RegExp(closeTag, 'g'))) || []).length;
        }

      }
      var curSelection = new vscode.Selection( s.line, 0, (s.line + lineCounter), endChar);
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
        vscode.window.showInformationMessage("overpasteNode: Selection overpasted!");
        vscode.window.activeTextEditor.document.save();
        return;
        // !VA Branch: 103120A
        // !VA The following was included in the scavenged spoeken.pasteandformat extension but the extra formatting yields unexpected results. Actually, it does help with long IMG tags, adds line breaks. But we don't want that because it can interfere with the natural line breaking, i.e. the word wrap function. Leave it out for now. Users can reformat their code if they want.
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
      // !VA Add the tags in the current line to curTags. 
      for (const tag of tagList) {
        if (curLine.includes( tag )) {
          curTags.push(tag);
        }
      }
      // !VA If the only tag in the current line is IMG, run selectImgNode
      if ( curTags[0] === '<img') {
        // !VA Handle the img tag
        selectImgNode( );
      } else {
        // !VA If the IMG node is not the only, i.e. the parent node, run selectParentNode to identify the parent node and select it.
        selectParentNode( curTags[0] );
      }
    } else {
      // !VA If the selection is in an empty line or the line only contains whitespace, overpaste it. Otherwise, the text on the current line contains none of the tags in tagList, so write an error in an Information Message.
      curLine = getCurLine();
      var regex = /^\s*$/;
      if ( curLine.match(regex) ) {
        overpasteSelection(1);
      } else {
        console.log('ERROR: invalid tag');
        vscode.window.showInformationMessage("overpasteNode: Line contains no valid/supported nodeName")
        return;
      }
    }
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
