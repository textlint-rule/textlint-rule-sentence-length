import TextLintTester from "textlint-tester";
import rule from "../src/sentence-length";
// @ts-expect-error: no types
import htmlPlugin from "textlint-plugin-html";

const tester = new TextLintTester();

tester.run("textlint-rule-sentence-length", rule, {
    valid: [
        "This is a article",
        "Test`code`です。",
        {
            text: '"This" is code.',
            options: {
                max: 15
            }
        },
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
            text: "ab`c`de",
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
        },
        {
            // ignore /()$/。
            text: "1234(56789)",
            options: {
                max: 5,
                skipPatterns: ["/\\(.*\\)$/"]
            }
        },
        {
            // html node
            // == 12345
            text: "<s>123</s><b>45</b>",
            options: {
                max: 5
            }
        },
        {
            // url string link
            text: "[http://example.com](http://example.com)",
            options: {
                max: 5
            }
        },
        {
            // List
            text: '- [abc](http://example.com "abc")de',
            options: {
                max: 5
            }
        },
        {
            // List
            text: `
- abcde
- abcde
- abcde
- abcde
- abcde
`,
            options: {
                max: 5
            }
        },
        {
            text: `実行コンテキストが"Script"である場合、そのコード直下に書かれた\`this\`はグローバルオブジェクトを参照します。
グローバルオブジェクトとは、実行環境において異なるものが定義されています。
ブラウザなら\`window\`オブジェクト、Node.jsなら\`global\`オブジェクトとなります。`,
            options: {
                max: 90
            }
        },
        {
            text: `また*CORS policy Invalid*のようなエラーがコンソールに表示されている場合は、[Same Origin Policy][]により\`index.js\`の読み込みが失敗しています。

[Same Origin Policy]: https://example.com/`,
            options: {
                max: 90
            }
        },
        // regression test
        // https://github.com/textlint-rule/textlint-rule-sentence-length/issues/13
        {
            text:
                "ではみなさんは、そういうふうに川だと云いわれたり、乳の流れたあとだと云われたりしていたこのぼんやりと白いものがほんとうは何かご承知ですか。\n" +
                "\n" +
                'ではみなさんは、そういうふうに川だと云いわれたり、乳の流れたあとだと云われたりしていたこの<a href="https://www.aozora.gr.jp/cards/000081/files/456_15050.html" target="_blank" rel="noopener noreferrer">ぼんやりと白いもの</a>がほんとうは何かご承知ですか。\n'
        },
        {
            // Issue: https://github.com/textlint-rule/textlint-rule-sentence-length/issues/38
            text: `JavaScriptをWasmにして実行する仕組みについて。
QuickJSを使いJavaScriptをByteCodeにしたxxxxを作成し、\`QuickJS.wasm\`と動的にリンクして大部分を共有している。
Shopify Functionで利用されるが、非同期処理の制限や5ms未満での実行制限がある。`
        },
        // https://github.com/textlint-rule/textlint-rule-sentence-length/issues/18
        {
            // length: 35
            // skip "..." -> `He said .`
            text: `He said "This is a pen. I like it".`,
            options: {
                max: 10,
                skipPatterns: ['/".*"/']
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
                    message: `Line 1 sentence length(6) exceeds the maximum sentence length of 5.
Over 1 characters.`
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
                    message: `Line 1 sentence length(6) exceeds the maximum sentence length of 5.
Over 1 characters.`
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
                    message: `Line 3 sentence length(6) exceeds the maximum sentence length of 5.
Over 1 characters.`
                }
            ]
        },
        {
            // test: https://github.com/azu/textlint-rule-sentence-length/issues/5
            text: `11111\n2222\n3333333`,
            options: {
                max: 5
            },
            errors: [
                {
                    message: `Line 1 sentence length(18) exceeds the maximum sentence length of 5.
Over 13 characters.`
                }
            ]
        },
        {
            // test: https://github.com/azu/textlint-rule-sentence-length/issues/5
            text: `あいうえお。\n\nあいうえお。\nあいうえおあかさたな。`,
            options: {
                max: 10
            },
            errors: [
                {
                    message: `Line 4 sentence length(11) exceeds the maximum sentence length of 10.
Over 1 characters.`,
                    line: 4,
                    column: 1
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
                    message: `Line 3 sentence length(11) exceeds the maximum sentence length of 5.
Over 6 characters.`
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
                    message: `Line 5 sentence length(102) exceeds the maximum sentence length of 100.
Over 2 characters.`,
                    line: 5,
                    column: 1
                }
            ]
        },
        {
            // ignore /()$/。
            text: "123456789(56789)",
            options: {
                max: 5,
                skipPatterns: ["/\\(.*\\)$/"]
            },
            errors: [
                {
                    message:
                        "Line 1 sentence length(9, original:16) exceeds the maximum sentence length of 5.\n" +
                        "Over 4 characters."
                }
            ]
        },
        {
            // url string link
            text: "TEST [http://example.com](http://example.com)",
            errors: [
                {
                    message: `Line 1 sentence length(23) exceeds the maximum sentence length of 5.
Over 18 characters.`
                }
            ],
            options: {
                max: 5,
                skipUrlStringLink: false
            }
        }
    ]
});

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
