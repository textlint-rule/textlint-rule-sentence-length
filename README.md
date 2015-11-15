# textlint-rule-sentence-length

[textlint](https://github.com/textlint/textlint "textlint") rule that limit Maximum Length of Sentence.

## Installation

- [ ] Describe the installation process

## Usage

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

## Tests

- [ ] Write How to Tests

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT