function moveGen() {
	let out = Module.moveGen(encode());

	let legalMoves = [];
	for (let i = 0; i < out.size(); i++)
		legalMoves.push(out.get(i));

	if (legalMoves.length == 0) {
		gameOver = true;
		document.getElementById("resultText").textContent = Module.getAttacked(encode()) ? "Checkmate" : "Stalemate";
		setTimeout(() => document.getElementById("result").setAttribute("open", ""), 100);
	}

	return legalMoves;
}
function moveToUCI(move) {
	let asString = "";
    asString += notationToSAN(move.source);
    asString += notationToSAN(move.dest);
    if (move.promote != 0)
        asString += PIECES[move.promote].toLowerCase();
    return asString;
}
function moveToSAN(move) {
	if (move.isFill)
		return `${PIECES[move.piece]}>${move.dest}`;

	if (move.castle == 1)
		return "O-O";
	if (move.castle == 2)
		return "O-O-O";

	let source = notationToSAN(move.source);
	let dest = notationToSAN(move.dest);
	let capture = board[move.dest];

	let piece;
	if (move.source == -1)
		piece = PIECES[move.piece] + ">";
	else
		piece = PIECES[board[move.source]].toUpperCase();
	let promote = "";
	if (piece == "P") {
		piece = "";
		if (capture != 0)
			piece = notationToSAN(move.source)[0];
		if (move.promote != 0)
			promote = "=" + PIECES[move.promote];
	}

	let legalMoves = moveGen();
	let fileDes = "";
	let rankDes = "";
	for (let otherMove of legalMoves) {
		if (otherMove.source == -1)
			continue;
		if (PIECES[board[otherMove.source]].toUpperCase() == piece && otherMove.dest == move.dest) {
			if (moveToUCI(otherMove) == moveToUCI(move))
				continue;

			let otherSource = notationToSAN(otherMove.source);
			if (otherSource[0] == source[0])
				rankDes = source[1];
			if (otherSource[1] == source[1])
				fileDes = source[0];
		}
	}
	
	return piece + fileDes + rankDes + (capture == 0 ? "" : "x") + dest + promote; 
}

class Move {
    constructor(source, dest, castle, promote, isEp, piece, isFill) { 
        this.source = source;
        this.dest = dest;
        this.castle = castle;
        this.promote = promote;
        this.isEp = isEp;
		this.piece = piece;
		this.isFill = isFill;
    }
}