// LICENSE : MIT
"use strict";
import TextLintTester from "textlint-tester";
const rule = require("../src/sentence-length");

const tester = new TextLintTester();
tester.run("textlint-rule-sentence-length", rule, {
    valid: [
        "This is a article",
        "Test`code`です。",
        // Exception: A link in the Paragraph
        "[textlint/textlint-filter-rule-comments: textlint filter rule that disables all rules between comments directive.](https://github.com/textlint/textlint-filter-rule-comments)",
        "- [textlint/textlint-filter-rule-comments: textlint filter rule that disables all rules between comments directive.](https://github.com/textlint/textlint-filter-rule-comments)",
        {
            text: "> ignore",
            options: {
                max: 1
            }
        },
        {
            // == 12345
            text: "12`3`45",
            options: {
                max: 5
            }
        },
        {
            // == 12345
            text: '[123](http://example.com "123456")45',
            options: {
                max: 5
            }
        }

    ],
    invalid: [
        {
            text: "123456",
            options: {
                max: 5
            },
            errors: [
                {
                    message: `Line 1 exceeds the maximum line length of 5.`
                }
            ]
        },
        {
            text: "123\n45",
            options: {
                max: 5
            },
            errors: [
                {
                    message: `Line 1 exceeds the maximum line length of 5.`
                }
            ]
        },
        {
            text: "text\n\n123456",
            options: {
                max: 5
            },
            errors: [
                {
                    message: `Line 3 exceeds the maximum line length of 5.`
                }
            ]
        },
        {
            // test: https://github.com/azu/textlint-rule-sentence-length/issues/5
            text:
                `11111\n2222\n3333333`,
            options: {
                max: 5
            },
            errors: [
                {
                    message: `Line 1 exceeds the maximum line length of 5.`
                }
            ]
        },
        {
            text: `text

line3
line4
`,
            options: {
                max: 5
            },
            errors: [
                {
                    message: `Line 3 exceeds the maximum line length of 5.`
                }
            ]
        },
        // example
        {
            text: `This is text.
            
_Middleware_ という仕組み自体は[Connect](../connect/README.md)と似ています。
しかし、 _Middleware_ が直接的に結果(State)を直接書き換える事はできません。
これは、Connectが最終的な結果(response)を書き換えできるの対して、
Reduxの _Middleware_ は扱える範囲がdispatchからReducerまでと線引されている違いと言えます。`,
            options: {
                max: 100
            },
            errors: [
                {
                    message: `Line 4 exceeds the maximum line length of 100.`
                }
            ]
        }
    ]
});
