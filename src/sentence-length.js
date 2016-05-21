// LICENSE : MIT
"use strict";
import {split} from "sentence-splitter";
import toString from 'mdast-util-to-string';
import {RuleHelper} from "textlint-rule-helper";
const isStartWithNewLine = (text) => {
    return text && text.charAt(0) === "\n";
};
const defaultOptions = {
    max: 100
};
export default function (context, options = {}) {
    const maxLength = options.max || defaultOptions.max;
    const helper = new RuleHelper(context);
    let {Syntax, RuleError, report} = context;
    // toPlainText
    return {
        [Syntax.Paragraph](node){
            if (helper.isChildNode(node, [Syntax.BlockQuote])) {
                return;
            }
            let text = toString(node);
            // empty break line == split sentence
            let sentences = split(text, {
                newLineCharacters: "\n\n"
            });
            sentences.forEach(sentence => {
                // TODO: should trim()?
                let sentenceText = sentence.value;
                // bigger than
                if (sentenceText.length > maxLength) {
                    let currentLine = node.loc.start.line;
                    const addedLine = isStartWithNewLine(sentenceText)
                        ? sentence.loc.start.line + 1// \n string
                        : sentence.loc.start.line - 1; // string
                    let paddingLine = Math.max(addedLine, 0);
                    let paddingIndex = sentence.range[0];
                    report(node, new RuleError(`Line ${currentLine + paddingLine} exceeds the maximum line length of ${maxLength}.`, {
                        index: paddingIndex
                    }));
                }
            });
        }
    }
}