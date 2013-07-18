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

var pieces = [{name: 'Empty', pict: '\033[40m\033[1;30m _|\033[0m'},
	      {name: 'Black', pict: '\033[30m\033[41m B|\033[0m'},
	      {name: 'White', pict: '\033[30m\033[47m W|\033[0m'}];

var EMPTY = 0;
var BLACK = 1;
var WHITE = 2;

var Board = function(n) {
    var n = n || 19;
    var board = new Array(n);
    for (var i = 0; i < n; i++) {
	board[i] = new Array(n);
	for (var j = 0; j < n; j++)
	    board[i].push(EMPTY);
    }
    this.n = n;
    this.board = board;
};

Board.prototype.get = function(r, c) {
    return this.board[r][c] || 0;
}

Board.prototype.toString = function() {
    var pad = " ";
    for (var i = ((60 - ((this.n + 1) * 3)) / 2); i > 0; i--)
	pad += " ";
    var str = pad + "  ";
    for (var i = 0; i < this.n; i++)
	str += (i < 10)? "  " + i: " " + i;

    for (var i = 0; i < this.n; i++) {
	str += "\n"+ pad + ((i < 10)? " ":"") + i + " ";
	for (var j = 0; j < this.n; j++)
	    str += pieces[this.get(i, j)].pict;
    };
    return str + "\n";
}
Board.prototype.capturedStr = function() {
    var caps = this.getCaptured();
    var str;
    var bstr = "";
    var wstr = "";

    for (var i = 0; i < this.n; i++) {
	for (var j = 0; j < this.n; j++) {
	    if (caps[i][j]) {
		var p = this.get(i, j);
		wstr += (p === WHITE)? "["+ i + ", " + j + "] ": "";
		bstr += (p === BLACK)? "["+ i + ", " + j + "] " : "";
	    }
	}
    }
    str = "\n\n Captured Black pieces: ";
    str += (bstr.length < 1)? "(none)" :  bstr;
    str += "\n Captured White pieces: ";
    str += (wstr.length < 1)? "(none)" : wstr;
    return str;
}
Board.prototype.isCaptured = function(r, c, caps) {
    function isCap(row, col, bd) {
	var p, nbs, nb, n, l;
	if (typeof caps[row] === 'undefined')
	    caps[row] = new Array(n);

	if (typeof caps[row][col] !== 'undefined')
	    return caps[row][col];
	
	caps[row][col] = true;

	p = bd.get(row, col);
	nbs = [];

	if (0 < row)
	    nbs.push([row - 1,  col]);
	if (0 < col) 
	    nbs.push([row,  col - 1]);
	if (row < (bd.n - 1))
	    nbs.push([row + 1,  col]);
	if (col < (bd.n - 1))
	    nbs.push([row,  col + 1]);

	for (var n = 0, l = nbs.length; n < l; n++) {
	    nb = bd.get(nbs[n][0], nbs[n][1]);
	    if ((nb === EMPTY) || ((nb === p) && (! (isCap(nbs[n][0],nbs[n][1], bd))))) {
		caps[row][col] = false;
		return false;
	    }
	}
	return true;
    };
    
    var c = isCap(r, c, this);
    return c;
}

Board.prototype.getCaptured = function() {
    var caps = [];
    for (var i = 0; i < this.n; i++) {
	for (var j = 0; j < this.n; j++)
	    this.isCaptured(i, j, caps);
    };
    return caps;
}
	

Board.prototype.move = function(color, row, col) {
    if (this.get(row, col) !== EMPTY)
	throw new Error("The space " + row + ", " + col + " is already taken!");
    this.board[row][col] = color;
    return this;
}

Board.prototype.remove = function(color) {
    var caps = this.getCaptured(color);
    var n = 0;
    for (var i = 0; i < this.n; i++) {
	for (var j = 0; j < this.n; j++) {
	    if (caps[i][j] && (this.get(i, j) === color)) {
		this.board[i][j] = EMPTY;
		n++;
	    }
	}
    }
    return n;
}

