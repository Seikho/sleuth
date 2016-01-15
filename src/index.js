var load_list_1 = require('./load-list');
function createEmptyGrid(length, width) {
    var grid = [];
    for (var x = 0; x <= length; x++) {
        grid.push(new Array(width));
    }
    return grid;
}
var Grid = (function () {
    function Grid(options) {
        this.options = options;
        this.wordList = load_list_1.loadList('ospd.txt');
        this.gridRows = createEmptyGrid(options.length, options.width);
        this.minimumLength = this.wordList.reduce(function (prev, curr) { return curr.length < prev ? curr.length : prev; }, 3);
        this.maximumLength = this.wordList.reduce(function (prev, curr) { return curr.length > prev ? curr.length : prev; }, 3);
    }
    Grid.prototype.fillGrid = function () {
        for (var x = 0; x < 10; x++) {
        }
    };
    Grid.prototype.tryPlaceWord = function (word) {
        var _this = this;
        var availableSquares = this.getAllAvailableSquares();
        // Try and find a location to start 10 times before failing
        for (var startAttempt = 0; startAttempt < 10; startAttempt++) {
            var start = availableSquares[this.getRandomNumber(0, availableSquares.length)];
            var possibleDesignations = this.getAdjacentAvailableCoordinates(start);
            if (possibleDesignations.length < word.length)
                continue;
            for (var placementAttempt = 0; placementAttempt < 10; placementAttempt++) {
                var designations = [{ x: start.x, y: start.y, letter: word[0] }];
                for (var letterIndex = 1; letterIndex < word.length; letterIndex++) {
                    var letter = word[letterIndex];
                    var placement = this.getRandomAdjacentCoordinate(designations[letterIndex - 1], designations);
                    if (placement == null)
                        break;
                    designations.push({
                        letter: letter,
                        x: placement.x,
                        y: placement.y
                    });
                }
                if (designations.length !== word.length)
                    continue;
                designations.forEach(function (d) { return _this.gridRows[d.y][d.y] = d.letter; });
                return true;
            }
        }
        this.gridRows = createEmptyGrid(this.options.length, this.options.width);
        return false;
    };
    Grid.prototype.isValidDesignation = function (designations) {
        var _this = this;
        designations.forEach(function (d) { return _this.gridRows[d.y][d.x] = d.letter; });
        var isValid = this.isValidGrid();
        designations.forEach(function (d) { return _this.gridRows[d.y][d.x] = ''; });
        return isValid;
    };
    Grid.prototype.getRandomWord = function (length) {
        length = length || this.getPsuedoRandomWordLength();
        var wordList = this.getWordList(length);
        var randomWord = wordList.words[this.getRandomNumber(0, wordList.words.length)];
        return randomWord;
    };
    Grid.prototype.getPsuedoRandomWordLength = function () {
        var remainingSquares = this.getAllAvailableSquares();
        if (remainingSquares.length <= this.maximumLength)
            return remainingSquares.length;
        return this.getRandomNumber(this.minimumLength, this.maximumLength + 1);
    };
    Grid.prototype.getWordList = function (length) {
        return this.wordList.filter(function (list) { return list.length === length; })[0];
    };
    Grid.prototype.getRandomAdjacentCoordinate = function (start, ignore) {
        var _this = this;
        var availableSquares = this.getAdjacentAvailableCoordinates(start);
        var usableSquares = availableSquares.filter(function (coord) { return ignore.every(function (inner) { return !_this.coordEquals(coord, inner); }); });
        if (usableSquares.length === 0)
            return null;
        if (usableSquares.length === 1)
            return usableSquares[0];
        var randomIndex = this.getRandomNumber(0, usableSquares.length);
        return usableSquares[randomIndex];
    };
    Grid.prototype.coordEquals = function (left, right) {
        return left.x === right.x && left.y === right.y;
    };
    Grid.prototype.getRandomNumber = function (start, end) {
        var random = Math.random() * (end - start) + start;
        return Math.floor(random);
    };
    Grid.prototype.getAdjacentAvailableCoordinates = function (start) {
        var _this = this;
        var get = function (direction) { return _this.getCoordinate(start, direction); };
        var squares = [
            get(0 /* Up */),
            get(1 /* Down */),
            get(2 /* Left */),
            get(3 /* Right */)
        ];
        return squares.filter(this.isAvailable);
    };
    Grid.prototype.isAvailable = function (coordinate) {
        var contents = this.gridRows[coordinate.y][coordinate.x] || '';
        return contents.length === 0;
    };
    Grid.prototype.getCoordinate = function (start, direction) {
        var x = start.x;
        var y = start.y;
        switch (direction) {
            case 0 /* Up */:
                y--;
                break;
            case 1 /* Down */:
                y++;
                break;
            case 2 /* Left */:
                x--;
                break;
            case 3 /* Right */:
                x++;
                break;
        }
        return { x: x, y: y };
    };
    /**
     * TODO: This can be significantly optimized if necessary
     * Do not do FloodFill4 on coordinates that have already been 'filled'
     */
    Grid.prototype.isValidGrid = function () {
        var allAvailableSquares = this.getAllAvailableSquares();
        if (allAvailableSquares.length === 0)
            return true;
        if (allAvailableSquares.length < 3)
            return false;
        var coordsToCheck = [];
        var connected = allAvailableSquares.map(this.getConnectedAvailableCoordinates);
        var isEveryBigEnough = connected.every(function (c) { return c.length >= 3; });
        return isEveryBigEnough;
    };
    Grid.prototype.getAllAvailableSquares = function () {
        var freeSquares = [];
        this.gridRows.forEach(function (row, y) {
            row.forEach(function (letter, x) {
                letter = letter || '';
                if (letter.length === 0)
                    return;
                freeSquares.push({ x: x, y: y });
            });
        });
        return freeSquares;
    };
    Grid.prototype.getConnectedAvailableCoordinates = function (start) {
        var _this = this;
        var coords = this.getAdjacentAvailableCoordinates(start);
        coords.push(start);
        var isNotIn = function (coordinate) { return coords.every(function (coord) { return coord.x !== coordinate.x || coord.y !== coordinate.y; }); };
        var connected = [];
        var get = function (coordinate) {
            if (!_this.isAvailable(coordinate))
                return null;
            var isAlreadyConnected = connected.some(function (coord) { return coord.x === coordinate.x && coord.y === coordinate.y; });
            if (isAlreadyConnected)
                return null;
            connected.push(coordinate);
            get(_this.getCoordinate(coordinate, 0 /* Up */));
            get(_this.getCoordinate(coordinate, 3 /* Right */));
            get(_this.getCoordinate(coordinate, 1 /* Down */));
            get(_this.getCoordinate(coordinate, 2 /* Left */));
        };
        return connected;
    };
    Grid.prototype.toString = function () {
        return '';
    };
    return Grid;
})();
//# sourceMappingURL=index.js.map