// LICENSE : MIT
"use strict";
import { splitAST, Syntax as SentenceSyntax } from "sentence-splitter";
import { StringSource } from "textlint-util-to-string";
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
            // empty break line == split sentence
            const paragraph = splitAST(node);
            paragraph.children.filter(sentence => sentence.type === SentenceSyntax.Sentence).forEach(sentence => {
                const source = new StringSource(sentence);
                const sentenceText = source.toString();
                // larger than > 100
                const sentenceLength = sentenceText.length;
                if (sentenceLength > maxLength) {
                    const startLine = sentence.loc.start.line;
                    report(
                        sentence,
                        new RuleError(`Line ${startLine} sentence length(${sentenceLength}) exceeds the maximum sentence length of ${maxLength}.
Over ${sentenceLength - maxLength} characters.`)
                    );
                }
            });
        }
    };
};
