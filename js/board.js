const FILES = "abcdefgh";
const NUMBERS = "0123456789";

var board = [];

var enPassant = -1;

var K = false; // White Kingside
var Q = false; // White Queenside
var k = false; // Black Kingside
var q = false; // Black Queenside

var turn = false; // false = White, true = Black

var moveClock = 1;
var fiftyMoveClock = 0;

var whiteReserve = [];
var blackReserve = [];

function decode(fen) {
	board.length = 64;
	board.fill(-1);

	let result = fen.split(" ");

	turn = result[1] == "b";

	fiftyMoveClock = parseInt(result[4]);
	moveClock = parseInt(result[5]);

	K = false, Q = false, k = false, q = false;

	let castle = result[2];
	if (castle.includes("K"))
		K = true;
	if (castle.includes("Q"))
		Q = true;
	if (castle.includes("k"))
		k = true;
	if (castle.includes("q"))
		q = true;

	let ep = result[3];
	if (ep != "-") {
		enPassant = SANToNotation(ep);
	}

	let lines = result[0].split("/");

	for (let i = 0; i < 8; i++) {
		let cur = 0;
		let curRank = lines[i];
		for (let j = 0; j < curRank.length; j++) {
			if (NUMBERS.includes(curRank[j])) {
				cur += NUMBERS.indexOf(curRank[j]);
				continue;
			}

			board[i * 8 + cur] = PIECES.indexOf(curRank[j]);
			cur++;
		}
	}

	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			let index = i * 8 + j;
			if (board[index] == -1) {
				board[index] = 0;
				continue;
			}
		}
	}

	whiteReserve = [], blackReserve = [];
	if (result[6] != "-") {
		for (let i = 0; i < result[6].length; i++)
			whiteReserve.push(result[6][i]);
	}
	if (result[7] != "-") {
		for (let i = 0; i < result[7].length; i++)
			blackReserve.push(result[7][i].toLowerCase());
	}
}
function encode() {
	let fen = "";
	for (let i = 0; i < 8; i++) {
		let empty = 0;
		for (let j = 0; j < 8; j++) {
			if (board[i * 8 + j] == 0)
				empty++;
			else {
				if (empty != 0)
					fen += empty;
				empty = 0;
				fen += PIECES[board[i * 8 + j]];
			}
		}

		if (empty != 0)
			fen += empty;

		if (i < 7)
			fen += "/";
	}
	fen += " ";

	fen += turn ? 'b' : 'w';
	fen += " ";

	let castleRights = "";
	if (K)
		castleRights += "K";
	if (Q)
		castleRights += "Q";
	if (k)
		castleRights += "k";
	if (q)
		castleRights += "q";
	if (castleRights == "")
		castleRights = "-";
	fen += castleRights;
	fen += " ";

	if (enPassant == -1)
		fen += "-";
	else {
		let ep = notationToSAN(enPassant);
		fen += ep;
	}
	fen += ` ${fiftyMoveClock} ${moveClock} `;

	for (let i = 0; i < whiteReserve.length; i++)
		fen += whiteReserve[i];
	if (whiteReserve.length == 0)
		fen += "-";
	fen += " "
	for (let i = 0; i < blackReserve.length; i++)
		fen += blackReserve[i];;
	if (blackReserve.length == 0)
		fen += "-";

	return fen;
}

function validFEN(fen) {
	fen = fen.trim();

	let parts = fen.split(" ");
	if (parts.length != 6)
		return false;
	
	let ranks = parts[0].split("/");
	if (ranks.length != 8)
		return false;

	for (let line of ranks) {
		let length = 0;
		for (let char of line) {
			if (NUMBERS.includes(char))
				length += parseInt(char);
			else {
				if (PIECES.includes(char))
					length++;
				else
					return false;
			}
		}
		if (length != 8)
			return false;
	}

	if (!["w", "b"].includes(parts[1]))
		return false;

	let castle = parts[2];
	let used = new Map();
	if (castle != "-") {
		for (let char of castle) {
			if (!["K", "Q", "k", "q"].includes(char) || used.get(char))
				return false;
			used.set(char, true);
		}
	}

	let ep = parts[3];
	if (ep != "-") {
		let file = ep[0];
		let rank = parseInt(ep[1]);

		if (!FILES.includes(file))
			return false;
		if (rank < 1 || rank > 8)
			return false;
	}

	for (let i = 4; i <= 5; i++) {
		if (Number.isNaN(Number(parts[i])))
			return false;
	}

	return true;
}

function notationToXY(coord) {
	if (coord == -1 || board[coord] == -1)
		return "-1";

	let x = Math.floor(coord / 8).toString();
	let y = (coord % 8).toString();

	return x + y;
}

function notationToSAN(coord) {
	if (coord == -1 || board[coord] == -1)
		return "-1";

	let xy = notationToXY(coord);

	let y = 8 - NUMBERS.indexOf(xy[0]);
	let x = FILES[NUMBERS.indexOf(xy[1])];

	return x + y;
}

function SANToNotation(san) {
	let y = FILES.indexOf(san[0]);
	let x = 8 - parseInt(san[1]);
	return x * 8 + y;
}

function XYToNotation(xy) {
	return parseInt(xy[1]) + parseInt(xy[0]) * 8;
}

function printBoard() {
	console.log("+---+---+---+---+---+---+---+---+");

	for (let i = 0; i < 8; i++) {
		let line = "|";
		for (let j = 0; j < 8; j++) {
			let index = i * 8 + j;
			let print = " ";

			if (board[index] != 0)
				print = PIECES[board[index]];

			line += ` ${print} |`;
		}
		console.log(line);
		console.log("+---+---+---+---+---+---+---+---+");
	}

	console.log(`FEN: ${encode()}`);

	console.log(`White Kingside: ${K}	   White Queenside: ${Q}`);
	console.log(`Black Kingside: ${k}	   Black Queenside: ${q}`);

	console.log(`En Passant Square: ${enPassant == -1 ? "None" : notationToSAN(enPassant)}`);
	console.log(`Turn: ${turn ? "Black" : "White"}`);
}