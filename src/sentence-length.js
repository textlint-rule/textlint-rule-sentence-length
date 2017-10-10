// LICENSE : MIT
"use strict";
import { split } from "sentence-splitter";
import StringSource from 'textlint-util-to-string';
import { RuleHelper } from "textlint-rule-helper";

const defaultOptions = {
    max: 100
};
module.exports = function(context, options = {}) {
    const maxLength = options.max || defaultOptions.max;
    const helper = new RuleHelper(context);
    const { Syntax, RuleError, report } = context;
    // toPlainText
    return {
        [Syntax.Paragraph](node) {
            if (helper.isChildNode(node, [Syntax.BlockQuote])) {
                return;
            }
            // If a single Link node in the paragraph node, should be ignore the link length
            const isChildrenSingleLinkNode = node.children.length === 1 && node.children[0].type === Syntax.Link;
            if (isChildrenSingleLinkNode) {
                return;
            }
            const source = new StringSource(node);
            const text = source.toString();
            // empty break line == split sentence
            const sentences = split(text, {
                newLineCharacters: "\n\n"
            });
            sentences.forEach(sentence => {
                // TODO: should trim()?
                const sentenceText = sentence.value;
                // larger than > 100
                if (sentenceText.length > maxLength) {
                    const currentLine = node.loc.start.line;
                    const start = source.originalPositionFromPosition(sentence.loc.start);
                    const startLine = start.line - 1 + currentLine;
                    const index = source.originalIndexFromPosition(sentence.loc.start);
                    report(node, new RuleError(`Line ${startLine} exceeds the maximum line length of ${maxLength}.`, {
                        index: index
                    }));
                }
            });
        }
    }
}