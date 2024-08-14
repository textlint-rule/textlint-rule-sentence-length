import type { TextlintRuleReporter } from "@textlint/types";
import type { TxtParentNode } from "@textlint/ast-node-types";
import type { TxtParentNodeWithSentenceNodeContent, TxtSentenceNodeChildren } from "sentence-splitter";
import { SentenceSplitterSyntax, splitAST, TxtSentenceNode } from "sentence-splitter";
import { StringSource } from "textlint-util-to-string";
import { RuleHelper } from "textlint-rule-helper";
import { createRegExp } from "@textlint/regexp-string-matcher";

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

export type Options = {
    max?: number;
    /**
     * The strings that match following patterns is un-count of the sentence
     * See https://github.com/textlint/regexp-string-matcher
     */
    skipPatterns?: string[];
    /**
     * If it is true, skip the count of following link node.
     *
     * [https://example.com](https://example.com)
     * <https://example.com>
     *
     * UrlStringLink is has the title which is same of href.
     */
    skipUrlStringLink?: boolean;
    /**
     * @deprecated use skipPatterns
     */
    exclusionPatterns?: string[];
    /**
     * Determine how to count string length.
     * By default or set to "codeunits", count string by UTF-16 code unit(= using `String.prototype.length`).
     * If set to "codepoints", count string by codepoint.
     */
    countBy?: "codeunits" | "codepoints";
};
const defaultOptions: Required<Options> = {
    max: 100,
    skipPatterns: [],
    skipUrlStringLink: true,
    /**
     * @deprecated
     */
    exclusionPatterns: [],
    countBy: "codeunits"
};

const isSentenceNode = (node: TxtParentNodeWithSentenceNodeContent): node is TxtSentenceNode => {
    return node.type === SentenceSplitterSyntax.Sentence;
};

/**
 * A count of the number of code units currently in the string.
 * @param s string
 */
const strLenByCodeUnits = (s: string): number => s.length;
/**
 * A count of the number of codepoint currently in the string.
 *
 * Complexity: O(n)
 * @param s string
 */
const strLenByCodePoints = (s: string): number => {
    let i = 0;
    for (const _ of s) {
        ++i;
    }
    return i;
};
const reporter: TextlintRuleReporter<Options> = (context, options = {}) => {
    const maxLength = options.max ?? defaultOptions.max;
    const skipPatterns = options.skipPatterns ?? options.exclusionPatterns ?? defaultOptions.skipPatterns;
    const skipUrlStringLink = options.skipUrlStringLink ?? defaultOptions.skipUrlStringLink;
    const strLen = options.countBy == null || options.countBy === "codeunits" ? strLenByCodeUnits : strLenByCodePoints;
    const helper = new RuleHelper(context);
    const { Syntax, RuleError, report } = context;
    const isUrlStringLink = (node: TxtSentenceNodeChildren): boolean => {
        if (node.type !== Syntax.Link) {
            return false;
        }
        const linkNode = node as TxtParentNode;
        const nodeText = new StringSource(linkNode).toString();
        return node.url === nodeText;
    };
    // toPlainText
    return {
        [Syntax.Document](node) {
            if (options.exclusionPatterns) {
                report(node, new RuleError("exclusionPatterns is deprecated. Use skipPatterns instead."));
            }
        },
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
            const sentenceRootNode = splitAST(node);
            sentenceRootNode.children.filter(isSentenceNode).forEach((sentence) => {
                const filteredSentence = skipUrlStringLink
                    ? {
                          ...sentence,
                          children: sentence.children.filter((sentenceChildNode) => {
                              return !isUrlStringLink(sentenceChildNode);
                          })
                      }
                    : sentence;
                const source = new StringSource(filteredSentence);
                const actualText = source.toString();
                const sentenceText = removeRangeFromString(actualText, skipPatterns);
                // larger than > 100
                const actualTextLength = strLen(actualText);
                const sentenceLength = strLen(sentenceText);
                if (sentenceLength > maxLength) {
                    const startLine = filteredSentence.loc.start.line;
                    report(
                        // @ts-expect-error: It is compatible with textlint node
                        filteredSentence,
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
