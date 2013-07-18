/* Go is a 2 player board game with simple rules. Two players alternate turns
 * placing stones on a grid. If a stone is surrounded on 4 sides by stones of
 * the opponent, it is captured. If a group of stones are surrounded, they are
 * captured.
 * See http://en.wikipedia.org/wiki/Rules_of_Go#Capture for a visual explanation.
 * 
 * Below is an implementation of a Go board. Please write some code in the
 * move() function to check for captures and output something when a capture
 * occurs. The sample moves represent a capture of two black stones.
 */
var timers = require('timers');

var Piece = function(color, val, str) {
    this.name = name;
    this.val = val;
    this.str = str;
    this.toString = function() { return this.str; };
}

var EMPTY = new Piece('empty', " - ");
var BLACK = new Piece("black", " X ");
var WHITE = new Piece("white", " o ");
var EDGE = new Piece(null, "");

var Board = function(n) {
    var n = n || 19;
    this.n = n;
    var board = new Array(n);
    var captured = new Array(n);

    for (var i = 0; i < n; i++) {
	board[i] = [];
	captured[i] = [];
	for (var j = 0; j < n; j++) {
	    board[i].push(EMPTY);
	    captured[i].push(false);
	}
    };
    this.captured = captured;
    this.board = board;
};

Board.prototype.toString = function() {
    var str = "";
    for (var i = 0; i < this.n; i++) {
	for (var j = 0; j < this.n; j++)
	    str += this.getPos(i, j).toString();
	str += "\n";
    }
    return str;
}

Board.prototype.getPos = function(row, col) {
    if ((row < 1) || (row >= this.n) || (col < 1) || (col >= this.n))
	return EDGE;
    else 
	return this.board[row][col];
}

Board.prototype.getCap = function(row, col) {
    if ((row < 1) || (row >= this.n) || (col < 1) || (col >= this.n))
	return false;
    return this.captured[row][col];
}
Board.prototype.getNeighbors = function(row, col) {
    var nb = [[row - 1,  col], [row,  col - 1],
	      [row + 1,  col], [row,  col + 1]];
    return nb;
}

Board.prototype.isCaptured = function(row, col) {
    var nb = this.getNeighbors(row, col);
    for (var i = 0; i < 4; i++) {
	if (this.getPos(nb[i][0], nb[i][1]) === EMPTY)
	    return false;
    }
    return true;
}

Board.prototype.getCaptured = function() {
    var cps = [];
    for (var i = 0; i < this.n; i++) {
	for (var j = 0; j < this.n; j++) {
	    if (this.getCap(i, j) )
		cps.push([this.getPos(i, j), i, j]);
	};
    };
    return cps;
};
	
Board.prototype.updateCaptured = function(r, c, color) {
    var caps = this.isCaptured(r, c);
    var captured = caps;
    this.captured[r][c] = caps;
    var nbs = this.getNeighbors(r, c);
    for (var i = 0; i < 4; i++) {
	caps = this.isCaptured(nbs[i][0], nbs[i][1]);
	this.captured[nbs[i][0]][nbs[i][1]] = caps;
	captured = captured || caps;
    }
    if (captured)
	return this.getCaptured();
}

Board.prototype.move = function(color, row, col) {
    var caps;
    try {
	if (this.getPos(row, col) !== EMPTY)
	    throw new Error("That space is already taken!");
	this.board[row][col] = color;
	caps = this.updateCaptured(row, col, color);
    } catch (e) {
	console.log(e.name + ": " + e.message);
    }
    return caps;
}	







function playGo() {
    var b = new Board(19);
    var interval;

    var i = 0;
    var moves = [[BLACK, 4, 4],
		 [BLACK, 4, 5],
		 [WHITE, 3, 4],
		 [WHITE, 3, 5],
		 [WHITE, 4, 3],
		 [WHITE, 4, 6],
		 [WHITE, 5, 4],
		 [WHITE, 5, 5]];
    function next() {
	if (i < moves.length) {
	    var caps = b.move.apply(b, moves[i]);
	    if (caps)
		console.log(caps.join());
	    console.log(b.toString());
	    i++;
	} else 
	    timers.clearInterval(interval);
    }

    interval = timers.setInterval(next, 1000);
}


playGo();




Board.prototype.forEach = function(f) {
    for (var i = 0; i < this.n; i++) {
	for (var j = 0; j < this.n; j++) {
	    f(this.getPos(i, j), i, j);
	};
    };
};
