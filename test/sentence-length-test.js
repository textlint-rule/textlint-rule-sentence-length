// LICENSE : MIT
"use strict";
import rule from "../src/sentence-length";
import TextLintTester from "textlint-tester";
var tester = new TextLintTester();
tester.run("textlint-rule-sentence-length", rule, {
    valid: [
        "This is a article",
        "Test`code`です。",
        {
            // == 12345
            text: "12`3`45",
            options: {
                max: 5
            }
        },
        {
            // == 12345
            text: "[123](http://example.com)45",
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
        }
    ]
});
