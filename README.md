# textlint-rule-sentence-length [![Build Status](https://travis-ci.org/azu/textlint-rule-sentence-length.svg?branch=master)](https://travis-ci.org/azu/textlint-rule-sentence-length)

[textlint](https://github.com/textlint/textlint "textlint") rule that limit Maximum Length of Sentence.

## Installation

    npm install textlint-rule-sentence-length

## Usage

Add "sentence-length" to your `.textlintrc`.

```
{
    "rules": {
        "sentence-length": true
    }
}
```


### Options

- `max`
    - default: 100
    - The total number of characters allowed on each sentences.
    - => Sentence.length > 100 and throw Error

```
{
    "rules": {
        "sentence-length": {
            "max": 100
        }
    }
}
```

## Related Rules

See [Other rules](https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule)

## Tests

    npm test

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
