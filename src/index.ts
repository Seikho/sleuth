import { loadList } from './load-list';

function createEmptyGrid(length: number, width: number) {
    var grid: Array<string[]> = [];
    for (var x = 0; x <= length; x++) {
        grid.push(new Array(width));
    }
    return grid;
}

class Grid {
    constructor(public options: GridOptions) {
        this.gridRows = createEmptyGrid(options.length, options.width);
        this.minimumLength = this.wordList.reduce((prev, curr) => curr.length < prev ? curr.length : prev, 3);
        this.maximumLength = this.wordList.reduce((prev, curr) => curr.length > prev ? curr.length : prev, 3);
    }

    gridRows: Array<string[]>;
    wordList = loadList('ospd.txt');
    minimumLength: number;
    maximumLength: number;

    fillGrid() {
        for (var x = 0; x < 10; x++) {
            
        }
    }

    tryPlaceWord(word: string): boolean {
        var availableSquares = this.getAllAvailableSquares();
        // Try and find a location to start 10 times before failing
        for (var startAttempt = 0; startAttempt < 10; startAttempt++) {
            var start = availableSquares[this.getRandomNumber(0, availableSquares.length)];
            var possibleDesignations = this.getAdjacentAvailableCoordinates(start);

            if (possibleDesignations.length < word.length) continue;

            for (var placementAttempt = 0; placementAttempt < 10; placementAttempt++) {
                var designations: Array<Designation> = [{ x: start.x, y: start.y, letter: word[0] }];

                for (var letterIndex = 1; letterIndex < word.length; letterIndex++) {
                    var letter = word[letterIndex];

                    var placement = this.getRandomAdjacentCoordinate(designations[letterIndex - 1], designations);
                    if (placement == null) break;

                    designations.push({
                        letter,
                        x: placement.x,
                        y: placement.y
                    });
                }

                if (designations.length !== word.length) continue;

                designations.forEach(d => this.gridRows[d.y][d.y] = d.letter);
                return true;
            }

        }

        this.gridRows = createEmptyGrid(this.options.length, this.options.width);
        return false;
    }

    isValidDesignation(designations: Array<Designation>) {
        designations.forEach(d => this.gridRows[d.y][d.x] = d.letter);
        var isValid = this.isValidGrid();
        designations.forEach(d => this.gridRows[d.y][d.x] = '');
        return isValid;
    }

    getRandomWord(length?: number) {
        length = length || this.getPsuedoRandomWordLength();
        var wordList = this.getWordList(length);
        var randomWord = wordList.words[this.getRandomNumber(0, wordList.words.length)];
        return randomWord;
    }

    getPsuedoRandomWordLength() {
        var remainingSquares = this.getAllAvailableSquares();
        if (remainingSquares.length <= this.maximumLength) return remainingSquares.length;
        return this.getRandomNumber(this.minimumLength, this.maximumLength + 1);
    }

    getWordList(length: number) {
        return this.wordList.filter(list => list.length === length)[0];
    }

    getRandomAdjacentCoordinate(start: Coordinate, ignore: Array<Coordinate>): Coordinate {
        var availableSquares = this.getAdjacentAvailableCoordinates(start);
        var usableSquares = availableSquares.filter(coord => ignore.every(inner => !this.coordEquals(coord, inner)));

        if (usableSquares.length === 0) return null;
        if (usableSquares.length === 1) return usableSquares[0];

        var randomIndex = this.getRandomNumber(0, usableSquares.length);

        return usableSquares[randomIndex];
    }

    coordEquals(left: Coordinate, right: Coordinate) {
        return left.x === right.x && left.y === right.y;
    }

    getRandomNumber(start: number, end: number) {
        var random = Math.random() * (end - start) + start;
        return Math.floor(random);
    }

    getAdjacentAvailableCoordinates(start: Coordinate) {
        var get = (direction: Direction) => this.getCoordinate(start, direction);

        var squares = [
            get(Direction.Up),
            get(Direction.Down),
            get(Direction.Left),
            get(Direction.Right)
        ];

        return squares.filter(this.isAvailable);
    }

    isAvailable(coordinate: Coordinate): boolean {
        var contents = this.gridRows[coordinate.y][coordinate.x] || '';
        return contents.length === 0;
    }

    getCoordinate(start: Coordinate, direction: Direction) {
        var x = start.x;
        var y = start.y;

        switch (direction) {
            case Direction.Up:
                y--;
                break;

            case Direction.Down:
                y++;
                break;

            case Direction.Left:
                x--;
                break;

            case Direction.Right:
                x++;
                break;
        }

        return { x, y };
    }
    
    /**
     * TODO: This can be significantly optimized if necessary
     * Do not do FloodFill4 on coordinates that have already been 'filled'
     */
    isValidGrid() {
        var allAvailableSquares = this.getAllAvailableSquares();
        if (allAvailableSquares.length === 0) return true;
        if (allAvailableSquares.length < 3) return false;

        var coordsToCheck: Array<Coordinate> = [];

        var connected = allAvailableSquares.map(this.getConnectedAvailableCoordinates);
        var isEveryBigEnough = connected.every(c => c.length >= 3);

        return isEveryBigEnough;
    }

    getAllAvailableSquares() {
        var freeSquares: Array<Coordinate> = [];
        this.gridRows.forEach((row, y) => {
            row.forEach((letter, x) => {
                letter = letter || '';
                if (letter.length === 0) return;
                freeSquares.push({ x, y });
            })
        })

        return freeSquares;
    }

    getConnectedAvailableCoordinates(start: Coordinate): Array<Coordinate> {
        var coords: Array<Coordinate> = this.getAdjacentAvailableCoordinates(start);
        coords.push(start);

        var isNotIn = (coordinate: Coordinate) => coords.every(coord => coord.x !== coordinate.x || coord.y !== coordinate.y);

        var connected: Array<Coordinate> = [];

        var get = (coordinate: Coordinate) => {
            if (!this.isAvailable(coordinate)) return null;
            var isAlreadyConnected = connected.some(coord => coord.x === coordinate.x && coord.y === coordinate.y);
            if (isAlreadyConnected) return null;

            connected.push(coordinate);

            get(this.getCoordinate(coordinate, Direction.Up));
            get(this.getCoordinate(coordinate, Direction.Right));
            get(this.getCoordinate(coordinate, Direction.Down));
            get(this.getCoordinate(coordinate, Direction.Left));
        }

        return connected;
    }

    toString(): string {
        return '';
    }
}

interface GridOptions {
    width: number;
    length: number;
}

interface Coordinate {
    x: number;
    y: number;
}

interface Designation extends Coordinate {
    letter: string;
}

const enum Direction {
    Up,
    Down,
    Left,
    Right
}