import TextLintTester from "textlint-tester";
import rule from "../src/sentence-length";

const tester = new TextLintTester();

(async function testHTML() {
    const htmlPlugin = (await import("textlint-plugin-html")).default;
    tester.run(
        "textlint-rule-sentence-length:plugin",
        {
            plugins: [
                {
                    pluginId: "html",
                    plugin: htmlPlugin
                }
            ],
            rules: [
                {
                    ruleId: "textlint-rule-sentence-length",
                    rule: rule,
                    options: {
                        max: 15
                    }
                }
            ]
        },
        {
            valid: [
                {
                    text: "<p>this is a test.</p>",
                    ext: ".html"
                },
                {
                    text: "<p>TEST is <a href='https://example.com'>https://example.com</a></p>",
                    ext: ".html"
                },
                // https://github.com/textlint-rule/textlint-rule-sentence-length/issues/45
                // Comment inside <p> should be ignored (length 0)
                {
                    text: "<p><!-- this is a very long comment that should be ignored --></p>",
                    ext: ".html"
                },
                {
                    text: `<p>
<!--
comment-->
</p>`,
                    ext: ".html"
                },
                {
                    text: "<p>short text<!-- long long long long long long comment --></p>",
                    ext: ".html"
                }
            ],
            invalid: [
                {
                    text: "<p>this is a test for textlint-rule-sentence-length with plugin</p>",
                    ext: ".html",
                    errors: [
                        {
                            message: `Line 1 sentence length(60) exceeds the maximum sentence length of 15.
Over 45 characters.`,
                            line: 1,
                            column: 4
                        }
                    ]
                }
            ]
        }
    );
})();