Board.prototype.showMove = function(move) {
    var mv;
    try {
	var mv = "\n " + pieces[move[0]].name + " on [" + move[1] + ", " + move[2] +']\n';
	this.move.apply(this, move);
	mv += this.toString() + this.capturedStr(); 
    } catch (e) {
	console.log(e.name + ": " + e.message);
    }
    return mv;
};
Board.prototype.showRemove = function(r) {
    var n = this.remove(r);
    return (n > 0)? "\n Removing " + pieces[r].name + ": \n" + this.toString() : null;
};

var Go = function(n) {
    this.board = new Board(n);
    this.turn = BLACK;
    this.wait = WHITE;
    this.next = function() {
	var t = this.turn;
	this.turn = this.wait;
	this.wait = t;
    };
    this.pass = 0;
};

Go.prototype.play = function(row, col, cb) {
    var interval, i = 0, timers = require('timers');
    var state = this.board.showMove([this.turn, row, col]);
    var states = [];
    if (state) {
	states.push(state);
	state = this.board.showRemove(this.wait);
	if (state) 
	    states.push(state);
	state = this.board.showRemove(this.turn);
	if (state)
	    states.push(state);
	this.next();
    }
    var l = states.length;
	
    var st = pieces[this.turn].name;
    function next() {
	if (i < l) {
	    console.log(states[i] + "\n");
	    i++;
	} else {
	    timers.clearInterval(interval);
	    cb(null, st );
	}
    }
    interval = timers.setInterval(next,500);
};


Go.prototype.start = function() {
    var self = this;
    repl = require("repl");
    function evalGo(cmd, context, filename, callback) {
	var mv;
	if (cmd.match(/pass/i)) {
	    if (self.pass > 0) {
		console.log('Game over.');
		process.exit();
	    }
	    self.pass = 1;
	    self.next();
	    callback(null, pieces[self.turn].name);
	} else {
	    mv = cmd.match(/[0-9]+/g);
	    if (mv) 
		self.play(parseInt(mv[0]),  parseInt(mv[1]), callback);
	    else {
		console.log("\nnot a correct move\n"); 
		callback(null, pieces[self.turn].name);
	    }
	}
    }

    console.log("Let's Play Go!\n");
    console.log(self.board.toString());
    repl.start({prompt: "Input Move: ",
		input: process.stdin,
		output: process.stdout,
		terminal: true,
		eval: evalGo,
		useColors: true,
		ignoreUndefined: true
	       }).on('exit', function() { console.log("\ngame over.\n");});
};


function play(board, moves) {
    for (var i = 0, l = moves.length; i < l; i++) 
	board.move.apply(board, moves[i]);
    return board;
}

var testBoard = new Board(19);

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

var capB1 = new Board(19);
//play(capB1, testMoves);
/*var cps = capB1.getCaptured(BLACK);
var cstr = "Captured black pieces:";
for (var i = 0; i < cps.length; i++) {
    for (var j = 0; j < cps[i].length; j++)
	cstr += (cps[i][j])? "["+ i + ", " + j + "] " : "";
}
var str = 
  //  cstr + 
 //   capB1.isCaptured(5, 5, new Array(19));
    
  //  
//capB1.toString(cps);
 //   capB1.board[3][3];
*/
//console.log(str);
//showMoves(new Board(5), set2, 1000);
//showMoves(testBoard, testMoves, 1000);

var game1 = new Go(10);
game1.start();

//console.log(capB1.toString());

function init(pos) {
    var n = pos.length;
    var b = new Board(n);
    for (var i = 0; i < n; i++) {
	for (var j = 0; j < n; j++)
	    b.board[i][j] = pos[i][j];
    }
    return b;
}
    

var pos1 =  [[0, 0, 0, 0, 0],
	     [0, 0, 1, 0, 0],
	     [0, 1, 2, 2, 2],
	     [0, 2, 1, 0, 2],
	     [1, 0, 2, 1, 1]];

var pos2 =  [[0, 0, 2, 0, 0],
	    [0, 0, 1, 0, 0],
	    [0, 1, 2, 2, 2],
	    [0, 2, 1, 1, 2],
	    [1, 0, 2, 1, 1]];
/*var b = init(pos1);
console.log(b.toString());
console.log(b.capturedStr());
b.move(BLACK, 3, 3);
b.remove(BLACK);
console.log(b.toString());
console.log(b.capturedStr());
b.remove(BLACK);
console.log(b.toString());
console.log(b.capturedStr());
*/
