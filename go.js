/* 
 * Erica von Buelow
 * evonbuelow@gmail.com
 * (818) 519- 1279
 *
 * Clever Interview Problem
 * 
 *
 * Go is a 2 player board game with simple rules. Two players alternate turns
 * placing stones on a grid. If a stone is surrounded on 4 sides by stones of
 * the opponent, it is captured. If a group of stones are surrounded, they are
 * captured.
 * See http://en.wikipedia.org/wiki/Rules_of_Go#Capture for a visual explanation.
 * 
 * Below is an implementation of a Go board. Please write some code in the
 * move() function to check for captures and output something when a capture
 * occurs. The sample moves represent a capture of two black stones.
 */

var EMPTY = 0;
var BLACK = 1;
var WHITE = 2;

// The Board object
var Board = function(n) {

    // size of board. Default: 19
    var n = n || 19; 

    // create n x n array of 0's
    var board = new Array(n); 

    for (var i = 0; i < n; i++) {
	board[i] = new Array(n);
	for (var j = 0; j < n; j++)
	    board[i][j] = EMPTY;
    }
 
    this.n = n; // board size
    this.board = board; // board object

    // cache of the locations of each piece of the colors
    this.colors = {}; 
    this.colors[WHITE] = {};
    this.colors[BLACK] = {};

    // cache of the locations of the neighbors of each piece
    this.neighbors = {};

}

// Format Board as String
Board.prototype.toString = function() {
    var str = '\n';
    for (var i = 0; i < this.n; i++) {
	for (var j = 0; j < this.n; j++)
	    str += (this.board[i][j] === EMPTY)? " _ " : " " + this.board[i][j] + " ";
	str += "\n";
    }
    return str;
}

// Function to get the locations of a piece's neighbors
// 'row' is the row, 'col' is the column of the piece
// returns array of locations (an array of row and column)
Board.prototype.getNeighbors = function(row, col) {

    // Look up neighbors in cache and return if found
    if (this.neighbors[[row, col]]) 
	return this.neighbors[[row, col]];

    var nbrs = [];

    // check edge conditions
    if (0 < row)
	nbrs.push([row - 1,  col]);
    if (0 < col) 
	nbrs.push([row,  col - 1]);
    if (row < (this.n - 1))
	nbrs.push([row + 1,  col]);
    if (col < (this.n - 1))
	nbrs.push([row,  col + 1]);

    // store new value
    this.neighbors[[row, col]] = nbrs;

    return nbrs;
}

// Function to see if a piece is captured.
// 'row' is the row, 'col' is the column of the piece
// 'caps' is an array storing calculated capture values
// returns 'true' if piece is captured, 'false' otherwise
Board.prototype.isCaptured = function(row, col, caps) {

    // Helper function to get if captured
    function captured(row, col, board) {
	var color, nbrs, n, l, nbr, i, j, c;

	// look up value and return if found
	if (caps[[row, col]]) 
	    return caps[[row, col]]; 
	
	caps[[row, col]] = true; // default
	color = board.board[row][col];
	nbrs = board.getNeighbors(row, col);

	// check if each neighboring piece is EMPTY 
	// or if the same color, that its not captured.
	for (n = 0, l = nbrs.length; n < l; n++) {
	    i = nbrs[n][0];
	    j = nbrs[n][1];
	    nbr = board.board[i][j];

	    if (nbr === EMPTY) {
		caps[[row, col]] = false;
		return false;
	    }
	    if (nbr === color) {
		c = captured(i, j, board);
		if (! c) {
		    caps[[row, col]] = false;
		    return false;
		}
	    }
	}
	// all neighbors are non-Empty/captured, return true;
	return true; 
    }
    // call helper on initial values and return result
    return captured(row, col, this); 
}

// Get the locations of all captured pieces of the color 'color'
Board.prototype.getCaptured = function(color) {
    var c;
    var res = [];
    var caps = {};

    for (var i in this.colors[color]) {
	c = this.colors[color][i];
	if (this.isCaptured(c[0], c[1], caps))
	    res.push(c);
    }

    return res;
}

// Remove all Captured pieces of color 'color' from board
Board.prototype.remove = function(color) {
    var captured = this.getCaptured(color);
    var c;
    for (var i = 0; i < captured.length; i++) {
	c = captured[i];
	this.board[c[0]][c[1]] = EMPTY;
	this.colors[color][c] = null;
    }
    return captured;
}

// Move a piece of color 'color' to the position 'row' x 'col'
// Logs if move captures any pieces.
Board.prototype.move = function(color, row, col) {

    // Set board at [row, col] to 'color'
    this.board[row][col] = color;

    // Save location in colors cache
    this.colors[color][[row, col]] = [row, col];

    // Remove any captured stones of the opponent
    var captured = (color === WHITE)? this.remove(BLACK) : this.remove(WHITE);

    // Log any captures
    if (captured.length > 0) {
	console.log("Opponent's Pieces captured: ");
	console.log(captured);
    }

    return this;
}


var b = new Board();

b.move(BLACK, 4, 4);
b.move(BLACK, 4, 5);
b.move(WHITE, 3, 4);
b.move(WHITE, 3, 5);
b.move(WHITE, 4, 3);
b.move(WHITE, 4, 6);
b.move(WHITE, 5, 4);
b.move(WHITE, 5, 5);

console.log(b.toString());
