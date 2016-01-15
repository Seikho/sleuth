var fs = require('fs');
var START_LENGTH = 3;
function loadList(dictionaryFile) {
    var contents = fs.readFileSync(dictionaryFile)
        .toString()
        .split('\n');
    var wordLists = [];
    var wordLength = START_LENGTH;
    while (getWords(wordLength, contents, wordLists) === true) {
        wordLength++;
    }
    return wordLists;
}
exports.loadList = loadList;
function getWords(wordLength, words, wordLists) {
    var matchingWords = [];
    for (var x = 0; x <= words.length; x++) {
        var word = (words[x] || '').trim();
        if (word.length === wordLength) {
            matchingWords.push(word);
        }
    }
    if (matchingWords.length > 0) {
        wordLists.push({
            length: wordLength,
            words: matchingWords
        });
        return true;
    }
    return false;
}
//# sourceMappingURL=load-list.js.map