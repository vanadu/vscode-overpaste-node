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





    let endChar, curRange, curLine, curText, tagList, openTags, closeTags, openTagCount, closeTagCount,
        selStart, hasValidTag, curTags = [],
        startDocLineCount,
        startLine, endLine;
    // !VA Branch: 122020A
    // !VA The tags supported by this extension, i.e. the tags recognized as valid nodes. img tag has no closing tag, so it is included in taglist but not openTags or closeTags. It needs to be expanded to include MS Conditionals
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
    // !VA Set selStart to the current cursor position/the start position of the current selection
    selStart = selection.start;
    // !VA startDocLineCount: line count before overpasting content. The line count before overpasting is used to select the new content after it has overpasted the existing selection.
    startDocLineCount = editor.document.lineCount;
    
    // !VA Get the line at the cursor/start of current selection
    function getCurLine(startPos) {
      // !VA Get the end character of the line containing the cursor i.e. the first line of the current selection.
      endChar = getEndChar( startPos.line );
      // !VA Get the range from the start to the end of the current line
      curRange = getRange( new vscode.Position( startPos.line, 0), new vscode.Position(startPos.line, endChar) )
      // !VA Get the text of the current line and return it
      curLine = editor.document.getText( curRange );
      return curLine;
    }


    // !VA Determine if the current line is an MS conditional and if it is, return TRUE, otherwise FALSE. IMPORTANT: This needs to run AFTER lineContainsValidTag because it only handles cases where the line DOES contain a valid tag but that tag is in an MS conditional comment and therefore is not a valid node for overpasteNode. 
    function isMSConditional(selStart) {
      let abort;
      // !VA Get the current line, i.e. the line with the cursor or the start of the selection
      curLine = getCurLine(selStart);
      // !VA If the line includes a div, test for MS conditional comments in the surrounding parent TD - if they are present then it's either a vml button or a background image
      if (curLine.includes('<div>')) {
        // !VA Expand selection backwards from selStart until the first TD is reached
        // !VA res is
        var res, txt, txt1, txt2, i;
        // !VA Set the counter
        i = 0;
        do {
          // !VA Expend the current text range up a line until the TD is reached, and set that text to txt1
          txt1 = getCurText( selStart.line, 0, selStart.line - i, 0);
          res = txt1.search('<td ');
          i++;
        }
        while (res === -1)
        // !VA Reset the counter and expand the current text range down a line until the closing TD tag is reached, and set that text to txt2.
        i = 0;
        do {
          txt2 = getCurText( selStart.line, 0, selStart.line + i, 0);
          res = txt2.search('</td>');
          i++;
        }
        while (res === -1);
        // !VA Concatenate the text above and below the div.
        txt = txt1 + txt2;
        // !VA Search the text range for MS conditional opening and closing tags. If they are found, abort - the error message is triggered in the abort handler.
        // !VA NOTE that the bracket has to be DOUBLE escaped and the ! and hyphens single-escaped. 
        if ( txt.search('<\!\-\-\\[if') !== -1 || txt.search('<\!\\[endif\\]\-\->') !== -1) {
          abort = true;
        }
        // !VA Test for a MS conditional in the line above the current line with the TABLE tag - if it's present then the current TABLE tag is in a ghost code block
      } else if (curLine.includes('<table ')) {
        txt = getCurText( selStart.line, 0, selStart.line - 1,  0);
        if ( txt.search('<\!\-\-\\[if') !== -1 ) {
          abort = true;
        }
      // !VA Test for a MS conditional in the line below the current line with the TD tag - if it's present then the current TD tag is in a ghost code block
      } else if (curLine.includes('<td ')) {
        txt = getCurText( selStart.line, 0, selStart.line + 2,  0);
        if ( txt.search('<\!\\[endif\\]\-\->') !== -1 ) {
          abort = true;
        }
      }
      return abort;
    }
    
    // !VA If current line does not include a tag in tagList, return out
    // !VA Branch: 122020A
    // !VA This needs to include MS Conditionals.
    function lineContainsValidTag(curLine) {
      // !VA Test if the current line 
      // console.log('lineContainsValidTag curLine :>> ');
      // console.log(curLine);


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
    // !VA Selects a line from the first char of the line to the endChar of the line. This selection will only be used for the imgNode because it's the only single-line node. Every other selection spans a parent node and its child nodes, hence the function name 'selectImgNode'
    function selectImgNode(  ) {
      console.log('selectImgNode running'); 
      endChar = getEndChar( selStart.line );
      editor.selection = getSelection( new vscode.Position(selStart.line, 0), new vscode.Position( selStart.line, endChar));
      overpasteSelection(1)
      return;
    }


    // !VA Branch: 122020A

    // !VA Parses the current line for any tags that are in the list of supported open tags (openTags). If a tag is in the list, the tag is placed in the openTag/closeTag variable. This defines line with openTag as the target of the current overpasteNode operation. Then runs a loop to extend the selection as long as the number of opening tags in the selection does not equal the number of closing tags the selection. Then, overpastes the selection with the clipboard contents.
    function selectParentNode( curTag ) {
      let openTag, closeTag;
      for (let i = 0; i < openTags.length; i++) {
        // console.log('openTags[i] is: ' +  openTags[i]);
        if ( openTags[i].includes( curTag)) {
          // !VA Branch: 122020A
          // !VA Here we need to determine whether the line is a ghost tag or other MS conditional 
          openTag = openTags[i];
          closeTag = closeTags[i];
        } 
      }

      // !VA Get the current document in the active editor
      // !VA Branch: 122020A
      // !VA Again, assigning editor.document to a variable isn't necessary because we only access one document, i.e. the editor.document. The line below can be removed.
      // const document = editor.document; 
      // !VA Counter to increment line number selStart.line where selStart.line is the line containing the cursor, i.e. the first position of the current user selection.
      var lineCounter = -1;
      // !VA Start with the line containing the cursor as the current range. At this point there is only one opening tag in the current range and no closing tags so start the loop accordingly.
      openTagCount = 1, closeTagCount = 0;
      // !VA Run the loop as long as the number of openTags does not equal the number of closeTags. 
      while ( openTagCount !== closeTagCount ) {  
        lineCounter = lineCounter + 1;
        endChar = getEndChar( selStart.line + lineCounter);
        curLine = ( '\n' + getCurText( selStart.line + lineCounter, 0, selStart.line + lineCounter, endChar));
        if ( curLine.includes(closeTag)) {
          curText = getCurText(selStart.line, 0, (selStart.line + lineCounter), endChar);
          openTagCount = ((curText.match(new RegExp(openTag, 'g'))) || []).length;
          closeTagCount = ((curText.match(new RegExp(closeTag, 'g'))) || []).length;
        }
      }
      // !VA Branch: 122020A
      // !VA This is where we have to expand the selection to include the ghost tags above and below the current selection. overpasteNode appears to already handle the child ghost tags properly, i.e. overpastes them with the selection. 
      // console.log(`selStart.line - 1 :>> ${selStart.line - 1};`);
      // console.log(`getEndChar( selStart.line - 1 ) :>> ${getEndChar( selStart.line - 1 )};`);
      // !VA Set curTest, i.e. the text line to test for MS Conditional tags, to the line above the current line.
      curText = getCurText(selStart.line - 1, 0, (selStart.line - 1), getEndChar( selStart.line - 1 ));
      // !VA If curText includes the MS conditional closing tag, then the selection is enclosed in ghost tags, so expand the selection by five lines above and below the current line (i.e. selStart, which is either the line containing the cursor or the start of the current selection).
      if ( curText.includes('<![endif]-->')) { 
        // console.log('HIT');
        startLine = selStart.line - 5;
        endLine = selStart.line + lineCounter + 5; 
        // console.log(`HIT startLine :>> ${startLine};`);
        // console.log(`HIT endLine :>> ${endLine};`);
      } else {
        // console.log('NO HIT');
        startLine = selStart.line;
        endLine = selStart.line + lineCounter; 
        // console.log(`NO HIT startLine :>> ${startLine};`);
        // console.log(`NO HIT endLine :>> ${endLine};`);
      }



      var curSelection = new vscode.Selection( startLine, 0, (endLine), getEndChar(endLine));
      // console.log('curSelection :>> ');
      // console.log(curSelection);
      editor.selection = curSelection;
      var curSelectionLineCount = lineCounter + 1;
      overpasteSelection(curSelectionLineCount);
    }
 
    // !VA Replaces the current selection with the contents of the clipboard.
    function overpasteSelection(curSelectionLineCount) {
      // !VA Branch: 103120A Deprecate below, it's from the scavenged extension.
      // var start = editor.selection.active;
      // Paste from clipboard at the cursor/start of selection
      vscode.commands.executeCommand('editor.action.clipboardPasteAction').then(function () {
        // !VA The lineCount of the new selection is the lineCount of the pre-paste selection (i.e. the replaced node) plus the difference between the current document lineCount and the pre-paste lineCount. Add 1 to the startDocLineCount because the current line is counted twice (once in each document.lineCount call)
        var newSelectionLineCount = curSelectionLineCount + (editor.document.lineCount - (startDocLineCount + 1));
        // !VA The post-paste selection is from the original start position to the end character of the last line of the pasted content
        editor.selection = getSelection( new vscode.Position( selStart.line, 0), new vscode.Position((selStart.line + newSelectionLineCount), getEndChar(selStart.line + newSelectionLineCount)));
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

    function showErrMessage() {
      vscode.window.showInformationMessage("overpasteNode: Line contains no valid/supported nodeName")
    }

    // !VA Get the current line, i.e. the line with the cursor or the start line of the selection
    curLine = getCurLine(selStart);
    // !VA Bool indicating whether the current line has a valid tag, true if valid, false if invalid
    hasValidTag = lineContainsValidTag(curLine);

    if (hasValidTag) {
      // !VA If the selection has a valid tag, test if the tag is in an MS conditional, and if it is show the error message in the VS Code editor and return out.
      var abort = isMSConditional(selStart);
      if (abort) { 
        showErrMessage();
        return;
      }

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
      curLine = getCurLine(selStart);
      var regex = /^\s*$/;
      if ( curLine.match(regex) ) {
        overpasteSelection(1);
      } else {
        console.log('ERROR: invalid tag');
        showErrMessage();
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
