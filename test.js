const load = require('./src/load-list');
var wordLists = load.load('ospd.txt');

wordLists
    .forEach(w => console.log('L:', w.length, 'W:', w.words.length));