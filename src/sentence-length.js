// LICENSE : MIT
"use strict";
import sentenceSplitter from "sentence-splitter";
import toString from 'mdast-util-to-string';
import {RuleHelper} from "textlint-rule-helper";
const defaultOptions = {
    max: 100
};
export default function (context, options = {}) {
    const maxLength = options.max || defaultOptions.max;
    const helper = new RuleHelper(context);
    let { Syntax, RuleError, report } = context;
    // toPlainText
    return {
        [Syntax.Paragraph](node){
            if (helper.isChildNode(node, [Syntax.BlockQuote])) {
                return;
            }
            let text = toString(node);
            // empty break line == split sentence
            let sentences = sentenceSplitter(text, {
                newLineCharacters: "\n\n"
            });
            sentences.forEach(sentence => {
                // TODO: should trim()?
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