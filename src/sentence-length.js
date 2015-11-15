// LICENSE : MIT
"use strict";
import sentenceSplitter from "sentence-splitter";
import toString from "nlcst-to-string"
const defaultOptions = {
    max: 100
};
export default function (context, options = {}) {
    const maxLength = options.max || defaultOptions.max;
    let { Syntax, RuleError, report } = context;
    // toPlainText
    return {
        [Syntax.Paragraph](node){
            let text = toString(node);
            let sentences = sentenceSplitter(text, {
                newLineCharacters: "\n\n"
            });
            sentences.forEach(sentence => {
                let sentenceText = sentence.value;
                // bigger than
                if (sentenceText.length > maxLength) {
                    let currentLine = node.loc.start.line;
                    let paddingLine = sentence.loc.start.line - 1;
                    let paddingColumn = sentence.loc.start.line;
                    report(node, new RuleError(`Line ${currentLine + paddingLine} exceeds the maximum line length of ${maxLength}.`, {
                        line: paddingLine,
                        column: paddingColumn
                    }));
                }
            });
        }
    }
}