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
    var n = n || 19; // size of board. Default: 19

    // create n x n array of 0's
    var board = new Array(n); 
    for (var i = 0; i < n; i++) {
	board[i] = new Array(n);
	for (var j = 0; j < n; j++)
	    board[i][j] = EMPTY;
    }
 
    this.n = n; // board size
    this.board = board; // board object

    this.neighbors = {}; // cache of coordinates of neighbors for pieces
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

// Get the coordinates for all pieces adjacent to piece
Board.prototype.getNeighbors = function(piece) {
    // Look up 'piece' in 'this.neighbors'
    var nbrs = this.neighbors[piece];
    // If 'piece' wasn't in cache, make list of neighboring points.
    if (typeof nbrs === 'undefined') {
	var row = piece[0];
	var col = piece[1];
	nbrs = [];
	// add to 'nbrs' each adjacent point that isn't off the board
	if (0 < row)
	    nbrs.push([row - 1,  col]);
	if (0 < col) 
	    nbrs.push([row,  col - 1]);
	if (row < (this.n - 1))
	    nbrs.push([row + 1,  col]);
	if (col < (this.n - 1))
	    nbrs.push([row,  col + 1]);
	// cache neighbors for point
	this.neighbors[piece] = nbrs;
    }
    // return the set of neighboring points
    return nbrs;
}


// Get coordinates of all pieces that are captured by the playing of 'color' at [row, col]
Board.prototype.getCaptured = function(row, col, color) {
    var capturedStore = {}; // cache of if points have been found to be captured 
    var board = this;
    var capturedPoints = []; // all captured points

    // Helper function to see if a piece is capturing. 'piece' is array of its position
    function isCaptured(piece) {
	var clr, n, captured, nbrs, i, len;
	// If a value for 'piece' is in cache, return the stored value
	captured = capturedStore[piece];
	if (typeof captured !== 'undefined')
	    return captured;

	capturedStore[piece] = true; // default value
	nbrs = board.getNeighbors(piece); // neighbors of piece

	// Check if each neighbor is capturing and if not, 
	// set 'piece' in 'captureStore' to FALSE and return FALSE.
	for (i = 0, len = nbrs.length; i < len; i++) {
	    n = nbrs[i];
	    clr = board.board[n[0]][n[1]];
	    // if neighbor is empty or not 'color' and calling isCaptured on it returns false
	    // store value of false of 'piece' and return false.
	    captured = (clr === EMPTY) ? false : ((clr === color) ? true : isCaptured(n));
	    if (! captured) {
		capturedStore[piece] = false;
		return false;
	    }
	}
	capturedPoints.push(piece); // add 'piece' to 'captured' list.
	return true;
    }
    // call helper on initial values
    isCaptured([row, col]);
    return capturedPoints;
}


// Remove all Captured pieces of color 'color' from board
Board.prototype.remove = function(row, col, color) {
    var captured = this.getCaptured(row, col, color);

    for (var i = 0; i < captured.length; i++)
	this.board[captured[i][0]][captured[i][1]] = EMPTY;

    return captured;
}

// Move a piece of color 'color' to ('row', 'col'). Logs any captured pieces.
Board.prototype.move = function(color, row, col) {
    // Place piece on board
    this.board[row][col] = color;
    // Remove any captured stones of the opponent
    var captured = this.remove(row, col, color);
    // Log any captures
    if (captured.length > 0) {
	console.log("Opponent's Pieces captured: ");
	console.log(captured);
    }
    return this;
}


var b = new Board();

/*b.move(BLACK, 4, 4);
b.move(BLACK, 4, 5);
b.move(WHITE, 3, 4);
b.move(WHITE, 3, 5);
b.move(WHITE, 4, 3);
b.move(WHITE, 4, 6);
b.move(WHITE, 5, 4);
b.move(WHITE, 5, 5);
b.move(BLACK, 0, 0);*/

var testMoves = [[BLACK, 4, 4],
		 [BLACK, 4, 5],
		 [WHITE, 3, 4],
		 [WHITE, 3, 5],
		 [WHITE, 4, 3],
		 [WHITE, 4, 6],
		 [WHITE, 5, 4],
		 [WHITE, 5, 5]];

var cap1 = [[BLACK, 4, 5],
	    [BLACK, 5, 5],
	    [BLACK, 6, 5],
	    [BLACK, 5, 6],
	    [BLACK, 6, 6],
	    [BLACK, 5, 7],
	    [BLACK, 4, 7],
	    
	    [WHITE, 4, 4],
	    [WHITE, 5, 4],
	    [WHITE, 6, 4],
	    [WHITE, 7, 5],
	    [WHITE, 7, 6],
	    [WHITE, 6, 7],
	    [WHITE, 5, 8],
	    [WHITE, 4, 8],
	    [WHITE, 3, 7],
	    [WHITE, 4, 6],
	    [WHITE, 3, 5]
	    ];
var set2 = [[BLACK, 0, 2],
	    [BLACK, 0, 3],

	    [WHITE, 1, 0],
	    [WHITE, 1, 1],
	    [WHITE, 1, 3],

	    [WHITE, 2, 0],
	    [BLACK, 2, 1],
	    [WHITE, 2, 2],
	    [BLACK, 2, 3],
	    [WHITE, 2, 4],

	    [BLACK, 3, 0],
	    [BLACK, 3, 2],
	    [BLACK, 3, 3],
	    [WHITE, 3, 4],
	    
	    [BLACK, 4, 0],
	    [BLACK, 4, 1],
	    [WHITE, 4, 2],
	    [WHITE, 4, 3],
	    
	    [WHITE, 3, 1]];

var moves = cap1;
console.log(b.toString());
for (var i = 0; i < moves.length; i++) {
    console.log(moves[i]);

    b.move.apply(b, moves[i]);   
 console.log(b.toString());
}

