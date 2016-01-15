import fs = require('fs');

const START_LENGTH = 3;

export function loadList(dictionaryFile: string): Array<WordList> {
    var contents = fs.readFileSync(dictionaryFile)
        .toString()
        .split('\n');
    var wordLists: Array<WordList> = [];

    var wordLength = START_LENGTH;

    while (getWords(wordLength, contents, wordLists) === true) {
        wordLength++;
    }

    return wordLists;
}

function getWords(wordLength: number, words: string[], wordLists: Array<WordList>) {
    var matchingWords: string[] = [];

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

interface WordList {
    length: number;
    words: string[];
}