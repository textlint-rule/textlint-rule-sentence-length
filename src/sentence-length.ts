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
};
const defaultOptions: Required<Options> = {
    max: 100,
    skipPatterns: [],
    skipUrlStringLink: true,
    /**
     * @deprecated
     */
    exclusionPatterns: []
};

const isSentenceNode = (node: TxtParentNodeWithSentenceNodeContent): node is TxtSentenceNode => {
    return node.type === SentenceSplitterSyntax.Sentence;
};
const reporter: TextlintRuleReporter<Options> = (context, options = {}) => {
    const maxLength = options.max ?? defaultOptions.max;
    const skipPatterns = options.skipPatterns ?? options.exclusionPatterns ?? defaultOptions.skipPatterns;
    const skipUrlStringLink = options.skipUrlStringLink ?? defaultOptions.skipUrlStringLink;
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
                const actualTextLength = actualText.length;
                const sentenceLength = sentenceText.length;
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
