import { splitAST, Syntax as SentenceSyntax } from "sentence-splitter";
import { StringSource } from "textlint-util-to-string";
import { RuleHelper } from "textlint-rule-helper";
import { createRegExp } from "@textlint/regexp-string-matcher";
import { TextlintRuleReporter } from "@textlint/types";

function removeRangeFromString(text: string, regExpStrings: string[]) {
    const patterns = regExpStrings.map((pattern) => {
        return createRegExp(pattern);
    });
    let result = text;
    patterns.forEach((pattern) => {
        result = result.replace(pattern, "");
    });
    return result;
}

const defaultOptions = {
    max: 100,
    // The strings that match following patterns is uncount of the sentence
    // See https://github.com/textlint/regexp-string-matcher
    exclusionPatterns: []
};
const reporter: TextlintRuleReporter = (context, options = {}) => {
    const maxLength = options.max || defaultOptions.max;
    const exclusionPatterns = options.exclusionPatterns || defaultOptions.exclusionPatterns;
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
            paragraph.children
                .filter((sentence) => sentence.type === SentenceSyntax.Sentence)
                .forEach((sentence) => {
                    // @ts-expect-error: wrong types
                    const source = new StringSource(sentence);
                    const actualText = source.toString();
                    const sentenceText = removeRangeFromString(actualText, exclusionPatterns);
                    // larger than > 100
                    const actualTextLength = actualText.length;
                    const sentenceLength = sentenceText.length;
                    if (sentenceLength > maxLength) {
                        const startLine = sentence.loc.start.line;
                        report(
                            sentence,
                            new RuleError(`Line ${startLine} sentence length(${
                                sentenceLength !== actualTextLength
                                    ? `${sentenceLength}, original:${actualTextLength}`
                                    : sentenceLength
                            }) exceeds the maximum sentence length of ${maxLength}.
Over ${sentenceLength - maxLength} characters.`)
                        );
                    }
                });
        }
    };
};
export default reporter;
